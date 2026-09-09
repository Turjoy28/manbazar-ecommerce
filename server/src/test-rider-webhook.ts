import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const API_BASE = "http://localhost:5001/api/v1";

async function runTest() {
    console.log("=================================================");
    console.log("🏍️ Testing Steadfast & Pathao Rider Webhook Flow");
    console.log("=================================================");

    const dbUri = process.env.DATABASE_URI || "";
    if (!dbUri) {
        console.error("DATABASE_URI missing in .env");
        process.exit(1);
    }
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB successfully");

    const db = mongoose.connection.db!;
    const order = await db.collection("orders").findOne({}, { sort: { createdAt: -1 } });
    if (!order) {
        console.error("No test order found.");
        process.exit(1);
    }

    const orderId = order._id.toString();
    const sfConsignmentId = `SF-RIDER-${Date.now()}`;
    const sfTrackingCode = `TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // 1. Assign courier
    await db.collection("orders").updateOne(
        { _id: order._id },
        {
            $set: {
                "courier.provider": "steadfast",
                "courier.consignmentId": sfConsignmentId,
                "courier.trackingCode": sfTrackingCode,
                "courier.rawStatus": "in_transit",
                status: "in_transit",
            },
        }
    );
    console.log(`Order ${orderId} setup with Steadfast consignment: ${sfConsignmentId}`);

    // 2. Test Steadfast Webhook: Assign Rider (out_for_delivery)
    console.log("\n📡 1. Triggering Steadfast webhook with assigned delivery rider...");
    const sfPayload = {
        consignment_id: sfConsignmentId,
        delivery_status: "out_for_delivery",
        rider_name: "Md. Shakil Hasan",
        rider_phone: "01712345678",
        tracking_message: "Package out for delivery with nearest rider",
        updated_at: new Date().toISOString(),
    };

    const sfRes = await fetch(`${API_BASE}/courier/webhooks/steadfast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sfPayload),
    });
    const sfData = await sfRes.json() as any;
    console.log(`Steadfast Webhook response: ${sfRes.status}`, sfData);

    const updatedSfOrder = await db.collection("orders").findOne({ _id: order._id });
    console.log(`Order status: ${updatedSfOrder?.status}`);
    console.log("Rider details:", updatedSfOrder?.courier?.rider);

    const sfPassed =
        updatedSfOrder?.status === "out_for_delivery" &&
        updatedSfOrder?.courier?.rider?.name === "Md. Shakil Hasan" &&
        updatedSfOrder?.courier?.rider?.phone === "01712345678";

    console.log(sfPassed ? "Steadfast Rider Webhook: PASSED ✅" : "Steadfast Rider Webhook: FAILED ❌");

    // 3. Test Pathao Webhook: Assign Rider (order.assigned_for_delivery)
    console.log("\n📡 2. Triggering Pathao webhook with assigned delivery rider...");
    const pathaoConsignment = `PATHAO-${Date.now()}`;
    await db.collection("orders").updateOne(
        { _id: order._id },
        {
            $set: {
                "courier.provider": "pathao",
                "courier.consignmentId": pathaoConsignment,
                "courier.trackingCode": pathaoConsignment,
                "courier.rawStatus": "in_transit",
                status: "in_transit",
            },
        }
    );

    const pathaoPayload = {
        consignment_id: pathaoConsignment,
        merchant_order_id: orderId,
        event: "order.assigned_for_delivery",
        delivery_rider_name: "Tanvir Ahmed",
        delivery_rider_phone: "01887654321",
        timestamp: Date.now(),
    };

    const pathaoRes = await fetch(`${API_BASE}/courier/webhooks/pathao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pathaoPayload),
    });
    const pathaoData = await pathaoRes.json() as any;
    console.log(`Pathao Webhook response: ${pathaoRes.status}`, pathaoData);

    const updatedPathaoOrder = await db.collection("orders").findOne({ _id: order._id });
    console.log(`Order status: ${updatedPathaoOrder?.status}`);
    console.log("Rider details:", updatedPathaoOrder?.courier?.rider);

    const pathaoPassed =
        updatedPathaoOrder?.status === "out_for_delivery" &&
        updatedPathaoOrder?.courier?.rider?.name === "Tanvir Ahmed" &&
        updatedPathaoOrder?.courier?.rider?.phone === "01887654321";

    console.log(pathaoPassed ? "Pathao Rider Webhook: PASSED ✅" : "Pathao Rider Webhook: FAILED ❌");

    // 4. Verify /orders/track API returns rider
    console.log("\n🔍 3. Verifying /orders/track API returns rider info...");
    const phone = updatedPathaoOrder?.customer?.phone;
    if (phone) {
        const trackRes = await fetch(`${API_BASE}/orders/track?phone=${encodeURIComponent(phone)}`);
        const trackJson = await trackRes.json() as any;
        const trackedOrder = trackJson.data?.find((o: any) => o._id === orderId);
        console.log("Track API returned rider:", trackedOrder?.courier?.rider);
        if (trackedOrder?.courier?.rider?.name === "Tanvir Ahmed") {
            console.log("Track API Rider Verification: PASSED ✅");
        } else {
            console.log("Track API Rider Verification: FAILED ❌");
        }
    }

    await mongoose.disconnect();
    console.log("\nAll tests completed!");
    process.exit(sfPassed && pathaoPassed ? 0 : 1);
}

runTest().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
