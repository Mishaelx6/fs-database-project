const Database = require('../../db/database');



async function run() {
    const db = new Database();
    
    console.log("💳 Testing the 'Double Click' scenario...");

    const paymentData = { item: "Super Mario 64", amount: 50 };
    const ticketKey = "payment_req_999"; // The receipt ticket

    // Click 1: The first attempt
    console.log("\n👉 [Click 1] Processing payment...");
    const attempt1 = await db.insertSafe('orders', ticketKey, paymentData);
    
    // Click 2: The accidental double-click!
    console.log("\n👉 [Click 2] Oh no, user double-clicked! Processing again...");
    const attempt2 = await db.insertSafe('orders', ticketKey, paymentData);

    // Click 3: Another accidental click!
    console.log("\n👉 [Click 3] Processing again...");
    const attempt3 = await db.insertSafe('orders', ticketKey, paymentData);

    console.log("\n🎉 Finished. Go check your data/orders/ folder.");
    console.log("Even though we clicked 3 times, you should only see ONE order created!");
}

run().catch(console.error);