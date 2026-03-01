export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured. Add it in Vercel project settings → Environment Variables." });
  }

  const { messages, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt || "You are a helpful assistant for a resale/liquidation business called East Valley Exchange.",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    return res.status(200).json({ response: text });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Failed to reach Claude API" });
  }
}
