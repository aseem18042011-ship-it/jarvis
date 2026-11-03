export const config = { runtime: "edge", regions: ["bom1"] };

export default async function handler(req) {
  const G = "https://generativelanguage.googleapis.com/v1beta/models";
  const fail = (code, msg) =>
    new Response(JSON.stringify({ error: { code, message: msg } }), {
      status: code,
      headers: { "Content-Type": "application/json" }
    });

  if (req.method !== "POST") return fail(405, "POST only");

  let body;
  try { body = await req.json(); } catch (e) { return fail(400, "Bad request"); }
  if (!/^gemini-[A-Za-z0-9._-]+$/.test((body && body.model) || "")) {
    return fail(400, "Bad model");
  }

  try {
    const r = await fetch(G + "/" + body.model + ":streamGenerateContent?alt=sse", {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.GEMINI_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: body.system_instruction,
        contents: body.contents,
        generationConfig: { maxOutputTokens: 150 }
      })
    });
    return new Response(r.body, {
      status: r.status,
      headers: {
        "Content-Type": r.headers.get("Content-Type") || "text/event-stream",
        "Cache-Control": "no-cache"
      }
    });
  } catch (e) {
    return fail(500, String(e));
  }
}
