const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
	darkMode: "class",
	plugins: [require("tailwindcss-animate")],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
			borderWidth: {
				hairline: hairlineWidth(),
			},
			fontFamily: {
				"cabin": ["CabinSketch_400Regular"],
				"cabin-bold": ["CabinSketch_700Bold"],
				"lexend": ["Lexend_400Regular"],
				"lexend-medium": ["Lexend_500Medium"],
				"lexend-semibold": ["Lexend_600SemiBold"],
				"lexend-bold": ["Lexend_700Bold"],
				"lexend-extrabold": ["Lexend_800ExtraBold"],
				"funnel": ["FunnelSans_400Regular"],
				"funnel-medium": ["FunnelSans_500Medium"],
				"funnel-semibold": ["FunnelSans_600SemiBold"],
				"funnel-bold": ["FunnelSans_700Bold"],
				"funnel-extrabold": ["FunnelSans_800ExtraBold"],
			},
			colors: {
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				background: "hsl(var(--background))",
				border: "hsl(var(--border))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				foreground: "hsl(var(--foreground))",
				input: "hsl(var(--input))",
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				ring: "hsl(var(--ring))",
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
		},
	},
};
