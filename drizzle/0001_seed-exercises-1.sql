INSERT INTO exercises (name, type, primary_muscle_group) 
SELECT 'Abductor Machine', 'lower_body', NULL
UNION ALL SELECT 'Barbell Row', 'upper_body', 'back'
UNION ALL SELECT 'Bench Press', 'upper_body', 'chest'
UNION ALL SELECT 'Bicep Curls (Cable)', 'upper_body', 'biceps'
UNION ALL SELECT 'Bicep Curls (Dumbbells)', 'upper_body', 'biceps'
UNION ALL SELECT 'Incline Dumbbell Curls', 'upper_body', 'biceps'
UNION ALL SELECT 'Cable Crunches', 'core', NULL
UNION ALL SELECT 'Calf Raises', 'lower_body', 'calves'
UNION ALL SELECT 'Deadlifts', 'lower_body', 'back'
UNION ALL SELECT 'Dips', 'upper_body', 'triceps';