const sql = require("mssql");

const config = {
  user: "githubuser",
  password: "StrongPassword@123",
  server: "varun-sql-db.database.windows.net",
  database: "free-sql-db-4594076",
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function testDBConnection() {
  let pool;

  try {
    console.log("Connecting to Azure SQL...");

    pool = await sql.connect(config);

    console.log("✅ Connected to database");

    const result = await pool.request().query(`
      SELECT * FROM users;
    `);

    console.log("Users table data:");
    console.log(result.recordset);

  } catch (err) {
    console.error("❌ Database Error:");
    console.error(err);
  } finally {
    if (pool) {
      await pool.close();
      console.log("Connection closed");
    }
  }
}

testDBConnection();