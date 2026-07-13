import config from "../src/config/index.js";

async function run() {
    console.log("Loading configuration...");
    const apiKey = config.steadfast.api_key;
    const apiSecret = config.steadfast.api_secret;
    
    if (!apiKey || !apiSecret) {
        console.error("❌ CRITICAL: API credentials not found.");
        console.error("Please make sure you have saved your .env file and STEADFAST_API_KEY / STEADFAST_API_SECRET are present.");
        return;
    }
    console.log("✅ API keys successfully loaded from environment!");

    // Create a dummy payload to test authentication and validation on Steadfast's end
    const dummyOrder = {
        invoice: `TEST-INV-${Date.now()}`,
        recipient_name: "Test Developer",
        recipient_phone: "01711111111", // Valid 11-digit BD number
        recipient_address: "House 1, Road 2, Test Area, Dhaka",
        cod_amount: 100, // Minimal test amount
        note: "This is a system integration test from backend."
    };

    console.log(`\n[STEADFAST] Dispatching dummy test order for invoice: ${dummyOrder.invoice}...`);

    try {
        const response = await fetch("https://portal.packzy.com/api/v1/create_order", {
            method: "POST",
            headers: {
                "Api-Key": apiKey,
                "Secret-Key": apiSecret,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dummyOrder),
        });

        if (!response.ok) {
            let errorData: any;
            try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
            console.error(`\n❌ [STEADFAST API ERROR] Status: ${response.status}`);
            console.error(`   └─ Details:`, errorData);
            console.log("\n-> If you got 'Unauthorized' or 'Unauthenticated', your keys are incorrect.");
            console.log("-> If you got validation errors, the test payload might need adjustment for your specific account settings.");
            return;
        }

        const data = await response.json();
        console.log(`\n✅ [STEADFAST] SUCCESS! Your credentials and integration are working perfectly!`);
        console.log(`   └─ Consignment ID: ${data.consignment_id}`);
        console.log(`   └─ Tracking Code:  ${data.tracking_code}`);
        
    } catch (error: any) {
        console.error(`\n❌ [STEADFAST NETWORK ERROR]`, error.message);
    }
}

run().catch(console.error);
