const nodemailer = require("nodemailer");
const sql = require("mssql");

const dbConfig = {
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
        from: process.env.EMAIL_USER,
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

// GitHub Actions runs this once
sendDailyProblems();