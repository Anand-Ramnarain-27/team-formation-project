-- Create questions table
CREATE TABLE "questions" (
  "question_id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "theme_id" integer NOT NULL,
  "question_text" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp,
  FOREIGN KEY ("theme_id") REFERENCES "theme" ("theme_id") ON DELETE CASCADE
);

-- Create question_ratings table
CREATE TABLE "question_ratings" (
  "rating_id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "question_id" integer NOT NULL,
  "review_id" integer NOT NULL,
  "rating" rating_enum NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") ON DELETE CASCADE,
  FOREIGN KEY ("review_id") REFERENCES "review" ("review_id") ON DELETE CASCADE
);