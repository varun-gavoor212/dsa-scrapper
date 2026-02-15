const puppeteer = require("puppeteer");
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

async function autoClosePopups(page) {
  await page.evaluate(() => {
    setInterval(() => {
      document.querySelectorAll("div[role='dialog'], .fixed, .modal")
        .forEach(el => el.remove());
      document.querySelectorAll(".bg-black, .overlay, .backdrop")
        .forEach(el => el.remove());
    }, 500);
  });
}

async function expandAll(page) {
  let expanded = true;

  while (expanded) {
    expanded = false;

    const buttons = await page.$$('[data-slot="accordion-trigger"][aria-expanded="false"]');

    for (const btn of buttons) {
      try {
        await btn.evaluate(el => el.click());
        await new Promise(r => setTimeout(r, 120));
        expanded = true;
      } catch {}
    }
  }
}

async function insertIntoDB(problems) {
  const pool = await sql.connect(dbConfig);

  for (const p of problems) {
    await pool.request()
      .input("category", sql.NVarChar, p.category)
      .input("title", sql.NVarChar, p.title)
      .input("difficulty", sql.NVarChar, p.difficulty)
      .input("link", sql.NVarChar, p.solveLink)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM problems WHERE title = @title
        )
        INSERT INTO problems (category, title, difficulty, link)
        VALUES (@category, @title, @difficulty, @link)
      `);
  }

  await pool.close();
  console.log("✅ Data inserted into Azure SQL.");
}

async function scrapeA2Z() {
  console.log("🚀 Starting Scraper");

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  await page.goto(
    "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z",
    { waitUntil: "domcontentloaded" }
  );

  await autoClosePopups(page);
  await page.waitForSelector(".tuf-accordion-title");

  await expandAll(page);

  await new Promise(r => setTimeout(r, 2000));

  const problems = await page.evaluate(() => {
    const results = [];
    const sections = document.querySelectorAll(".tuf-accordion-row");

    sections.forEach(section => {
      const category =
        section.querySelector(".tuf-accordion-title")?.innerText.trim();

      const rows = section.querySelectorAll("tbody tr");

      rows.forEach(row => {
        const cols = row.querySelectorAll("td");

        if (cols.length > 0) {
          const title = cols[1]?.innerText.trim();
          const difficulty =
            cols[cols.length - 1]?.innerText.trim();

          const solveLinkElement =
            row.querySelector('a[href*="/plus/dsa/problems/"]');

          const solveLink = solveLinkElement
            ? solveLinkElement.href
            : null;

          if (title) {
            results.push({
              category,
              title,
              difficulty,
              solveLink
            });
          }
        }
      });
    });

    return results;
  });

  console.log(`🎯 Extracted ${problems.length} problems`);

  await browser.close();

  await insertIntoDB(problems);
}

scrapeA2Z();
