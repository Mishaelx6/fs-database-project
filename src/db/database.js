const path = require('path');
const FileManager = require('../storage/file-manager');
const CrudManager = require('./crud');
const PartitionManager = require('./partitioning');
const IndexingManager = require('./indexing');
const IdempotencyManager = require('./idempotency');
const TransactionManager = require('./transactions');
const QueryEngine = require('./query'); // <-- Make sure this line is here!

class Database {
    constructor(options = {}) {
        const rootDataPath = options.baseDir || path.resolve(__dirname, '../../data');
        
        this.fm = new FileManager(rootDataPath);
        this.crud = new CrudManager(this.fm);
        this.partitioner = new PartitionManager(options.shards || 4);
        this.indexer = new IndexingManager(this.fm);
        this.idempotency = new IdempotencyManager(this.fm);
        this.tx = new TransactionManager(this);
        this.queryEngine = new QueryEngine(this.fm); // <-- Make sure this line is here!
    }

    // 1. Normal Insert Command
    async insert(collection, data, indexFields = []) {
        const id = data.id || require('crypto').randomUUID();
        const shardName = this.partitioner.getShardName(id);
        const shardedCollectionPath = path.join(collection, shardName);
        const record = await this.crud.insert(shardedCollectionPath, { ...data, id });
        for (const field of indexFields) {
            if (data[field]) await this.indexer.updateIndex(collection, field, data[field], id);
        }
        return record;
    }

    // 2. Safe Insert Command (Idempotency)
    async insertSafe(collection, idempotencyKey, data, indexFields = []) {
        const isNew = await this.idempotency.processKey(idempotencyKey);
        if (!isNew) {
            console.log(`🛡️ Idempotency Guard: Blocked duplicate request for key [${idempotencyKey}]`);
            return { status: "ignored", message: "Duplicate request prevented." };
        }
        console.log(`✅ Idempotency Guard: Approved new request [${idempotencyKey}]`);
        const record = await this.insert(collection, data, indexFields);
        return { status: "success", record };
    }

    // 3. Find by ID Command
    async findById(collection, id) {
        const shardName = this.partitioner.getShardName(id);
        const shardedCollectionPath = path.join(collection, shardName);
        return await this.crud.findById(shardedCollectionPath, id);
    }

    // 4. Find by Index Command
    async findByIndex(collection, field, value) {
        const id = await this.indexer.lookup(collection, field, value);
        if (!id) return null;
        return await this.findById(collection, id);
    }

    /**
     * 5. CRITICAL QUERY COMMAND: Make sure this is sitting right here 
     * inside the class brackets before the final "module.exports"!
     */
    async find(collection, options) {
        return await this.queryEngine.find(collection, options);
    }
} // <-- This brace closes the Database class

module.exports = Database;