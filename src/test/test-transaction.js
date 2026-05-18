const Database = require('../db/database');

async function run() {
    const db = new Database();
    
    console.log("🏦 --- SCENARIO 1: Successful Money Transfer (Commit) ---");
    const tx1 = await db.tx.begin();

    // Stage taking $10 from Alice
    await db.tx.stageInsert(tx1, 'accounts', { name: "Alice", balance: 90, id: "alice_id" });
    // Stage giving $10 to Bob
    await db.tx.stageInsert(tx1, 'accounts', { name: "Bob", balance: 110, id: "bob_id" });

    // Everything went great, let's commit!
    await db.tx.commit(tx1);

    // Let's verify Alice actually has $90 now
    const aliceCheck = await db.findById('accounts', 'alice_id');
    console.log(`Verified Alice Balance: $${aliceCheck.data.balance}`);


    console.log("\n💥 --- SCENARIO 2: System Crash Simulation (Rollback) ---");
    const tx2 = await db.tx.begin();

    // Stage changing Alice's balance to $50
    await db.tx.stageInsert(tx2, 'accounts', { name: "Alice", balance: 50, id: "alice_id" });
    
    console.log("⚡ ERROR SIMULATION: Power went out before Bob got his money!");
    // Trigger rollback to rescue the data!
    await db.tx.rollback(tx2);

    // Read Alice again. Because of the rollback, she should STILL have $90!
    const aliceRescueCheck = await db.findById('accounts', 'alice_id');
    console.log(`Verified Alice Balance after Rollback: $${aliceRescueCheck.data.balance} (Saved from losing money!)`);
}

run().catch(console.error);