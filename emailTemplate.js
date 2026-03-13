const axios = require('axios');

async function generateMotivation() {
  try {
    // Using a free quotes API - no API key required
    const response = await axios.get('https://api.quotable.io/random?tags=motivational,famous-quotes');
    const quote = response.data.content;
    // Keep it under 100 characters and make it energetic
    const shortQuote = quote.length > 100 ? quote.substring(0, 97) + '...' : quote;
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
