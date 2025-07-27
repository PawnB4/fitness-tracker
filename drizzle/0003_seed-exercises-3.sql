INSERT INTO exercises (name, type, primary_muscle_group) 
SELECT 'Push-Ups', 'upper_body', 'chest'
UNION ALL SELECT 'Quad Extension', 'lower_body', 'quadriceps'
UNION ALL SELECT 'Squats', 'lower_body', NULL
UNION ALL SELECT 'Romanian Deadlift', 'lower_body', 'hamstrings'
UNION ALL SELECT 'Seated Row', 'upper_body', 'back'
UNION ALL SELECT 'Skull Crushers', 'upper_body', 'triceps'
UNION ALL SELECT 'Triceps Pushdown', 'upper_body', 'triceps'
UNION ALL SELECT 'Chest Fly', 'upper_body', 'chest'
UNION ALL SELECT 'Planks', 'core', NULL
UNION ALL SELECT 'Russian Twists', 'core', NULL
UNION ALL SELECT 'Lunges', 'lower_body', 'quadriceps';