const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
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

    const result = await pool.request().query("SELECT * FROM users");

    console.log(result.recordset);

  } catch (err) {
    console.error("❌ Database Error:", err);
  } finally {
    if (pool) {
      await pool.close();
      console.log("Connection closed");
    }
  }
}

testDBConnection();