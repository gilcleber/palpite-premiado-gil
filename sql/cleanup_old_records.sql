-- Function to keep only the latest N records or clear old ones
-- This function deletes "palpites" older than X days.
-- You can run this manually in the SQL Editor or set up a cron job later.

CREATE OR REPLACE FUNCTION cleanup_old_palpites(days_to_keep INT DEFAULT 30)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM palpites
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
END;
$$;

-- Example usage:
-- SELECT cleanup_old_palpites(60); -- Keeps only the last 60 days of data
