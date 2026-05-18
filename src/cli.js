const readline = require('readline');
const Database = require('./db/database');

const db = new Database();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '🔗 custom-db > '
});

console.log("==================================================");
console.log("🖥️  Welcome to the Custom Database Interactive Shell");
console.log("Available commands: ");
console.log("  insert [collection] [key=value key2=value2]");
console.log("  find-id [collection] [id]");
console.log("  exit");
console.log("==================================================\n");

rl.prompt();

rl.on('line', async (line) => {
    const args = line.trim().split(' ');
    const command = args[0];

    try {
        switch (command) {
            case 'insert': {
                const collection = args[1];
                if (!collection) { console.log("❌ Error: Missing collection name."); break; }
                
                // Parse key=value properties from CLI typing
                const data = {};
                for (let i = 2; i < args.length; i++) {
                    const [key, val] = args[i].split('=');
                    if (key && val) data[key] = isNaN(val) ? val : Number(val);
                }
                
                const result = await db.insert(collection, data);
                console.log(`\n✅ Document Inserted Successfully!`);
                console.log(JSON.stringify(result, null, 2));
                break;
            }

            case 'find-id': {
                const collection = args[1];
                const id = args[2];
                if (!collection || !id) { console.log("❌ Error: Usage: find-id [collection] [id]"); break; }
                
                const record = await db.findById(collection, id);
                if (record) {
                    console.log(JSON.stringify(record, null, 2));
                } else {
                    console.log("⚠️ Record not found.");
                }
                break;
            }

            case 'exit':
                console.log("Shutting down engine terminal. Goodbye!");
                process.exit(0);
                break;

            default:
                if (command) console.log(`❌ Unknown system command: "${command}"`);
                break;
        }
    } catch (err) {
        console.error(`💥 Runtime Execution Error:`, err.message);
    }
    
    rl.prompt();
});