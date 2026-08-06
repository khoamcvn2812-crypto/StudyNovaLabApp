# Learning Intelligence upgrade

## Data flow

The feature bundle remains local-first. Anonymous users write to `vocabmaster_data_v1`; signed-in users use the existing record-level `user_sync_records` queue and user-filtered Realtime channel. Words saved from Reading are normalized with NFKC, whitespace folding, and locale-aware lowercase comparison. An existing word receives only a new context sentence. Writing corrections are fingerprinted from normalized source, original text, and corrected text. Speaking mistakes are accepted only through `StudyNovaAddStructuredMistake` with real structured feedback.

## Canonical mastery algorithm

`StudyNovaMastery(word)` is the only UI classifier. Its score uses correct and wrong counts, current correct streak, accuracy, review interval, last-review freshness, and whether `next_review_at` is due. A word is **new** before an answer, **learning** after activity, **familiar** from score 44 with at least three correct and 65% accuracy, and **mastered** from score 72 with at least six correct and 80% accuracy. A wrong or overdue answer reduces the score. Answer recording schedules the next review and then reuses the same classifier.

## Cloud schema

The optional migration adds `vocabulary_learning_state` and `learning_mistakes`, both with UUID primary keys, timestamps, per-user unique constraints, indexes, RLS for every CRUD operation, and Realtime publication membership. Existing JSON sync continues to work before the migration is deployed, so local use is unaffected.

## External dependencies

No dictionary API was invented. The Reading popover therefore labels its manual meaning input explicitly. Speaking corrections are not inferred from recordings or free text; callers must provide structured feedback from a real feedback source.
