const path = require('path');

class IdempotencyManager {
    constructor(fileManager) {
        this.fm = fileManager;
        // This locks the target folder straight into data/.idempotency
        this.basePath = path.join(this.fm.baseDir, '.idempotency');
    }

    /**
     * Checks if a key exists. If not, it saves it.
     */
    async processKey(key, ttlHours = 24) {
        // 1. Tell the file manager to make sure data/.idempotency exists
        await this.fm.ensureCollection('.idempotency');
        
        // 2. Point directly to the ticket file (e.g., data/.idempotency/payment_req_999.json)
        const keyPath = path.join(this.basePath, `${key}.json`);

        // 3. Look inside that folder to see if the file exists
        const existingRecord = await this.fm.readJSON(keyPath);
        
        if (existingRecord) {
            const isExpired = Date.now() > existingRecord.expiresAt;
            if (!isExpired) {
                return false; // STOP! This is a duplicate double-click!
            }
        }

        // 4. Wrap up the ticket details
        const ticket = {
            key,
            processedAt: Date.now(),
            expiresAt: Date.now() + (ttlHours * 60 * 60 * 1000)
        };

        // 5. Hand it to the librarian to write it into data/.idempotency/
        await this.fm.writeAtomic(keyPath, ticket);
        return true; // Approved! Proceed with the operation.
    }
}

module.exports = IdempotencyManager;