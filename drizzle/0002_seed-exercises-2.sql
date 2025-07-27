INSERT INTO exercises (name, type, primary_muscle_group) 
SELECT 'Face Pulls', 'upper_body', 'shoulders'
UNION ALL SELECT 'Hamstring Curl (Lying)', 'lower_body', 'hamstrings'
UNION ALL SELECT 'Hamstring Curl (Seated)', 'lower_body', 'hamstrings'
UNION ALL SELECT 'Incline Dumbbell Press', 'upper_body', 'chest'
UNION ALL SELECT 'Lat Pulldown', 'upper_body', 'back'
UNION ALL SELECT 'Lateral Raises', 'upper_body', 'shoulders'
UNION ALL SELECT 'Leg Press', 'lower_body', 'quadriceps'
UNION ALL SELECT 'Leg Raises', 'core', NULL
UNION ALL SELECT 'Overhead Press', 'upper_body', 'shoulders'
UNION ALL SELECT 'Pull-Ups', 'upper_body', 'back';