import { Pool, PoolClient } from "pg";
import pg from "pg";

pg.types.setTypeParser(1082, (val: string) => val);
/**
 * Single shared connection pool for the Finance & Audit subsystem.
 *
 * Rules (from SYSTEM_RULES.md):
 *   - Financial data must be stored only in PostgreSQL
 *   - Financial services must never query MongoDB directly
 *   - All financial mutations must run inside database transactions
 *
 * The pool is initialised once at server startup via connectPostgres().
 * All financial modules import `pgPool` to acquire clients.
 */

let pgPool: Pool | null = null;

export const connectPostgres = async (): Promise<void> => {
    const connectionString = process.env.POSTGRES_URI;

    if (!connectionString) {
        throw new Error("POSTGRES_URI is not set in environment");
    }

    pgPool = new Pool({ connectionString });

    // Verify the connection is live before the server starts accepting requests
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    client.release();

    console.log("🟦 PostgreSQL connected (finance subsystem)");
};

/**
 * Returns the shared pool.
 * Throws if called before connectPostgres() has completed —
 * this guards against financial routes accidentally running before DB is ready.
 */
export const getPool = (): Pool => {
    if (!pgPool) {
        throw new Error(
            "PostgreSQL pool is not initialised. Ensure connectPostgres() is called at startup."
        );
    }
    return pgPool;
};

/**
 * Runs a callback inside a single PostgreSQL transaction.
 * Commits on success, rolls back on any error.
 *
 * Usage (Phase 5+):
 *   await withTransaction(async (client) => {
 *     await client.query("INSERT INTO payments ...");
 *   });
 */
export const withTransaction = async <T>(
    fn: (client: PoolClient) => Promise<T>
): Promise<T> => {
    const client = await getPool().connect();
    try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};