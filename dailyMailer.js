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

  connectionTimeout: 30000,
  requestTimeout: 30000,

  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000
  },

  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

console.log("DB Config Loaded");

async function connectWithRetry(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const pool = await sql.connect(dbConfig);
      console.log(`DB connected on attempt ${attempt}`);
      return pool;
    } catch (err) {
      console.warn(`DB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 1,
  maxMessages: 5,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendDailyProblems() {
  let pool;

  try {
    console.log("Connecting to DB...");

    pool = await connectWithRetry();

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
