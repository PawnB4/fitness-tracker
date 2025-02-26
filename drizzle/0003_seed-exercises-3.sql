INSERT INTO exercises (name, type, description, primary_muscle_group, secondary_muscle_groups) 
SELECT 'Push-Ups', 'Upper Body', 'Bodyweight exercise lowering and raising your body using arms', 'Chest', 'Triceps, Shoulders, Core'
UNION ALL SELECT 'Quad Extension', 'Lower Body', 'Seated exercise extending your legs to work the quads', 'Quadriceps', 'Knee Stabilizers'
UNION ALL SELECT 'Squats', 'Lower Body', 'Bending your knees and hips to lower your body then standing back up', 'Quadriceps', 'Glutes, Hamstrings, Lower Back'
UNION ALL SELECT 'Romanian Deadlift', 'Lower Body', 'Hinge movement with stiff legs focusing on hamstrings', 'Hamstrings', 'Glutes, Lower Back'
UNION ALL SELECT 'Seated Row', 'Upper Body', 'Pulling a handle toward your torso while seated', 'Middle Back', 'Biceps, Lats'
UNION ALL SELECT 'Skull Crushers', 'Upper Body', 'Lying triceps extensions where the bar comes near forehead', 'Triceps', 'Forearms'
UNION ALL SELECT 'Triceps Pushdown', 'Upper Body', 'Using cable to push attachment down to work triceps', 'Triceps', 'Forearms'
UNION ALL SELECT 'Chest Fly', 'Upper Body', 'Arc motion with arms to stretch and contract chest', 'Chest', 'Shoulders'
UNION ALL SELECT 'Planks', 'Core', 'Isometric core exercise in pushup position', 'Core', 'Shoulders, Back, Glutes'
UNION ALL SELECT 'Russian Twists', 'Core', 'Seated rotation exercise for obliques', 'Obliques', 'Abs, Hip Flexors'
UNION ALL SELECT 'Lunges', 'Lower Body', 'Stepping forward and lowering body to work legs', 'Quadriceps', 'Glutes, Hamstrings, Calves';