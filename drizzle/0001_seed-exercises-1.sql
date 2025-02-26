INSERT INTO exercises (name, type, description, primary_muscle_group, secondary_muscle_groups) 
SELECT 'Abductor Machine', 'Lower Body', 'Machine exercise targeting the outer thigh muscles', 'Adductors', 'Glutes'
UNION ALL SELECT 'Barbell Row', 'Upper Body', 'Compound movement where you bend over and pull a barbell towards your lower chest', 'Back', 'Biceps, Forearms, Shoulders'
UNION ALL SELECT 'Bench Press', 'Upper Body', 'Lying on a bench and pressing weight upward from your chest', 'Chest', 'Triceps, Shoulders'
UNION ALL SELECT 'Bicep Curls (Cable)', 'Upper Body', 'Curling a cable attachment from hip to shoulder height', 'Biceps', 'Forearms'
UNION ALL SELECT 'Bicep Curls (Dumbbells)', 'Upper Body', 'Curling dumbbells from hip to shoulder height', 'Biceps', 'Forearms'
UNION ALL SELECT 'Incline Dumbbell Curls', 'Upper Body', 'Bicep curls performed on an incline bench', 'Biceps', 'Forearms'
UNION ALL SELECT 'Cable Crunches', 'Core', 'Kneeling and using a cable to perform controlled crunches', 'Abs', 'Obliques'
UNION ALL SELECT 'Calf Raises', 'Lower Body', 'Rising onto your toes to work your calves', 'Calves', 'Ankles'
UNION ALL SELECT 'Deadlifts', 'Lower Body', 'Compound exercise lifting a barbell from floor to hip level', 'Lower Back', 'Hamstrings, Glutes, Traps, Forearms'
UNION ALL SELECT 'Dips', 'Upper Body', 'Lowering and raising your body between parallel bars', 'Triceps', 'Chest, Shoulders';