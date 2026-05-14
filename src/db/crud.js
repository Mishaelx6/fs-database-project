const { randomUUID } = require('crypto');
const path = require('path');

class CrudManager {
    constructor(fileManager) {
        this.fm = fileManager;
    }

    /**
     * CREATE: Wraps data in metadata and saves it.
     */
    async insert(collection, data) {
        const id = data.id || randomUUID();
        const record = {
            id,
            data,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deletedAt: null,
            _version: 1
        };

        const colPath = await this.fm.ensureCollection(collection);
        const filePath = path.join(colPath, `${id}.json`);
        
        await this.fm.writeAtomic(filePath, record);
        return record;
    }

    /**
     * READ: Fetches a single record by ID.
     */
    async findById(collection, id) {
        const colPath = path.join(this.fm.baseDir, collection);
        const filePath = path.join(colPath, `${id}.json`);
        const record = await this.fm.readJSON(filePath);
        
        // Filter out soft-deleted records
        if (!record || record.deletedAt) return null;
        return record;
    }

    /**
     * UPDATE: Merges new data, increments version, and updates timestamp.
     */
    async update(collection, id, updates) {
        const existing = await this.findById(collection, id);
        if (!existing) throw new Error(`Record ${id} not found in ${collection}`);

        const updatedRecord = {
            ...existing,
            data: { ...existing.data, ...updates },
            updatedAt: Date.now(),
            _version: existing._version + 1
        };

        const colPath = path.join(this.fm.baseDir, collection);
        const filePath = path.join(colPath, `${id}.json`);
        await this.fm.writeAtomic(filePath, updatedRecord);
        return updatedRecord;
    }

    /**
     * DELETE: Supports both hard and soft deletes.
     */
    async delete(collection, id, hardDelete = false) {
        const colPath = path.join(this.fm.baseDir, collection);
        const filePath = path.join(colPath, `${id}.json`);

        if (hardDelete) {
            await this.fm.deleteFile(filePath);
            return { id, deleted: 'hard' };
        } else {
            // Soft delete: keep the file but mark it deleted at the top level
            const existing = await this.fm.readJSON(filePath);
            if (!existing) throw new Error(`Record ${id} not found in ${collection}`);
            
            const deletedRecord = {
                ...existing,
                deletedAt: Date.now(),
                updatedAt: Date.now(),
                _version: existing._version + 1
            };
            
            await this.fm.writeAtomic(filePath, deletedRecord);
            return deletedRecord;
        }
    }
}

module.exports = CrudManager;