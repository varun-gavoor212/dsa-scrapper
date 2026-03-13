const cron = require("node-cron");
const nodemailer = require("nodemailer");
const sql = require("mssql");

const dbConfig = {
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "varungour0@gmail.com",
    pass: "nllucvardnqcewir"
  }
});

async function sendDailyProblems() {
  let pool;

  try {
    console.log("Connecting to DB...");

    pool = await sql.connect(dbConfig);

    const usersResult = await pool.request().query("SELECT * FROM users");
    const users = usersResult.recordset;

    for (const user of users) {
      const request = pool.request();

      request.input("difficulty", sql.VarChar, user.difficulty || null);

      const problemResult = await request.query(`
        SELECT TOP 1 *
        FROM problems
        WHERE (@difficulty IS NULL OR difficulty = @difficulty)
        ORDER BY NEWID()
      `);

      if (!problemResult.recordset.length) continue;

      const problem = problemResult.recordset[0];

      const motivation = user.wantsMotivation
        ? "\n\n🔥 Keep pushing. Consistency beats motivation."
        : "";

      await transporter.sendMail({
        from: "varungour0@gmail.com",
        to: user.email,
        subject: "📌 Your Daily DSA Problem",
        text: `
Problem: ${problem.title}
Category: ${problem.category}
Difficulty: ${problem.difficulty}
Link: ${problem.link}

${motivation}
`
      });

      console.log(`✅ Sent to ${user.email}`);
    }

  } catch (err) {
    console.error("❌ Mailer Error:", err);
  } finally {
    if (pool) {
      await pool.close();
      console.log("DB connection closed");
    }
  }
}

cron.schedule("* * * * *", async () => {
  console.log("🚀 Running Daily Mailer...");
  await sendDailyProblems();
});