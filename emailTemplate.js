const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function generateMotivation() {
  try {
    const result = await model.generateContent(
      "Write a short, energetic motivational message for someone solving DSA problems daily. Keep it under 100 characters."
    );
    return result.response.text().trim();
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
