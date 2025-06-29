INSERT INTO exercises (name, type, primary_muscle_group) 
SELECT 'Face Pulls', 'Upper Body', 'Rear Delts'
UNION ALL SELECT 'Hamstring Curl (Lying)', 'Lower Body', 'Hamstrings'
UNION ALL SELECT 'Hamstring Curl (Seated)', 'Lower Body', 'Hamstrings'
UNION ALL SELECT 'Incline Dumbbell Press', 'Upper Body', 'Upper Chest'
UNION ALL SELECT 'Lat Pulldown', 'Upper Body', 'Lats'
UNION ALL SELECT 'Lateral Raises', 'Upper Body', 'Side Delts'
UNION ALL SELECT 'Leg Press', 'Lower Body', 'Quadriceps'
UNION ALL SELECT 'Leg Raises', 'Core', 'Lower Abs'
UNION ALL SELECT 'Overhead Press', 'Upper Body', 'Shoulders'
UNION ALL SELECT 'Pull-Ups', 'Upper Body', 'Lats';