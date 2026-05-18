const Database = require('../../db/database');

async function run() {
    const db = new Database();
    
    console.log("📦 Populating store inventory items...");
    await db.insert('products', { name: "Laptop", price: 1200 });
    await db.insert('products', { name: "Mouse", price: 25 });
    await db.insert('products', { name: "Keyboard", price: 75 });
    await db.insert('products', { name: "HDMI Cable", price: 15 });
    await db.insert('products', { name: "Monitor", price: 300 });

    console.log("✅ Products inserted safely across shard directories.\n");

    console.log("🔍 RUNNING QUERY: Products over $20, sorted from cheapest to priciest, Page 1 (Limit 2)...");
    
    const queryResult = await db.find('products', {
        where: (product) => product.price > 20, // Filter out anything under $20
        sortBy: 'price',                       // Sort based on price string keys
        order: 'asc',                          // Ascending order
        page: 1,                               // Give me page 1
        limit: 2                               // Max 2 items per page
    });

    console.log("\n📊 QUERY RESULTS METADATA:", queryResult.info);
    console.log("\n🛍️  ITEMS ON THIS PAGE:");
    queryResult.results.forEach(item => {
        console.log(`- ${item.data.name}: $${item.data.price} (Version: ${item._version})`);
    });
}

run().catch(console.error);