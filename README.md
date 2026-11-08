# Otakount

Daily anime trivia in pixel art, inspired by list-trivia games like Krillion. Each day has 7 prompts. You give one answer per prompt within 25 seconds, and rarer answers score more (Common 10 up to Legendary 100). Points carry a climber up a tower of seven pixel scenes drawn in Pixeter (src/art): Starter Village, Ninja Forest, Pirate Sea, Titan Wall, Demon Mountain, Mecha City and Sky Castle at 7,000 m. Endless mode gives a random set any time.

Rarity comes from list order: lists are written most famous first, and the last answer is the Legendary one.

## Adding questions

Questions live in `data/*.txt`:

```
# Name a Naruto character
@ Characters
Naruto Uzumaki; Sasuke Uchiha | Sasuke; Gaara
```

`;` separates answers and `|` adds extra accepted spellings.

## Build and run

```bash
./build.sh          # writes dist/
./build.sh serve    # serves at http://localhost:8830
./build.sh deploy   # publishes to https://otakount.rennko.tech
```

Made by **Virat Reddy Kaukuntla** ([@learningnihongo934-byte](https://github.com/learningnihongo934-byte))
