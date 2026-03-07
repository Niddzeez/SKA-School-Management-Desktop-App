import { getPool } from "../../config/postgres";
import { logger } from "../../shared/observability/logger";

export interface FeeComponent {
    name: string;
    amount: number;
}

export interface FeeStructure {
    id: string;
    classId: string;
    academicSessionId: string;
    status: 'DRAFT' | 'ACTIVE';
    components: FeeComponent[];
}

export const feeStructureService = {
    async getAll(): Promise<FeeStructure[]> {
        const pool = getPool();
        const { rows } = await pool.query(`
            SELECT id, class_id as "classId", academic_session_id as "academicSessionId", status, components
            FROM fee_structures
        `);
        return rows;
    },

    async create(classId: string, academicYear: string): Promise<FeeStructure> {
        const pool = getPool();
        const { rows } = await pool.query(`
            INSERT INTO fee_structures (class_id, academic_session_id, status, components)
            VALUES ($1, $2, 'DRAFT', '[]'::jsonb)
            RETURNING id, class_id as "classId", academic_session_id as "academicSessionId", status, components
        `, [classId, academicYear]);
        return rows[0];
    },

    async addComponent(id: string, name: string, amount: number): Promise<FeeStructure> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows: structureRows } = await client.query(`
                SELECT status FROM fee_structures WHERE id = $1 FOR UPDATE
            `, [id]);

            if (structureRows.length === 0) throw new Error("Fee structure not found");
            if (structureRows[0].status !== 'DRAFT') throw new Error("Cannot modify non-DRAFT fee structure");

            const newComponent = { name, amount };
            const { rows } = await client.query(`
                UPDATE fee_structures
                SET components = components || $1::jsonb
                WHERE id = $2
                RETURNING id, class_id as "classId", academic_session_id as "academicSessionId", status, components
            `, [JSON.stringify(newComponent), id]);

            await client.query('COMMIT');
            return rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async removeComponent(id: string, componentId: string): Promise<FeeStructure> {
        // Here componentId is the component name for simplicity, based on existing structure unless it has an id.
        // Assuming componentId = name to match the specification (frontend uses component name or id, let's look at it if needed).
        const pool = getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows: structureRows } = await client.query(`
                SELECT status, components FROM fee_structures WHERE id = $1 FOR UPDATE
            `, [id]);

            if (structureRows.length === 0) throw new Error("Fee structure not found");
            if (structureRows[0].status !== 'DRAFT') throw new Error("Cannot modify non-DRAFT fee structure");

            // Remove component by name (or id if they have ids)
            const { rows } = await client.query(`
                UPDATE fee_structures
                SET components = (
                    SELECT jsonb_agg(comp) 
                    FROM jsonb_array_elements(components) AS comp 
                    WHERE comp->>'name' != $1
                )
                WHERE id = $2
                RETURNING id, class_id as "classId", academic_session_id as "academicSessionId", status, components
            `, [componentId, id]);

            // Handle case where components array becomes null if all are removed
            if (rows.length > 0 && !rows[0].components) {
                const { rows: fixedRows } = await client.query(`
                    UPDATE fee_structures
                    SET components = '[]'::jsonb
                    WHERE id = $1
                    RETURNING id, class_id as "classId", academic_session_id as "academicSessionId", status, components
                `, [id]);
                await client.query('COMMIT');
                return fixedRows[0];
            }

            await client.query('COMMIT');
            return rows[0];
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async activate(id: string): Promise<void> {
        const pool = getPool();
        const { rowCount } = await pool.query(`
            UPDATE fee_structures
            SET status = 'ACTIVE'
            WHERE id = $1
        `, [id]);

        if (rowCount === 0) throw new Error("Fee structure not found");
    }
};
