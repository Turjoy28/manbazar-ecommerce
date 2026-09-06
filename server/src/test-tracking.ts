/**
 * Manual E2E Test: Courier Tracking Flow
 * 
 * This script:
 * 1. Finds a real order from your database
 * 2. Assigns it a fake courier (steadfast) with a tracking code
 * 3. Simulates a webhook hit to update tracking status
 * 4. Tells you the phone number to search on /track
 * 
 * Run: npx tsx src/test-tracking.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const API_BASE = "http://localhost:5001/api/v1";

async function main() {
    // 1. Connect to DB
    const dbUri = process.env.DATABASE_URI || "";
    if (!dbUri) {
        console.error("❌ DATABASE_URI not found in .env");
        process.exit(1);
    }
    
    await mongoose.connect(dbUri);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db!;
    
    // 2. Find a real order
    const order = await db.collection("orders").findOne({}, { sort: { createdAt: -1 } });
    if (!order) {
        console.error("❌ No orders found in the database. Place a test order first.");
        process.exit(1);
    }

    const orderId = order._id.toString();
    const phone = order.customer?.phone || "N/A";
    const name = order.customer?.name || "N/A";

    console.log("═══════════════════════════════════════════════════");
    console.log("📦 Found Order:");
    console.log(`   ID:     ${orderId}`);
    console.log(`   Name:   ${name}`);
    console.log(`   Phone:  ${phone}`);
    console.log(`   Status: ${order.status}`);
    console.log("═══════════════════════════════════════════════════\n");

    // 3. Manually assign courier tracking fields to this order
    const fakeConsignmentId = `TEST-${Date.now()}`;
    const fakeTrackingCode = `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    await db.collection("orders").updateOne(
        { _id: order._id },
        {
            $set: {
                "courier.provider": "steadfast",
                "courier.consignmentId": fakeConsignmentId,
                "courier.trackingCode": fakeTrackingCode,
                "courier.rawStatus": "pending",
                "courier.lastSyncedAt": new Date(),
                status: "courier_assigned",
                // Also set legacy fields for backward compat
                courierName: "steadfast",
                courierTrackingCode: fakeTrackingCode,
                courierConsignmentId: fakeConsignmentId,
                courierStatus: "dispatched",
            },
            $push: {
                trackingHistory: {
                    status: "courier_assigned",
                    rawStatus: "pending",
                    message: "Order dispatched to Steadfast Courier",
                    location: "",
                    provider: "steadfast",
                    eventId: `${fakeConsignmentId}-dispatched-${Date.now()}`,
                    timestamp: new Date(),
                },
            } as any,
        }
    );

    console.log("✅ Step 1: Courier assigned to order");
    console.log(`   Provider:       steadfast`);
    console.log(`   Consignment ID: ${fakeConsignmentId}`);
    console.log(`   Tracking Code:  ${fakeTrackingCode}`);
    console.log(`   Status:         courier_assigned\n`);

    // 4. Test the tracking API
    console.log("═══════════════════════════════════════════════════");
    console.log("🔍 Testing Tracking API...");
    const trackRes = await fetch(`${API_BASE}/orders/track?phone=${encodeURIComponent(phone)}`);
    const trackData = await trackRes.json() as any;
    console.log(`   GET /orders/track?phone=${phone}`);
    console.log(`   Response: ${trackData.success ? "✅ Success" : "❌ Failed"}`);
    console.log(`   Orders found: ${trackData.data?.length || 0}`);
    
    if (trackData.data?.length > 0) {
        const tracked = trackData.data[0];
        console.log(`   First order status: ${tracked.status}`);
        console.log(`   Courier provider:   ${tracked.courier?.provider || "N/A"}`);
        console.log(`   Tracking code:      ${tracked.courier?.trackingCode || "N/A"}`);
        console.log(`   History entries:     ${tracked.trackingHistory?.length || 0}`);
    }
    console.log("═══════════════════════════════════════════════════\n");

    // 5. Simulate a webhook (status: in_transit)
    console.log("🚀 Simulating Steadfast webhook (status → in_transit)...");
    const webhookPayload = {
        consignment_id: fakeConsignmentId,
        status: "delivered",
        tracking_message: "Package has been delivered to the recipient",
        updated_at: new Date().toISOString(),
    };

    const webhookRes = await fetch(`${API_BASE}/courier/webhooks/steadfast`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer `, // Empty token, will be allowed in dev if no token is set
        },
        body: JSON.stringify(webhookPayload),
    });
    const webhookData = await webhookRes.json() as any;
    console.log(`   Webhook response: ${webhookRes.status} ${webhookData.success ? "✅" : "❌"}`);

    // 6. Verify the update
    const updatedOrder = await db.collection("orders").findOne({ _id: order._id });
    console.log(`   Order status after webhook: ${updatedOrder?.status}`);
    console.log(`   Tracking history count:     ${updatedOrder?.trackingHistory?.length || 0}\n`);

    // 7. Print manual test instructions
    console.log("═══════════════════════════════════════════════════");
    console.log("🧪 MANUAL VERIFICATION STEPS:");
    console.log("═══════════════════════════════════════════════════");
    console.log("");
    console.log(`1. 🌐 Open Client Tracking Page:`);
    console.log(`   http://localhost:3000/track`);
    console.log(`   Enter phone: ${phone}`);
    console.log(`   → You should see the order with status timeline`);
    console.log("");
    console.log(`2. 🔧 Open Admin Panel:`);
    console.log(`   http://localhost:3003`);
    console.log(`   → Log in and go to Orders`);
    console.log(`   → Find order ORD-${orderId.slice(-10).toUpperCase()}`);
    console.log(`   → Click "View details" to see Courier & Tracking section`);
    console.log("");
    console.log(`3. 📡 Test Real-Time Update (run in another terminal):`);
    console.log(`   curl -X POST http://localhost:5001/api/v1/courier/webhooks/steadfast \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"consignment_id":"${fakeConsignmentId}","status":"delivered","tracking_message":"Package delivered to customer","updated_at":"${new Date().toISOString()}"}'`);
    console.log("");
    console.log(`   → Admin Orders table should update live (toast notification)`);
    console.log(`   → Client /track page should update the timeline live`);
    console.log("═══════════════════════════════════════════════════\n");

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
