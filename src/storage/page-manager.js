const fs = require('fs');
const path = require('path');

class PageManager {
    constructor(baseDir, pageSizeBytes = 4096) { // 4KB Pages
        this.baseDir = baseDir;
        this.pageSizeBytes = pageSizeBytes;
    }

    /**
     * Appends a record into a collection's current active page file
     */
    async writeToPage(collection, record) {
        const collectionDir = path.join(this.baseDir, collection);
        if (!fs.existsSync(collectionDir)) {
            fs.mkdirSync(collectionDir, { recursive: true });
        }

        let pageId = 0;
        let pagePath = path.join(collectionDir, `page_${pageId}.bin`);

        // Find the first page that has enough empty space
        while (fs.existsSync(pagePath) && fs.statSync(pagePath).size >= this.pageSizeBytes) {
            pageId++;
            pagePath = path.join(collectionDir, `page_${pageId}.bin`);
        }

        // Standardize data string wrapper with a clear newline delimiter
        const dataString = JSON.stringify(record) + '\n';
        
        // Append the record to the page safely
        await fs.promises.appendFile(pagePath, dataString, 'utf8');
        
        return { page: `page_${pageId}.bin`, offset: pageId };
    }

    /**
     * Reads and parses all data line-by-line out of a block page
     */
    async readAllFromPages(collection) {
        const collectionDir = path.join(this.baseDir, collection);
        if (!fs.existsSync(collectionDir)) return [];

        const files = fs.readdirSync(collectionDir).filter(f => f.startsWith('page_'));
        let records = [];

        for (const file of files) {
            const content = await fs.promises.readFile(path.join(collectionDir, file), 'utf8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                records.push(JSON.parse(line));
            }
        }
        return records;
    }
}

module.exports = PageManager;