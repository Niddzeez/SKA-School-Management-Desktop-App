import { getPool } from "../../config/postgres";
import { logger } from "../../shared/observability/logger";
import { randomUUID } from "crypto";

export interface FeeComponent {
    id: string;
    name: string;
    amount: number;
    mandatory: boolean;
}

export interface FeeStructure {
    id: string;
    classId: string;
    academicSessionId: string;
    status: 'DRAFT' | 'ACTIVE';
    components: FeeComponent[];
    createdAt: string | Date;
}

export const feeStructureService = {
    async getAll(sessionId?: string): Promise<FeeStructure[]> {
        const pool = getPool();

        if (sessionId) {
            const { rows } = await pool.query(
                `
            SELECT 
                id,
                class_id as "classId",
                academic_session_id as "academicSessionId",
                status,
                components
            FROM fee_structures
            WHERE academic_session_id = $1
            `,
                [sessionId]
            );

            return rows;
        }

        const { rows } = await pool.query(`
        SELECT 
            id,
            class_id as "classId",
            academic_session_id as "academicSessionId",
            status,
            components
        FROM fee_structures
    `);

        return rows;
    },
    async create(classId: string, academicSessionId: string): Promise<FeeStructure> {
        const pool = getPool();
        const { rows } = await pool.query(`
            INSERT INTO fee_structures (class_id, academic_session_id, status, components)
            VALUES ($1, $2, 'DRAFT', '[]'::jsonb)
            RETURNING id, class_id as "classId", academic_session_id as "academicSessionId", status, components, created_at as "createdAt"
        `, [classId, academicSessionId]);
        return rows[0];
    },

    async addComponent(id: string, name: string, amount: number, mandatory: boolean): Promise<FeeStructure> {
        const pool = getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows: structureRows } = await client.query(`
                SELECT status FROM fee_structures WHERE id = $1 FOR UPDATE
            `, [id]);

            if (structureRows.length === 0) throw new Error("Fee structure not found");
            if (structureRows[0].status !== 'DRAFT') throw new Error("Cannot modify non-DRAFT fee structure");

            // Neon Postgres requires pgcrypto for uuid generation natively in PG13+, but we just generate it here in Node for simplicity
            const newComponentId = randomUUID();
            const newComponent = { id: newComponentId, name, amount, mandatory };
            const { rows } = await client.query(`
                UPDATE fee_structures
                SET components = components || $1::jsonb
                WHERE id = $2
                RETURNING id, class_id as "classId", academic_session_id as "academicSessionId", status, components, created_at as "createdAt"
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
        const pool = getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows: structureRows } = await client.query(`
                SELECT status, components FROM fee_structures WHERE id = $1 FOR UPDATE
            `, [id]);

            if (structureRows.length === 0) throw new Error("Fee structure not found");
            if (structureRows[0].status !== 'DRAFT') throw new Error("Cannot modify non-DRAFT fee structure");

            // Remove component by id
            const { rows } = await client.query(`
                UPDATE fee_structures
                SET components = COALESCE(
                    (
                        SELECT jsonb_agg(comp) 
                        FROM jsonb_array_elements(components) AS comp 
                        WHERE comp->>'id' != $1
                    ), '[]'::jsonb
                )
                WHERE id = $2
                RETURNING id, class_id as "classId", academic_session_id as "academicSessionId", status, components, created_at as "createdAt"
            `, [componentId, id]);

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

        // Read the structure and its components
        const { rows } = await pool.query(
            `
        SELECT components
        FROM fee_structures
        WHERE id = $1
        `,
            [id]
        );

        if (rows.length === 0) {
            throw new Error("Fee structure not found");
        }

        const components = rows[0].components;

        if (!Array.isArray(components) || components.length === 0) {
            throw new Error("Cannot activate a fee structure with no components");
        }

        // Activate the structure
        const { rowCount } = await pool.query(
            `
        UPDATE fee_structures
        SET status = 'ACTIVE'
        WHERE id = $1
        `,
            [id]
        );

        if (rowCount === 0) {
            throw new Error("Fee structure not found");
        }
    }
};
