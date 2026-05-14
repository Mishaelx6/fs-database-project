const FileManager = require('./file-manager');
const path = require('path');
const assert = require('assert');

async function testFM() {
    const fm = new FileManager(path.join(__dirname, '../../data'));
    const testFile = path.join(__dirname, '../../data/test_collection/test.json');

    console.log("🧪 Testing FileManager...");

    // Ensure directory
    await fm.ensureCollection('test_collection');

    // Test Atomic Write
    const sampleData = { hello: "world", timestamp: Date.now() };
    await fm.writeAtomic(testFile, sampleData);
    console.log("✅ Atomic write successful.");

    // Test Read
    const readBack = await fm.readJSON(testFile);
    assert.strictEqual(readBack.hello, "world");
    console.log("✅ Data integrity verified.");

    // Cleanup
    await fm.deleteFile(testFile);
    console.log("✅ Cleanup successful. FileManager is solid.");
}

testFM().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});