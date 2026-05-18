const fs = require('fs');
const path = require('path');

class QueryEngine {
    constructor(fileManager) {
        this.fm = fileManager;
    }

    /**
     * Executes a full query with filters, sorting, and pagination
     */
    async find(collection, options = {}) {
        const { where, sortBy, order = 'asc', page = 1, limit = 10 } = options;
        const collectionPath = path.join(this.fm.baseDir, collection);
        
        let records = [];

        // 1. Scan all shard directories inside the collection folder
        if (!fs.existsSync(collectionPath)) return [];
        const shards = fs.readdirSync(collectionPath).filter(f => f.startsWith('shard_'));

        for (const shard of shards) {
            const shardPath = path.join(collectionPath, shard);
            const files = fs.readdirSync(shardPath).filter(f => f.endsWith('.json'));

            for (const file of files) {
                const record = await this.fm.readJSON(path.join(shardPath, file));
                // Ignore missing or soft-deleted items
                if (record && !record.deletedAt) {
                    records.push(record);
                }
            }
        }

        // 2. FILTERING LOGIC
        // Example: where = (item) => item.price > 20
        if (where && typeof where === 'function') {
            records = records.filter(record => where(record.data));
        }

        // 3. SORTING LOGIC
        if (sortBy) {
            records.sort((a, b) => {
                const valA = a.data[sortBy];
                const valB = b.data[sortBy];

                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // 4. PAGINATION LOGIC
        // Calculate where to start cutting the array cake
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = records.slice(startIndex, endIndex);

        return {
            info: {
                totalRecords: records.length,
                page,
                limit,
                totalPages: Math.ceil(records.length / limit)
            },
            results: paginatedResults
        };
    }
}

module.exports = QueryEngine;