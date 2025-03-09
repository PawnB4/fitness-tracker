INSERT INTO exercises (name, type, primary_muscle_group) 
SELECT 'Abductor Machine', 'Lower Body', 'Adductors'
UNION ALL SELECT 'Barbell Row', 'Upper Body', 'Back'
UNION ALL SELECT 'Bench Press', 'Upper Body', 'Chest'
UNION ALL SELECT 'Bicep Curls (Cable)', 'Upper Body', 'Biceps'
UNION ALL SELECT 'Bicep Curls (Dumbbells)', 'Upper Body', 'Biceps'
UNION ALL SELECT 'Incline Dumbbell Curls', 'Upper Body', 'Biceps'
UNION ALL SELECT 'Cable Crunches', 'Core', 'Abs'
UNION ALL SELECT 'Calf Raises', 'Lower Body', 'Calves'
UNION ALL SELECT 'Deadlifts', 'Lower Body', 'Lower Back'
UNION ALL SELECT 'Dips', 'Upper Body', 'Triceps';