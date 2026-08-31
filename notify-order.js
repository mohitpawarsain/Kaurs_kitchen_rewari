// Vercel Serverless Function
// Sends a Telegram message to the admin when a new order comes in.
// The bot token stays on the server (env var) — never exposed to the browser.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars");
    return res.status(500).json({ error: "Server not configured" });
  }

  try {
    const { orderId, customerName, total, itemsSummary, address, payment } = req.body || {};

    const text =
      `🛎️ *New Order!*\n` +
      `Order: #${orderId || "—"}\n` +
      `Customer: ${customerName || "—"}\n` +
      `Items: ${itemsSummary || "—"}\n` +
      `Total: ₹${total || "0"}\n` +
      `Payment: ${payment || "—"}\n` +
      (address ? `Address: ${address}` : "");

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
      })
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error("Telegram API error:", tgData);
      return res.status(502).json({ error: "Telegram send failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("notify-order error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
