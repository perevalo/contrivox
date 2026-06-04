-- Update meta_title and meta_description for revision-policy-clause
-- Optimized for CTR: title under 60 chars, description 150-160 chars
UPDATE clauses
SET generated_content = jsonb_set(
  jsonb_set(
    generated_content,
    '{meta_title}',
    '"Revision Policy Clause: What It Means & How to Negotiate"'
  ),
  '{meta_description}',
  '"A revision policy clause caps how many changes clients can request. Learn what it means, spot the red flags, and negotiate better terms before you sign."'
)
WHERE slug = 'revision-policy-clause';
