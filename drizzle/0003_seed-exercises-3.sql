INSERT INTO exercises (name, type, primary_muscle_group) 
SELECT 'Push-Ups', 'Upper Body', 'Chest'
UNION ALL SELECT 'Quad Extension', 'Lower Body', 'Quadriceps'
UNION ALL SELECT 'Squats', 'Lower Body', 'Glutes, Hamstrings, Lower Back'
UNION ALL SELECT 'Romanian Deadlift', 'Lower Body', 'Hamstrings'
UNION ALL SELECT 'Seated Row', 'Upper Body', 'Middle Back'
UNION ALL SELECT 'Skull Crushers', 'Upper Body', 'Triceps'
UNION ALL SELECT 'Triceps Pushdown', 'Upper Body', 'Triceps'
UNION ALL SELECT 'Chest Fly', 'Upper Body', 'Chest'
UNION ALL SELECT 'Planks', 'Core', 'Abs'
UNION ALL SELECT 'Russian Twists', 'Core', 'Obliques'
UNION ALL SELECT 'Lunges', 'Lower Body', 'Quadriceps';