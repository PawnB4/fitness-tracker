INSERT INTO exercises (name, type, description, primary_muscle_group, secondary_muscle_groups) 
SELECT 'Face Pulls', 'Upper Body', 'Pulling a cable attachment toward your face with arms wide', 'Rear Delts', 'Traps, Rhomboids'
UNION ALL SELECT 'Hamstring Curl (Lying)', 'Lower Body', 'Lying face down and curling weight with your legs', 'Hamstrings', 'Calves'
UNION ALL SELECT 'Hamstring Curl (Seated)', 'Lower Body', 'Seated version of hamstring curls', 'Hamstrings', 'Calves'
UNION ALL SELECT 'Incline Dumbbell Press', 'Upper Body', 'Bench pressing dumbbells on an inclined bench', 'Upper Chest', 'Shoulders, Triceps'
UNION ALL SELECT 'Lat Pulldown', 'Upper Body', 'Pulling a bar down from above your head while seated', 'Lats', 'Biceps, Rhomboids'
UNION ALL SELECT 'Lateral Raises', 'Upper Body', 'Raising weights out to your sides to target shoulders', 'Side Delts', 'Traps'
UNION ALL SELECT 'Leg Press', 'Lower Body', 'Pushing weight away using your legs while seated', 'Quadriceps', 'Glutes, Hamstrings'
UNION ALL SELECT 'Leg Raises', 'Core', 'Lying on back and raising legs to work lower abs', 'Lower Abs', 'Hip Flexors'
UNION ALL SELECT 'Overhead Press', 'Upper Body', 'Pressing weight overhead while standing or seated', 'Shoulders', 'Triceps, Upper Chest'
UNION ALL SELECT 'Pull-Ups', 'Upper Body', 'Pulling your body up to a bar from hanging position', 'Lats', 'Biceps, Rhomboids, Forearms';