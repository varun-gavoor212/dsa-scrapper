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
  return {
    subject: "📌 Your Daily DSA Problem",
    text: `
Problem: ${problem.title}
Category: ${problem.category}
Difficulty: ${problem.difficulty}
Link: ${problem.link}

${motivation ? '\n\n' + motivation : ''}
`
  };
}

module.exports = { generateEmailTemplate, generateMotivation };
