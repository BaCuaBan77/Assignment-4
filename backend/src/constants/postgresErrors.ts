/**
 * PostgreSQL error codes
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export enum PostgresErrorCode {
  /** Foreign key violation */
  FOREIGN_KEY_VIOLATION = '23503',
  /** Unique constraint violation */
  UNIQUE_VIOLATION = '23505',
}

