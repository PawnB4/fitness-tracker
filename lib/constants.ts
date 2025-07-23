export const NAV_THEME = {
	light: {
		background: "hsl(220 20% 97%)", // background
		border: "hsl(220 15% 90%)", // border
		card: "hsl(220 20% 97%)", // card
		notification: "hsl(0 84.2% 60.2%)", // destructive
		primary: "hsl(225 15% 10%)", // primary
		text: "hsl(225 15% 16%)", // foreground
	},
	dark: {
		background: "hsl(225 15% 16%)", // background
		border: "hsl(225 15% 28%)", // border
		card: "hsl(225 15% 16%)", // card
		notification: "hsl(0 72% 51%)", // destructive
		primary: "hsl(220 20% 97%)", // primary
		text: "hsl(220 20% 97%)", // foreground
	},
};

export const CHART_THEME = {
	light: {
		primary: "hsl(225, 15%, 16%)",
		background: "hsl(220, 20%, 97%)",
		foreground: "hsl(225, 15%, 16%)",
		muted: "hsl(220, 14%, 96%)",
		mutedForeground: "hsl(220, 9%, 46%)",
		accent: "hsl(220, 14%, 96%)",
		accentForeground: "hsl(220, 9%, 15%)",
		border: "hsl(220, 13%, 91%)",
		gradient: {
			start: "#0ea5e9",
			end: "#075985",
		},
		tooltipBg: "hsl(0, 0%, 100%)",
		tooltipBorder: "hsl(220, 13%, 91%)",
		trendPositive: "#10b981",
		trendNegative: "#ef4444",
	},
	dark: {
		primary: "hsl(220, 20%, 97%)",
		background: "hsl(225, 15%, 16%)",
		foreground: "hsl(220, 20%, 97%)",
		muted: "hsl(225, 15%, 16%)",
		mutedForeground: "hsl(220, 9%, 54%)",
		accent: "hsl(225, 15%, 16%)",
		accentForeground: "hsl(220, 20%, 97%)",
		border: "hsl(225, 15%, 21%)",
		gradient: {
			start: "#0ea5e9",
			end: "#0284c7",
		},
		tooltipBg: "hsl(225, 15%, 21%)",
		tooltipBorder: "hsl(225, 15%, 26%)",
		trendPositive: "#22c55e",
		trendNegative: "#f87171",
	},
};

export const EXERCISE_TYPES_COLOR_MAP: Record<string, string> = {
	upper_body: "#16a34a",
	lower_body: "#8b5cf6",
	core: "#ef4444",
	cardio: "#0284c7",
};

export const EXERCISES_TYPES: Record<string, Record<string, string>> = {
	en: {
		upper_body: "Upper Body",
		lower_body: "Lower Body",
		core: "Core",
		cardio: "Cardio",
	},
	es: {
		upper_body: "Tren superior",
		lower_body: "Tren inferior",
		core: "Core",
		cardio: "Cardio",
	},
};

export const MUSCLE_GROUPS: Record<string, Record<string, string>> = {
	en: {
		back: "Back",
		biceps: "Biceps",
		calves: "Calves",
		cardio: "Cardio",
		chest: "Chest",
		forearms: "Forearms",
		glutes: "Glutes",
		hamstrings: "Hamstrings",
		quadriceps: "Quadriceps",
		shoulders: "Shoulders",
		traps: "Traps",
		triceps: "Triceps",
	},
	es: {
		back: "Espalda",
		biceps: "Biceps",
		calves: "Pantorrillas",
		cardio: "Cardio",
		chest: "Pecho",
		forearms: "Antebrazos",
		glutes: "Glúteos",
		hamstrings: "Isquios",
		quadriceps: "Cuádriceps",
		shoulders: "Hombros",
		traps: "Trapecios",
		triceps: "Tríceps",
	},
};

export const EXERCISES = [
	"Abductor Machine",
	"Barbell Row",
	"Bench Press",
	"Bicep Curls (Cable)",
	"Bicep Curls (Dumbbells)",
	"Cable Crunches",
	"Calf Raises",
	"Chest Fly",
	"Deadlifts",
	"Dips",
	"Face Pulls",
	"Hamstring Curl (Lying)",
	"Hamstring Curl (Seated)",
	"Incline Dumbbell Curls",
	"Incline Dumbbell Press",
	"Lat Pulldown",
	"Lateral Raises",
	"Leg Press",
	"Leg Raises",
	"Lunges",
	"Overhead Press",
	"Planks",
	"Pull-Ups",
	"Push-Ups",
	"Quad Extension",
	"Romanian Deadlift",
	"Russian Twists",
	"Seated Row",
	"Skull Crushers",
	"Squats",
	"Triceps Pushdown",
];

// Common timezones with GMT offsets
export const TIMEZONES = [
	{ label: "GMT-12:00", value: "Etc/GMT+12" },
	{ label: "GMT-11:00", value: "Etc/GMT+11" },
	{ label: "GMT-10:00", value: "Etc/GMT+10" },
	{ label: "GMT-09:00", value: "Etc/GMT+9" },
	{ label: "GMT-08:00", value: "Etc/GMT+8" },
	{ label: "GMT-07:00", value: "Etc/GMT+7" },
	{ label: "GMT-06:00", value: "Etc/GMT+6" },
	{ label: "GMT-05:00", value: "Etc/GMT+5" },
	{ label: "GMT-04:00", value: "Etc/GMT+4" },
	{ label: "GMT-03:00", value: "America/Argentina/Buenos_Aires" },
	{ label: "GMT-02:00", value: "Etc/GMT+2" },
	{ label: "GMT-01:00", value: "Etc/GMT+1" },
	{ label: "GMT+00:00", value: "Etc/GMT+0" },
	{ label: "GMT+01:00", value: "Etc/GMT-1" },
	{ label: "GMT+02:00", value: "Etc/GMT-2" },
	{ label: "GMT+03:00", value: "Etc/GMT-3" },
	{ label: "GMT+04:00", value: "Etc/GMT-4" },
	{ label: "GMT+05:00", value: "Etc/GMT-5" },
	{ label: "GMT+05:30", value: "Asia/Kolkata" },
	{ label: "GMT+06:00", value: "Etc/GMT-6" },
	{ label: "GMT+07:00", value: "Etc/GMT-7" },
	{ label: "GMT+08:00", value: "Etc/GMT-8" },
	{ label: "GMT+09:00", value: "Etc/GMT-9" },
	{ label: "GMT+10:00", value: "Etc/GMT-10" },
	{ label: "GMT+11:00", value: "Etc/GMT-11" },
	{ label: "GMT+12:00", value: "Etc/GMT-12" },
];

export const DIALOG_CONTENT_MAP = {
	WORKOUT_PLAN_EXERCISE_FORM: "WorkoutPlanExerciseForm",
	WORKOUT_EXERCISE_FORM: "WorkoutExerciseForm",
	EXERCISE_FORM: "ExerciseForm",
};
