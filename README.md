# Kawillion

A daily anime trivia game in pixel art, in the same genre as list-trivia games like Krillion. Each day has 7 anime prompts, the same for everyone, such as "Name a Naruto character". You get 25 seconds and one answer per prompt. Answers that aren't on the list are turned away, and you can try again while the clock runs.

The rarer your answer, the more points you get (Common 10, Uncommon 30, Rare 60, Epic 85, Legendary 100). Points carry a climber up a tower of seven pixel scenes drawn in Pixeter: Starter Village, Ninja Forest, Pirate Sea, Titan Wall, Demon Mountain, Mecha City, and Sky Castle at 7,000 m.

- **Clear feedback:** after each answer you see its tier, roughly what share of players said it, its rank, and the most common answers. Each prompt also has a hidden Legendary answer, and you get a hint of its first letters.
- **Real rarity:** every answer is counted (Cloudflare D1), and rarity moves from a starting guess toward what players actually say.
- **Fair play:** switching tabs or windows, reloading, pasting, or answering faster than anyone can type during a prompt forfeits that prompt (0 points, shown as SWITCHED TABS or TOO FAST) and moves you on.
- **More:** an endless mode, streaks and stats, a shareable emoji grid, and synthesized chiptune sound.

60 prompts with about 5,700 answers in total. Matching is forgiving: small typos, first or last names alone ("Rengoku", "Eren"), and dropped endings ("Shadow Clone", "Gomu Gomu no Mi") all count.

## Files

- `src/index.html` is the game. `src/art/` holds the Pixeter scenes and the hero sprite.
- `src/worker.js` serves the game and the answer API (`GET /api/stats`, `POST /api/answer`). `schema.sql` is its table.
- `data/*.txt` holds the questions. `;` separates answers, `|` adds extra spellings, `* Name` marks the Legendary gem, and `+ Question` adds answers to an existing question. Lists are written most famous first, because that order is the starting guess at rarity.
- `tools/compile.py` builds `dist/questions.js`. `tools/check.py` flags duplicate answers.

## Build and run

```bash
./build.sh          # writes dist/
./build.sh serve    # serves at http://localhost:8830 (the API isn't available there)
./build.sh deploy   # creates the D1 table if needed, then publishes to https://kawillion.rennko.tech
```

Made by **Virat Reddy Kaukuntla** ([@learningnihongo934-byte](https://github.com/learningnihongo934-byte))

## Recording a run

`tools/record-run.mjs` plays a perfect daily run (every answer is the hidden Legendary gem) in headless Chrome. It captures each frame and the game's own sound, then writes a 1080p60 MP4 with ffmpeg. Run it against a local copy so the answers don't get counted in the live stats:

```bash
./build.sh serve                                   # in one terminal
cd tools && npm i playwright-core && node record-run.mjs http://localhost:8830/ ../videos/run.mp4
```

Videos go in `videos/`, which isn't committed. Normalize the audio afterwards with `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-16:TP=-1.5 out.mp4`.
