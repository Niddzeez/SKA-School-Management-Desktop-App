const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.POSTGRES_URI });
  await client.connect();
  const sql = fs.readFileSync('sql/001_financial_schema.sql', 'utf8');
  await client.query(sql);
  console.log('Schema created');
  
  // Insert a test row to verify
  await client.query("INSERT INTO academic_sessions (name, start_date, end_date, is_closed) VALUES ('2025-26', '2025-04-01', '2026-03-31', false) ON CONFLICT DO NOTHING;");
  
  await client.end();
}
run().catch(console.error);
