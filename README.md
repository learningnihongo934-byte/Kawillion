# Otakount

Anime list trivia. Pick a question like "Name a Naruto character" and type as many answers as you can in 90 seconds. Each right answer adds 3 seconds. Spelling is forgiving, and a unique first or last name counts on its own ("Kakashi").

20 questions in 4 groups: Characters, Shows, Powers, Industry.

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
