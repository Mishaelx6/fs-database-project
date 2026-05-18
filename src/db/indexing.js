const path = require('path');

class IndexingManager {
    constructor(fileManager) {
        this.fm = fileManager;
        // This is our memory map so we don't have to constantly read the hard drive
        // It will look like: { "users_email": { "alice@test.com": "user_123" } }
        this.memoryMap = {}; 
    }

    /**
     * Updates the cheat sheet and saves it to a special .idx file
     */
    async updateIndex(collection, field, value, recordId) {
        const indexName = `${collection}_${field}`;
        const indexPath = path.join(this.fm.baseDir, collection, `${indexName}.idx`);
        
        // 1. Load the index from disk if we haven't yet
        if (!this.memoryMap[indexName]) {
            const existingIndex = await this.fm.readJSON(indexPath);
            this.memoryMap[indexName] = existingIndex || {};
        }

        // 2. Add the new shortcut mapping (Value -> ID)
        this.memoryMap[indexName][value] = recordId;

        // 3. Save the cheat sheet back to disk so we don't lose it
        await this.fm.writeAtomic(indexPath, this.memoryMap[indexName]);
    }

    /**
     * Instantly finds an ID based on a field value
     */
    async lookup(collection, field, value) {
        const indexName = `${collection}_${field}`;
        const indexPath = path.join(this.fm.baseDir, collection, `${indexName}.idx`);
        
        // Load index if it's not in memory
        if (!this.memoryMap[indexName]) {
            const existingIndex = await this.fm.readJSON(indexPath);
            this.memoryMap[indexName] = existingIndex || {};
        }

        // Return the ID, or null if it doesn't exist
        return this.memoryMap[indexName][value] || null;
    }
}

module.exports = IndexingManager;