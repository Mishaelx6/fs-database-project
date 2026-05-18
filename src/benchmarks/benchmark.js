const Database = require('../db/database');

async function startBenchmark() {
    const db = new Database();
    const totalRecords = 100;
    const collection = 'benchmark_tests';

    console.log(`⚡ STARTING PERFORMANCE BENCHMARK ⚡`);
    console.log(`Running operations with ${totalRecords} records...\n`);

    // --- 1. BENCHMARK INSERTS ---
    const insertStart = Date.now();
    const generatedIds = [];

    for (let i = 0; i < totalRecords; i++) {
        const record = await db.insert(collection, {
            sku: `PROD-${i}`,
            stock: Math.floor(Math.random() * 500),
            active: true
        });
        generatedIds.push(record.id);
    }
    const insertEnd = Date.now();
    const insertDuration = insertStart === insertEnd ? 1 : (insertEnd - insertStart);
    const insertsPerSecond = Math.round((totalRecords / insertDuration) * 1000);

    // --- 2. BENCHMARK READS (FIND BY ID) ---
    const readStart = Date.now();
    for (const id of generatedIds) {
        await db.findById(collection, id);
    }
    const readEnd = Date.now();
    const readDuration = readStart === readEnd ? 1 : (readEnd - readStart);
    const readsPerSecond = Math.round((totalRecords / readDuration) * 1000);

    // --- 3. BENCHMARK QUERIES (SCAN & FILTER) ---
    const queryStart = Date.now();
    // Run a heavy filter operation across all shards
    await db.find(collection, {
        where: (item) => item.stock > 250,
        sortBy: 'stock',
        order: 'desc',
        limit: 10
    });
    const queryEnd = Date.now();
    const queryDuration = queryStart === queryEnd ? 1 : (queryEnd - queryStart);

    // --- 📊 DISPLAY RESULTS TABLE ---
    console.log("--------------------------------------------------");
    console.log("🏁 BENCHMARK RESULTS SUMMARY");
    console.log("--------------------------------------------------");
    console.table([
        { 
            "Operation Type": "Bulk Inserts (Write)", 
            "Total Count": totalRecords, 
            "Time Taken": `${insertDuration} ms`, 
            "Speed": `${insertsPerSecond} ops/sec` 
        },
        { 
            "Operation Type": "Point Lookups (Read)", 
            "Total Count": totalRecords, 
            "Time Taken": `${readDuration} ms`, 
            "Speed": `${readsPerSecond} ops/sec` 
        },
        { 
            "Operation Type": "Complex Query (Filter/Sort)", 
            "Total Count": "Full Scan", 
            "Time Taken": `${queryDuration} ms`, 
            "Speed": "N/A" 
        }
    ]);
    console.log("--------------------------------------------------");
    console.log("🎉 Benchmark complete! Data securely distributed across shards.");
}

startBenchmark().catch(console.error);