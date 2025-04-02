-- Custom SQL migration file, put your code below! --
-- Migration script (can run safely on every startup)
INSERT INTO user (config)
SELECT '{"preferredTheme": "dark", "timezone": "America/Argentina/Buenos_Aires"}' -- Your default JSON
WHERE NOT EXISTS (SELECT 1 FROM user);