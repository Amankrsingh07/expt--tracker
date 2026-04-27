import prisma from "./prisma";

// Small compatibility wrapper so existing raw-SQL handlers that call
// `db.query(sql, params)` keep working. Returns [rows] to match the
// array-destructuring used in the API routes (const [rows] = await db.query(...)).
export const db = {
  query: async (sql, params = []) => {
    try {
      if (params && params.length) {
        // prisma.$queryRawUnsafe accepts the SQL string and then parameters
        const rows = await prisma.$queryRawUnsafe(sql, ...params);
        return [rows];
      }
      const rows = await prisma.$queryRawUnsafe(sql);
      return [rows];
    } catch (err) {
      // rethrow so callers can handle/log
      throw err;
    }
  },
};

export default db;
