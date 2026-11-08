-- How many players gave each answer. i is the answer's index in its list, -1 means no valid answer.
CREATE TABLE IF NOT EXISTS counts (
  q TEXT NOT NULL,
  i INTEGER NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (q, i)
);
