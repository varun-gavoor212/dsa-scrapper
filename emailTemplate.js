const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateMotivation() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a motivational coach. Generate a short, energetic motivation quote for coding and problem-solving.' },
        { role: 'user', content: 'Give me a daily motivation quote for DSA practice.' }
      ],
      max_tokens: 50,
    });
    return response.choices[0].message.content.trim();
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
