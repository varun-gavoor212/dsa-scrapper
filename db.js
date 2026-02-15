const sql = require("mssql");

const config = {
    server: "varun-sql-db.database.windows.net",
    database: "free-sql-db-4594076",
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    authentication: {
        type: "azure-active-directory-default"
    }
};

async function setupDB() {
    try {
        console.log("Connecting to Azure SQL...");
        const pool = await sql.connect(config);

        console.log("Creating problems table...");

        const res = await pool.request().query(`
      select * from users;
    `);
        console.log(res);

        console.log("✅ Table created (or already exists).");

        await pool.close();
    } catch (err) {
        console.error("❌ Error:");
        console.error(err.message);
    }
}

setupDB();
