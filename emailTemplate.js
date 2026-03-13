const axios = require('axios');

async function generateMotivation() {
  try {
    // Using ZenQuotes API - free and reliable
    const response = await axios.get('https://zenquotes.io/api/random');
    const quote = response.data[0];
    // Format: "Quote text" - Author
    const formattedQuote = `"${quote.q}" - ${quote.a}`;
    // Keep it under 100 characters
    const shortQuote = formattedQuote.length > 100 ? formattedQuote.substring(0, 97) + '...' : formattedQuote;
    return `💪 ${shortQuote}`;
  } catch (error) {
    console.error('Error generating motivation:', error);
    return '🔥 Keep pushing. Consistency beats motivation.'; // Fallback
  }
}

function generateEmailTemplate(problem, motivation) {
  const plainText = `
Problem: ${problem.title}
Category: ${problem.category}
Difficulty: ${problem.difficulty}
Link: ${problem.link}

${motivation}
`;

  return {
    subject: `Today's DSA Challenge: ${problem.title}`,
    text: plainText,
    html: `
<div style="margin:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;padding:40px">

<div style="max-width:700px;margin:auto;background:#111827;border-radius:12px;overflow:hidden">

<!-- HERO IMAGE -->

<a href="${problem.link}" style="display:block;text-decoration:none;">
<img src="https://raw.githubusercontent.com/varun-gavoor212/dsa-scrapper/main/learning.png"
style="width:100%;display:block;border-radius:12px 12px 0 0;">
</a>

<!-- CONTENT -->

<div style="padding:35px;color:#e5e7eb">

<h2 style="margin-top:0;color:white">
🚀 Daily Coding Mission
</h2>

<div style="font-size:26px;font-weight:bold;margin-bottom:10px">
${problem.title}
</div>

<div style="color:#9ca3af">
Category: ${problem.category}
</div>

<span style="
display:inline-block;
padding:6px 14px;
border-radius:20px;
font-size:13px;
font-weight:bold;
margin-top:10px;
background:${problem.difficulty === 'Easy' ? '#22c55e' :
             problem.difficulty === 'Medium' ? '#f59e0b' :
             '#ef4444'};
color:white;
">
${problem.difficulty}
</span>

<br>

<a href="${problem.link}"
style="
display:inline-block;
margin-top:25px;
background:linear-gradient(135deg,#6366f1,#9333ea);
padding:14px 24px;
border-radius:8px;
color:white;
text-decoration:none;
font-weight:bold;
">

⚡ Solve the Challenge

</a>

<div style="
margin-top:40px;
padding:20px;
background:#1f2937;
border-radius:10px;
font-style:italic;
">

${motivation}

</div>

</div>

<!-- FOOTER -->

<div style="
text-align:center;
padding:25px;
font-size:13px;
color:#9ca3af;
background:#020617;
">

Keep solving. Keep improving 💻
<br>
DSA Daily Bot

</div>

</div>

</div>
`
  };
}

module.exports = { generateEmailTemplate, generateMotivation };
