const cron = require("node-cron");
const nodemailer = require("nodemailer");
const sql = require("mssql");

const dbConfig = {
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "varungour0@gmail.com",
    pass: "nllucvardnqcewir"
  }
});

async function sendDailyProblems() {
  const pool = await sql.connect(dbConfig);

  const users = await pool.request().query("SELECT * FROM users");

  for (const user of users.recordset) {
    const result = await pool.request().query(`
      SELECT TOP 1 *
      FROM problems
      WHERE 
        (${user.difficulty ? `difficulty='${user.difficulty}'` : "1=1"})
      ORDER BY NEWID()
    `);

    if (result.recordset.length === 0) continue;

    const problem = result.recordset[0];

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

  await pool.close();
}

cron.schedule("* * * * *", () => {
  console.log("🚀 Running Daily Mailer...");
  sendDailyProblems();
});