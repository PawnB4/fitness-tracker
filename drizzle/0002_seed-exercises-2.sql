INSERT INTO exercises (name, type, primary_muscle_group, secondary_muscle_groups) 
SELECT 'Face Pulls', 'Upper Body', 'Rear Delts', 'Traps, Rhomboids'
UNION ALL SELECT 'Hamstring Curl (Lying)', 'Lower Body', 'Hamstrings', 'Calves'
UNION ALL SELECT 'Hamstring Curl (Seated)', 'Lower Body', 'Hamstrings', 'Calves'
UNION ALL SELECT 'Incline Dumbbell Press', 'Upper Body', 'Upper Chest', 'Shoulders, Triceps'
UNION ALL SELECT 'Lat Pulldown', 'Upper Body', 'Lats', 'Biceps, Rhomboids'
UNION ALL SELECT 'Lateral Raises', 'Upper Body', 'Side Delts', 'Traps'
UNION ALL SELECT 'Leg Press', 'Lower Body', 'Quadriceps', 'Glutes, Hamstrings'
UNION ALL SELECT 'Leg Raises', 'Core', 'Lower Abs', 'Hip Flexors'
UNION ALL SELECT 'Overhead Press', 'Upper Body', 'Shoulders', 'Triceps, Upper Chest'
UNION ALL SELECT 'Pull-Ups', 'Upper Body', 'Lats', 'Biceps, Rhomboids, Forearms';