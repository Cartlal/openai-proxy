const express = require("express");
const cors = require("cors");

// ✅ Node-fetch import (for CommonJS)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Load OpenAI API key securely from Render environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ OpenAI model and endpoint
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL_ID = "gpt-4o-mini"; // or "gpt-4-turbo", "gpt-3.5-turbo" etc.

// 🟢 Root route — for quick check
app.get("/", (req, res) => {
  res.send(`
    <h2>✅ OpenAI Proxy is Live (${MODEL_ID})</h2>
    <p>Send a POST request to /openai</p>
    <pre>{
  "message": "Say hello OpenAI"
}</pre>
  `);
});

// 🧠 OpenAI Proxy Endpoint
app.post("/openai", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ OpenAI API error:", errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json({
      reply: data.choices?.[0]?.message?.content || "No response",
    });
  } catch (error) {
    console.error("❌ OpenAI fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ OpenAI proxy running on port ${PORT}`)
);
