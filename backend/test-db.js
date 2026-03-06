const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.POSTGRES_URI });
async function test() {
  await client.connect();
  try {
    const res = await client.query('SELECT id, name, start_date, end_date, is_closed, closed_at, created_at FROM academic_sessions ORDER BY start_date DESC');
    console.log("Success", res.rows);
  } catch (err) {
    console.error("Query Error:", err);
  }
  await client.end();
}
test().catch(console.error);
