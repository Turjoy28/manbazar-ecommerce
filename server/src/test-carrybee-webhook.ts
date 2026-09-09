import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const API_BASE = "http://localhost:5001";

async function testCarryBee() {
    console.log("=================================================");
    console.log("🐝 Testing CarryBee Webhook & Rider Auto-Assign");
    console.log("=================================================");

    const dbUri = process.env.DATABASE_URI || "";
    await mongoose.connect(dbUri);
    console.log("Connected to MongoDB successfully");

    const db = mongoose.connection.db!;
    const order = await db.collection("orders").findOne({}, { sort: { createdAt: -1 } });
    if (!order) {
        console.error("No test order found.");
        process.exit(1);
    }

    const orderId = order._id.toString();
    const cbConsignment = `CB-RIDER-${Date.now()}`;

    // Setup order
    await db.collection("orders").updateOne(
        { _id: order._id },
        {
            $set: {
                "courier.provider": "carrybee",
                "courier.consignmentId": cbConsignment,
                "courier.trackingCode": cbConsignment,
                "courier.rawStatus": "in_transit",
                status: "in_transit",
            },
        }
    );
    console.log(`Order ${orderId} setup with CarryBee consignment: ${cbConsignment}`);

    // 1. Test unauthorized request (invalid header)
    console.log("\n🔒 1. Testing unauthorized webhook header...");
    const unauthRes = await fetch(`${API_BASE}/api/webhook/cashback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CB-Webhook-Integration-Header": "invalid-secret-key",
        },
        body: JSON.stringify({ consignment_id: cbConsignment }),
    });
    console.log(`Response status (expected 401): ${unauthRes.status}`);

    // 2. Test authorized request to /api/webhook/cashback with rider data
    console.log("\n📡 2. Testing /api/webhook/cashback with valid secret & auto rider assignment...");
    const payload = {
        consignment_id: cbConsignment,
        transfer_status_id: 8,
        rider_name: "Habibullah Rider",
        rider_phone: "01988776655",
        message: "Out for delivery with Habibullah Rider",
    };

    const authRes = await fetch(`${API_BASE}/api/webhook/cashback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CB-Webhook-Integration-Header": "40489fe0-9386-4fc9-8e92-2b2fcb9d451c",
        },
        body: JSON.stringify(payload),
    });
    const authJson = await authRes.json() as any;
    console.log(`Response: ${authRes.status}`, authJson);

    const updatedOrder = await db.collection("orders").findOne({ _id: order._id });
    console.log(`Updated status: ${updatedOrder?.status}`);
    console.log("Updated rider:", updatedOrder?.courier?.rider);

    const passed =
        unauthRes.status === 401 &&
        authRes.status === 200 &&
        updatedOrder?.status === "out_for_delivery" &&
        updatedOrder?.courier?.rider?.name === "Habibullah Rider" &&
        updatedOrder?.courier?.rider?.phone === "01988776655";

    console.log(passed ? "\nCarryBee Webhook Test: PASSED ✅" : "\nCarryBee Webhook Test: FAILED ❌");

    await mongoose.disconnect();
    process.exit(passed ? 0 : 1);
}

testCarryBee().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
