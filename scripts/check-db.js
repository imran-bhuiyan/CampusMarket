const { pool } = require('../backend-express/config/db');
require('dotenv').config({ path: '../backend-express/.env' });

async function checkSchema() {
    try {
        console.log('Checking users table schema...');
        const [columns] = await pool.execute('SHOW COLUMNS FROM users');
        console.log(columns.map(c => `${c.Field} (${c.Type})`));

        const isBannedCol = columns.find(c => c.Field === 'isBanned');
        if (isBannedCol) {
            console.log('✅ isBanned column exists');
        } else {
            console.error('❌ isBanned column MISSING');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
