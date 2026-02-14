import { Platform } from "react-native";

// ─── Color Tokens ───────────────────────────────────────────
export const Colors = {
	// Backgrounds
	background: "#FAFAFA",
	surface: "#FFFFFF",
	inputBg: "#F9FAFB",

	// Text
	textPrimary: "#111827",
	textSecondary: "#6B7280",
	textTertiary: "#9CA3AF",
	textLabel: "#374151",

	// Interactive
	primary: "#111827",
	primaryText: "#FFFFFF",

	// Borders
	border: "#E5E7EB",
	borderSubtle: "#F3F4F6",

	// Tab bar
	tint: "#111827",
	tabIconDefault: "#6B7280",
	tabIconSelected: "#111827",

	// Status: Green (fresh / success)
	greenBg: "#DCFCE7",
	greenBorder: "#BBF7D0",
	greenText: "#15803D",
	greenTextDark: "#166534",

	// Status: Orange (fruit)
	orangeBg: "#FFEDD5",
	orangeBorder: "#FED7AA",
	orangeText: "#9A3412",

	// Status: Blue (info / packaged)
	blueBg: "#DBEAFE",
	blueBorder: "#BFDBFE",
	blueText: "#1D4ED8",
	blueTextDark: "#1E3A8A",

	// Status: Red (expired / danger)
	redBg: "#FEE2E2",
	redBorder: "#FECACA",
	redText: "#B91C1C",
	redTextDark: "#991B1B",

	// Status: Amber (warning)
	amberBg: "#FEF3C7",
	amberBorder: "#FDE68A",
	amberText: "#B45309",
	amberTextDark: "#92400E",

	// Secondary / muted
	secondaryBg: "#F3F4F6",
	secondaryText: "#374151",
} as const;

// ─── Typography Tokens ──────────────────────────────────────
export const FontSizes = {
	xs: 12,
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	"2xl": 24,
	"3xl": 30,
} as const;

export const FontWeights = {
	medium: "500" as const,
	semibold: "600" as const,
	bold: "700" as const,
};

// ─── Spacing Tokens ─────────────────────────────────────────
export const Spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	base: 16,
	lg: 20,
	xl: 24,
	"2xl": 32,
	"3xl": 40,
	"4xl": 64,
} as const;

// ─── Border Radius Tokens ───────────────────────────────────
export const BorderRadius = {
	sm: 8,
	md: 12,
	lg: 16,
	full: 9999,
} as const;

// ─── Shadow Tokens ──────────────────────────────────────────
export const Shadows = {
	subtle: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 1,
	},
	medium: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	elevated: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.12,
		shadowRadius: 24,
		elevation: 4,
	},
	floating: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 6,
	},
} as const;

// ─── Font Families (platform-aware) ─────────────────────────
export const Fonts = Platform.select({
	ios: {
		sans: "System",
		serif: "Georgia",
		rounded: "System",
		mono: "Menlo",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	},
});
