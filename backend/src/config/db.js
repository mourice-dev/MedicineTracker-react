import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

let sqlClient = null;

function stripWrappingQuotes(value) {
  if (!value) return value;
  return value.replace(/^"|"$/g, "");
}

function getDbUrl() {
  const fromEnv = stripWrappingQuotes(process.env.DATABASE_URL);
  if (fromEnv) return fromEnv;

  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  if (!DB_USER || !DB_HOST || !DB_PORT || !DB_NAME) {
    throw new Error("Missing database configuration. Set DATABASE_URL or DB_* variables.");
  }

  return `postgres://${DB_USER}:${DB_PASSWORD || ""}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

function getSqlClient() {
  if (!sqlClient) {
    const dbUrl = getDbUrl();
    sqlClient = postgres(dbUrl, {
      ssl: "require",
      max: 10,
      // Pooler deployments can fail with prepared statements.
      prepare: false,
    });
  }

  return sqlClient;
}

export function sql() {
  return getSqlClient();
}

/**
 * Backwards compatibility layer for legacy MySQL query structure
 * Convert named parameters (:param) to positional ones ($1, $2)
 */
export async function query(sqlString, params = {}) {
  let counter = 1;
  const values = [];

  // Replace named placeholders with positional ones (e.g., :email -> $1)
  let positionalSql = sqlString.replace(/:([a-zA-Z0-9_]+)/g, (match, paramName) => {
    values.push(params[paramName]);
    return `$${counter++}`;
  });

  // Automatically append 'RETURNING id' for INSERT statements to support MySQL's result.insertId
  const isInsert = /^\s*INSERT\s+INTO/i.test(positionalSql);
  if (isInsert && !/RETURNING/i.test(positionalSql)) {
    positionalSql += " RETURNING id";
  }

  try {
    const rows = await getSqlClient().unsafe(positionalSql, values);
    
    // Polyfill the 'insertId' property that MySQL originally returned
    if (isInsert && rows.length > 0 && rows[0].id) {
      rows.insertId = rows[0].id;
    }
    
    return rows;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
}
