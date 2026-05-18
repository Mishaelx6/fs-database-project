const path = require('path');
const FileManager = require('../storage/file-manager');
const CrudManager = require('./crud');
const PartitionManager = require('./partitioning');

class Database {
    constructor(options = {}) {
        // 1. Hire all our workers and give them their tools
        this.fm = new FileManager(options.baseDir || './data');
        this.crud = new CrudManager(this.fm);
        this.partitioner = new PartitionManager(options.shards || 4);
    }

    /**
     * THE BOSS COMMAND FOR INSERTING DATA
     */
    async insert(collection, data) {
        // 1. Generate a unique ID if the data doesn't have one
        const id = data.id || require('crypto').randomUUID();

        // 2. Call the Partition worker to calculate the right shard room name
        const shardName = this.partitioner.getShardName(id);
        
        // 3. Glue the collection name and room name together (e.g., "users/shard_2")
        const shardedCollectionPath = path.join(collection, shardName);

        // 4. Send the data package to the CRUD worker, but tell them to save it 
        // inside the specific sharded folder path!
        const record = await this.crud.insert(shardedCollectionPath, { ...data, id });
        
        return record;
    }

    /**
     * THE BOSS COMMAND FOR READING DATA BY ID
     */
    async findById(collection, id) {
        // 1. Ask the Partition worker: "Where did we put this ID?"
        const shardName = this.partitioner.getShardName(id);
        
        // 2. Figure out the exact folder path where it lives
        const shardedCollectionPath = path.join(collection, shardName);
        
        // 3. Tell CRUD to go open that specific folder and pull out the file
        return await this.crud.findById(shardedCollectionPath, id);
    }
}

module.exports = Database;