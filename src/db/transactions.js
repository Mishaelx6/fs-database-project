const path = require('path');
const { randomUUID } = require('crypto');

class TransactionManager {
    constructor(database) {
        this.db = database; // Access the main database boss
        this.activeTransactions = {}; // Temporary memory workspace for ongoing transactions
    }

    /**
     * Start a new transaction session
     */
    async begin() {
        const txId = `tx_${randomUUID().substring(0, 8)}`;
        this.activeTransactions[txId] = {
            status: 'PENDING',
            operations: [] // A list of changes waiting to be finalized
        };
        console.log(`⏱️  Transaction [${txId}] started.`);
        return txId;
    }

    /**
     * Stage an insert operation inside the transaction instead of writing it immediately
     */
    async stageInsert(txId, collection, data, indexFields = []) {
        const tx = this.activeTransactions[txId];
        if (!tx || tx.status !== 'PENDING') {
            throw new Error(`Transaction ${txId} is not active.`);
        }

        // Generate the ID now so we can track it
        const id = data.id || randomUUID();
        
        // Save this operation in memory for later
        tx.operations.push({
            type: 'INSERT',
            collection,
            data: { ...data, id },
            indexFields
        });

        console.log(`📝 Staged INSERT for ID [${id.substring(0,8)}...] inside Transaction [${txId}]`);
        return id;
    }

    /**
     * COMMIT: Apply all staged operations permanently to the database
     */
    async commit(txId) {
        const tx = this.activeTransactions[txId];
        if (!tx || tx.status !== 'PENDING') {
            throw new Error(`Transaction ${txId} is not active.`);
        }

        console.log(`🚀 Committing Transaction [${txId}]...`);

        // Execute every operation we saved in our list
        for (const op of tx.operations) {
            if (op.type === 'INSERT') {
                // Actually push it into the real sharded folders and indices!
                await this.db.insert(op.collection, op.data, op.indexFields);
            }
        }

        tx.status = 'COMMITTED';
        delete this.activeTransactions[txId]; // Clean up memory
        console.log(`✨ Transaction [${txId}] committed successfully! All changes are permanent.`);
    }

    /**
     * ROLLBACK: Forget and throw away all staged operations
     */
    async rollback(txId) {
        const tx = this.activeTransactions[txId];
        if (!tx || tx.status !== 'PENDING') {
            throw new Error(`Transaction ${txId} is not active.`);
        }

        console.log(`🔄 Rolling back Transaction [${txId}]! Throwing away all staged changes.`);
        
        tx.status = 'ROLLED_BACK';
        delete this.activeTransactions[txId]; // Discard the staging list completely
        console.log(`🧹 Transaction [${txId}] wiped out clean. No changes were saved to disk.`);
    }
}

module.exports = TransactionManager;