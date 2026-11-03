module.exports = async (req, res) => {
  const G = "https://generativelanguage.googleapis.com/v1beta/models";
  const h = { "x-goog-api-key": process.env.GEMINI_KEY };
  try {
    let r;
    if (req.method === "GET") {
      r = await fetch(G + "?pageSize=200", { headers: h });
    } else if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!/^gemini-[A-Za-z0-9._-]+$/.test((body && body.model) || "")) {
        return res.status(400).json({ error: { message: "Bad model" } });
      }
      r = await fetch(G + "/" + body.model + ":generateContent", {
        method: "POST",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: body.system_instruction,
          contents: body.contents,
          generationConfig: { maxOutputTokens: 150 }
        })
      });
    } else {
      return res.status(405).end();
    }
    const text = await r.text();
    res.status(r.status).setHeader("Content-Type", "application/json").send(text);
  } catch (e) {
    res.status(500).json({ error: { message: String(e) } });
  }
};
