const fs = require('fs');
const path = require('path');

const directories = [
    'research',
    'src/db',
    'src/storage',
    'src/benchmarks',
    'data/.transactions',
    'data/.wal',
    'data/.locks',
    'data/.idempotency',
    'backups'
];

async function initializeProject() {
    console.log("🏗️  Initializing File-Based Database Structure...");

    for (const dir of directories) {
        const fullPath = path.join(__dirname, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`✅ Created: ${dir}`);
        } else {
            console.log(`🟡 Exists:  ${dir}`);
        }
    }

    // Create a dummy package.json to define as an ES module or CommonJS
    const packageJson = {
        name: "fs-database-project",
        version: "1.0.0",
        description: "Pure Node.js File-Based Database",
        main: "src/cli.js",
        scripts: {
            test: "node src/benchmarks/index-performance.js"
        }
    };

    fs.writeFileSync(
        path.join(__dirname, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
    );

    console.log("\n🚀 Structure ready. Time to commit these folders!");
}

initializeProject().catch(console.error);