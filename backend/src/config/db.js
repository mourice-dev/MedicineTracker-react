/** @format */

import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

let sqlClient = null;
let clientAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

function stripWrappingQuotes(value) {
  if (!value) return value;
  return value.replace(/^"|"$/g, "");
}

function getDbUrl() {
  const fromEnv = stripWrappingQuotes(process.env.DATABASE_URL);
  if (fromEnv) return fromEnv;

  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  if (!DB_USER || !DB_HOST || !DB_PORT || !DB_NAME) {
    throw new Error(
      "Missing database configuration. Set DATABASE_URL or DB_* variables.",
    );
  }

  return `postgres://${DB_USER}:${DB_PASSWORD || ""}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

function getSqlClient() {
  if (!sqlClient) {
    try {
      const dbUrl = getDbUrl();
      sqlClient = postgres(dbUrl, {
        ssl: "require",
        max: 10,
        // Pooler deployments can fail with prepared statements.
        prepare: false,
        // Add timeouts for serverless environments
        idle_in_transaction_session_timeout: 10000,
        connect_timeout: 10,
      });
      clientAttempts = 0;
    } catch (err) {
      console.error("Failed to initialize database client:", err);
      sqlClient = null;
      throw err;
    }
  }

  return sqlClient;
}

export function sql() {
  return getSqlClient();
}

/**
 * Reset database connection for serverless recovery
 */
export async function resetDbConnection() {
  if (sqlClient) {
    try {
      await sqlClient.end();
    } catch (err) {
      console.error("Error closing database connection:", err);
    }
    sqlClient = null;
  }
}

/**
 * Backwards compatibility layer for legacy MySQL query structure
 * Convert named parameters (:param) to positional ones ($1, $2)
 */
export async function query(sqlString, params = {}) {
  let counter = 1;
  const values = [];

  // Replace named placeholders with positional ones (e.g., :email -> $1)
  // Only replace if the parameter exists in the params object
  let positionalSql = sqlString.replace(
    /:([a-zA-Z0-9_]+)/g,
    (match, paramName) => {
      // Only replace if parameter exists
      if (paramName in params) {
        values.push(params[paramName] !== undefined ? params[paramName] : null);
        return `$${counter++}`;
      }
      // Return the original match (e.g., ::int for PostgreSQL type casting)
      return match;
    },
  );

  // Automatically append 'RETURNING id' for INSERT statements to support MySQL's result.insertId
  const isInsert = /^\s*INSERT\s+INTO/i.test(positionalSql);
  if (isInsert && !/RETURNING/i.test(positionalSql)) {
    positionalSql += " RETURNING id";
  }

  try {
    // Add query timeout for serverless safety (30 seconds)
    const queryWithTimeout = Promise.race([
      getSqlClient().unsafe(positionalSql, values),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Database query timeout after 30 seconds")),
          30000,
        ),
      ),
    ]);

    const rows = await queryWithTimeout;

    // Polyfill the 'insertId' property that MySQL originally returned
    if (isInsert && rows.length > 0 && rows[0].id) {
      rows.insertId = rows[0].id;
    }

    return rows;
  } catch (error) {
    console.error("Database Query Error:", {
      message: error.message,
      sql: positionalSql.substring(0, 200),
      code: error.code,
    });

    // Reset connection on timeout or connection errors
    if (
      error.message.includes("timeout") ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND"
    ) {
      await resetDbConnection();
    }

    throw error;
  }
}
