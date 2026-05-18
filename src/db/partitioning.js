const { createHash } = require('crypto');
const path = require('path');

class PartitionManager {
    constructor(numShards = 4) {
        // We decide how many shard rooms we want. Let's use 4!
        this.numShards = numShards; 
    }

    /**
     * THE MATH TRICK: Turns any ID into a room name (shard_0, shard_1, etc.)
     */
    getShardName(id) {
        // 1. We take the ID and turn it into a long, scrambled code using MD5 hashing
        const hash = createHash('md5').update(id).digest('hex');
        
        // 2. We grab the first 8 characters of that code and turn it into a number
        const hashNum = parseInt(hash.substring(0, 8), 16);
        
        // 3. The Modulo Trick: Any number % 4 always leaves a remainder of 0, 1, 2, or 3
        const shardId = hashNum % this.numShards;
        
        // 4. Return the final room name
        return `shard_${shardId}`;
    }
}

module.exports = PartitionManager;