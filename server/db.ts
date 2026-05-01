import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'scholarix_crm',
  user: process.env.DB_USER || 'scholarix',
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

function toPositional(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

class D1PreparedStatement {
  private sql: string;
  private params: unknown[] = [];

  constructor(sql: string) {
    this.sql = sql;
  }

  bind(...values: unknown[]): this {
    this.params = values;
    return this;
  }

  async first<T = unknown>(): Promise<T | null> {
    const converted = toPositional(this.sql);
    const result = await pool.query(converted, this.params);
    return (result.rows[0] as T) ?? null;
  }

  async all<T = unknown>(): Promise<{ results: T[] }> {
    const converted = toPositional(this.sql);
    const result = await pool.query(converted, this.params);
    return { results: result.rows as T[] };
  }

  async run(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }> {
    const sqlUpper = this.sql.trim().toUpperCase();
    const converted = toPositional(this.sql);

    if (sqlUpper.startsWith('INSERT') && !sqlUpper.includes('RETURNING')) {
      try {
        const result = await pool.query(`${converted} RETURNING id`, this.params);
        const last_row_id = result.rows[0]?.id ?? 0;
        return { success: true, meta: { last_row_id, changes: result.rowCount ?? 0 } };
      } catch (err: any) {
        // Table has no 'id' column (e.g. lead_tags has composite PK)
        if (err.code === '42703') {
          const result = await pool.query(converted, this.params);
          return { success: true, meta: { last_row_id: 0, changes: result.rowCount ?? 0 } };
        }
        throw err;
      }
    }

    const result = await pool.query(converted, this.params);
    return { success: true, meta: { last_row_id: 0, changes: result.rowCount ?? 0 } };
  }
}

export const db = {
  prepare(sql: string): D1PreparedStatement {
    return new D1PreparedStatement(sql);
  },
};
