const fs = require('fs').promises;
const path = require('path');

class FileManager {
    constructor(baseDir = './data') {
        this.baseDir = baseDir;
    }

    /**
     * Ensures a collection directory exists.
     * @param {string} collection 
     */
    async ensureCollection(collection) {
        const colPath = path.join(this.baseDir, collection);
        await fs.mkdir(colPath, { recursive: true });
        return colPath;
    }

    /**
     * Writes data to a file atomically.
     */
    async writeAtomic(filePath, data) {
        const tempPath = `${filePath}.tmp`;
        const content = JSON.stringify(data, null, 2);
        
        // 1. Write to temporary file
        await fs.writeFile(tempPath, content, 'utf8');
        
        // 2. Ensure data is flushed to physical disk (Durability)
        const fd = await fs.open(tempPath, 'r+');
        await fd.sync();
        await fd.close();

        // 3. Atomic rename
        await fs.rename(tempPath, filePath);
    }

    /**
     * Reads and parses a JSON file.
     */
    async readJSON(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (err) {
            if (err.code === 'ENOENT') return null; // File not found
            throw err;
        }
    }

    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
    }
}

module.exports = FileManager; 