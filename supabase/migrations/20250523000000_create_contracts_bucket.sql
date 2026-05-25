BEGIN;

-- Create the private storage bucket for uploaded contract files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,
  20971520,  -- 20 MB
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Service role can read/write (used by API routes via service client)
CREATE POLICY IF NOT EXISTS "service_role_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'contracts')
  WITH CHECK (bucket_id = 'contracts');

COMMIT;
