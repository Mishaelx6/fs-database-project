const FileManager = require('../storage/file-manager');
const CrudManager = require('./crud');
const path = require('path');
const assert = require('assert');

async function testCRUD() {
    const fm = new FileManager(path.join(__dirname, '../../data'));
    const db = new CrudManager(fm);
    const collection = 'test_users';

    console.log("🧪 Testing CRUD Logic...");

    // 1. Test Create
    const user = await db.insert(collection, { name: "Alice", role: "admin" });
    assert.ok(user.id, "ID should be generated");
    assert.strictEqual(user._version, 1);
    console.log(`✅ Created user: ${user.id}`);

    // 2. Test Read
    const found = await db.findById(collection, user.id);
    assert.strictEqual(found.data.name, "Alice");
    console.log("✅ Read verified.");

    // 3. Test Update
    const updated = await db.update(collection, user.id, { role: "super-admin" });
    assert.strictEqual(updated.data.role, "super-admin");
    assert.strictEqual(updated._version, 2, "Version should increment");
    console.log("✅ Update and versioning verified.");

    // 4. Test Soft Delete
    await db.delete(collection, user.id, false);
    const afterDelete = await db.findById(collection, user.id);
    assert.strictEqual(afterDelete, null, "Should not find soft-deleted record");
    console.log("✅ Soft-delete verified.");
}

testCRUD().catch(console.error);