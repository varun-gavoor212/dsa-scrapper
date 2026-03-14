require("dotenv").config();

const nodemailer = require("nodemailer");
const sql = require("mssql");
const { generateEmailTemplate, generateMotivation } = require("./emailTemplate");

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

console.log("DB Config Loaded");

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

    // Get all users
    const usersResult = await pool.request().query(`
      SELECT email, difficulty, wantsMotivation
      FROM users
    `);

    const users = usersResult.recordset;

    if (!users.length) {
      console.log("No users found");
      return;
    }

    // Check if any user wants motivation
    const anyWantsMotivation = users.some(u => u.wantsMotivation);

    let dailyMotivation = "";
    if (anyWantsMotivation) {
      dailyMotivation = await generateMotivation();
    }

    for (const user of users) {

      // Get 2 random problems (any difficulty)
      const problemsResult = await pool.request().query(`
        SELECT TOP 2 *
        FROM problems
        ORDER BY NEWID()
      `);

      const problems = problemsResult.recordset;

      if (!problems.length) {
        console.log("No problems found");
        continue;
      }

      const emailContent = generateEmailTemplate(
        problems,
        user.wantsMotivation ? dailyMotivation : ""
      );

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      });

      console.log(`✅ Sent 2 problems to ${user.email}`);
    }

  } catch (error) {
    console.error("❌ Mailer Error:", error);
  } finally {
    if (pool) {
      await pool.close();
      console.log("DB connection closed");
    }

    process.exit(0);
  }
}

sendDailyProblems();
