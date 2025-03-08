INSERT INTO exercises (name, type, primary_muscle_group, secondary_muscle_groups) 
SELECT 'Push-Ups', 'Upper Body', 'Chest', 'Triceps, Shoulders, Core'
UNION ALL SELECT 'Quad Extension', 'Lower Body', 'Quadriceps', 'Knee Stabilizers'
UNION ALL SELECT 'Squats', 'Lower Body', 'Glutes, Hamstrings, Lower Back'
UNION ALL SELECT 'Romanian Deadlift', 'Lower Body', 'Hamstrings', 'Glutes, Lower Back'
UNION ALL SELECT 'Seated Row', 'Upper Body', 'Middle Back', 'Biceps, Lats'
UNION ALL SELECT 'Skull Crushers', 'Upper Body', 'Triceps', 'Forearms'
UNION ALL SELECT 'Triceps Pushdown', 'Upper Body', 'Triceps', 'Forearms'
UNION ALL SELECT 'Chest Fly', 'Upper Body', 'Chest', 'Shoulders'
UNION ALL SELECT 'Planks', 'Core', 'Core', 'Shoulders, Back, Glutes'
UNION ALL SELECT 'Russian Twists', 'Core', 'Obliques', 'Abs, Hip Flexors'
UNION ALL SELECT 'Lunges', 'Lower Body', 'Quadriceps', 'Glutes, Hamstrings, Calves';