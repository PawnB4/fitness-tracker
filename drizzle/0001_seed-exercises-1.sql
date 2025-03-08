INSERT INTO exercises (name, type, primary_muscle_group, secondary_muscle_groups) 
SELECT 'Abductor Machine', 'Lower Body', 'Adductors', 'Glutes'
UNION ALL SELECT 'Barbell Row', 'Upper Body', 'Back', 'Biceps, Forearms, Shoulders'
UNION ALL SELECT 'Bench Press', 'Upper Body', 'Chest', 'Triceps, Shoulders'
UNION ALL SELECT 'Bicep Curls (Cable)', 'Upper Body', 'Biceps', 'Forearms'
UNION ALL SELECT 'Bicep Curls (Dumbbells)', 'Upper Body',  'Biceps', 'Forearms'
UNION ALL SELECT 'Incline Dumbbell Curls', 'Upper Body', 'Biceps', 'Forearms'
UNION ALL SELECT 'Cable Crunches', 'Core', 'Abs', 'Obliques'
UNION ALL SELECT 'Calf Raises', 'Lower Body', 'Calves', 'Ankles'
UNION ALL SELECT 'Deadlifts', 'Lower Body', 'Lower Back', 'Hamstrings, Glutes, Traps, Forearms'
UNION ALL SELECT 'Dips', 'Upper Body', 'Triceps', 'Chest, Shoulders';