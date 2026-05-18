const Database = require('./src/db/database');

async function runTest() {
    const db = new Database();
    
    console.log("🏗️  Testing our database team with 5 game consoles...");

    const savedIds = [];

    // 1. Test Sharded Insertions
    const consoles = ["PlayStation", "Xbox", "Nintendo Switch", "Sega Genesis", "GameBoy"];
    
    for (const name of consoles) {
        const record = await db.insert('consoles', { consoleName: name });
        savedIds.push(record.id);
        console.log(`✅ Saved ${name}! Boss routed it to its room.`);
    }

    console.log("\n🔍 Let's try reading one back instantly using our math trick...");
    
    // 2. Test Sharded Reads
    const testId = savedIds[0];
    const found = await db.findById('consoles', testId);
    
    console.log(`🤖 Boss successfully retrieved: "${found.data.consoleName}" from its secret shard path!`);
}

runTest().catch(console.error);