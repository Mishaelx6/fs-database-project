const Database = require('../db/database');

async function run() {
    const db = new Database();
    
    console.log("🏗️  Inserting users and creating an email index...");

    // Insert user and tell the DB to index the 'email' field
    await db.insert('users', { 
        name: "Alice", 
        email: "alice@example.com" 
    }, ['email']); // <-- We are telling the boss to index the email!

    await db.insert('users', { 
        name: "Bob", 
        email: "bob@example.com" 
    }, ['email']);

    console.log("✅ Users saved.");
    console.log("🔍 Looking up Alice by her email...");

    // Find Alice using ONLY her email
    const foundUser = await db.findByIndex('users', 'email', 'alice@example.com');
    
    if (foundUser) {
        console.log(`🎉 Found her! Her ID is ${foundUser.id} and her name is ${foundUser.data.name}`);
    } else {
        console.log("❌ Could not find user.");
    }
}

run().catch(console.error);
