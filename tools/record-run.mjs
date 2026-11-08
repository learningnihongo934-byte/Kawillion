// Plays a perfect Kawillion daily run (every answer is the hidden Legendary gem) in headless Chrome,
// captures every rendered frame plus the game's own Web Audio output, then writes an MP4 with ffmpeg.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const URL = process.argv[2] || "http://localhost:8830/";
const OUT = process.argv[3];
const W = 1920, H = 1080;
const work = path.resolve("work");
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(path.join(work, "frames"), { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();

// mirror everything the game sends to the speakers into a MediaRecorder
await page.addInitScript(() => {
  window.__rec = { chunks: [], start: 0 };
  const AC = window.AudioContext;
  window.AudioContext = class extends AC {
    constructor(...a) {
      super(...a);
      this.__tap = this.createMediaStreamDestination();
      const rec = new MediaRecorder(this.__tap.stream, { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 192000 });
      rec.ondataavailable = e => e.data.size && window.__rec.chunks.push(e.data);
      rec.start(200); window.__rec.rec = rec; window.__rec.start = Date.now();
    }
  };
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = connect.call(this, dest, ...rest);
    if (dest instanceof AudioDestinationNode && this.context.__tap) connect.call(this, this.context.__tap);
    return r;
  };
});

const cdp = await page.context().newCDPSession(page);
const frames = [];
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  const file = path.join(work, "frames", `f${String(frames.length).padStart(5, "0")}.jpg`);
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  frames.push({ file, t: metadata.timestamp });
  cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
await page.evaluate(() => { localStorage.clear(); home(); camY = -60; camSpeed = 0.018; });   // replay the intro pan
await sleep(5200);

await page.click("#begin");
for (let k = 0; k < 7; k++) {
  await sleep(1700);                                            // read the prompt
  const gem = await page.evaluate(() => run.set[run.i].a.at(-1)[0]);
  for (const ch of gem) await page.keyboard.type(ch, { delay: 0 }), await sleep(70 + Math.random() * 60);
  await sleep(350);
  await page.keyboard.press("Enter");
  await page.waitForSelector("#rvNext:not(.hidden)", { timeout: 15000 });
  await sleep(2400);                                            // let the reveal breathe
  await page.click("#rvNext");
}
await sleep(6500);                                              // summit, fanfare, report

await cdp.send("Page.stopScreencast");
const audio = await page.evaluate(async () => {
  const r = window.__rec; if (!r.rec) return null;
  await new Promise(res => { r.rec.onstop = res; r.rec.stop(); });
  const buf = await new Blob(r.chunks, { type: "audio/webm" }).arrayBuffer();
  let s = ""; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return { b64: btoa(s), start: r.start };
});
const result = await page.evaluate(() => ({ points: run.points, grid: gridOf(run.results), flags: run.results.filter(r => r.tier === -2).length }));
await browser.close();
console.log("run:", JSON.stringify(result), "frames:", frames.length);

// variable-rate frames -> constant 60 fps video, game audio placed at its real start time
const list = frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.t ?? f.t + 1 / 30) - f.t).toFixed(5)}`).join("\n") + `\nfile '${frames.at(-1).file}'\n`;
fs.writeFileSync(path.join(work, "list.txt"), list);
const args = ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(work, "list.txt")];
if (audio) {
  fs.writeFileSync(path.join(work, "audio.webm"), Buffer.from(audio.b64, "base64"));
  const offset = Math.max(0, audio.start / 1000 - frames[0].t);
  args.push("-itsoffset", offset.toFixed(3), "-i", path.join(work, "audio.webm"), "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k");
  console.log("audio offset", offset.toFixed(3), "s");
}
args.push("-fps_mode", "cfr", "-r", "60", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-tune", "animation", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT);
execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "inherit"] });
console.log("wrote", OUT);
