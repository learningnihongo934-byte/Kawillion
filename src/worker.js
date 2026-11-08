// Serves the game from dist/ and keeps a tally of which answers players give,
// so rarity tiers come from real players over time.
import KEYS from "../build/keys.json";

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/api/stats" && req.method === "GET") {
      const { results } = await env.DB.prepare("SELECT q, i, n FROM counts").all();
      const out = {};
      for (const r of results) if (r.q in KEYS) (out[r.q] ||= {})[r.i] = r.n;
      return json(out, 200, { "cache-control": "public, max-age=30" });
    }

    if (url.pathname === "/api/answer" && req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ error: "bad request" }, 400); }
      const q = String(body?.q ?? ""), i = Number(body?.i);
      if (!(q in KEYS) || !Number.isInteger(i) || i < -1 || i >= KEYS[q]) return json({ error: "unknown answer" }, 400);
      await env.DB.prepare("INSERT INTO counts (q, i, n) VALUES (?, ?, 1) ON CONFLICT (q, i) DO UPDATE SET n = n + 1")
        .bind(q, i).run();
      return json({ ok: true });
    }

    return env.ASSETS.fetch(req);
  },
};
