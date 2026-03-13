const { sendDailyProblems, sendToEmailList } = require('../dailyMailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    // If emails list is provided, send to those addresses (manual/trial mode)
    if (Array.isArray(body.emails) && body.emails.length) {
      const result = await sendToEmailList({
        emails: body.emails,
        difficulty: body.difficulty,
        wantsMotivation: body.wantsMotivation,
      });
      return res.status(200).json({ ok: true, result });
    }

    // Otherwise, run daily batch from DB.
    await sendDailyProblems();
    return res.status(200).json({ ok: true, message: 'Daily emails sent.' });
  } catch (err) {
    console.error('API send-daily error:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Unknown error' });
  }
}
