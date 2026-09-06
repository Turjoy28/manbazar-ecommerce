const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(process.cwd(), '.env') });

mongoose.connect(process.env.DATABASE_URI).then(async () => {
    const db = mongoose.connection.db;
    const order = await db.collection('orders').findOneAndUpdate(
        { 'customer.phone': '01845313765' },
        { $set: { 'courier.consignmentId': 'MOCK-CONSIGNMENT-001', 'courier.provider': 'steadfast' } },
        { returnDocument: 'after' }
    );
    console.log('Assigned fake consignment id:', order.value.courier.consignmentId);
    
    // Simulate webhook
    return fetch('http://localhost:5001/api/v1/courier/webhooks/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer undefined' },
        body: JSON.stringify({
            consignment_id: 'MOCK-CONSIGNMENT-001',
            status: 'delivered',
            tracking_message: 'Wow, delivered instantly by live simulation!',
            updated_at: new Date().toISOString()
        })
    });
}).then(res => res.json()).then(data => {
    console.log('Webhook result:', data);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
