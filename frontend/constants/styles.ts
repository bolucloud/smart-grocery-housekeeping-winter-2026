import { StyleSheet } from "react-native";
import {
	BorderRadius,
	Colors,
	FontSizes,
	FontWeights,
	Shadows,
	Spacing,
} from "./theme";

export const CommonStyles = StyleSheet.create({
	// Screen containers
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	screenPadded: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: Spacing.lg,
	},
	screenContent: {
		paddingHorizontal: Spacing.lg,
		paddingBottom: Spacing["4xl"],
		paddingTop: Spacing.lg,
		gap: Spacing.lg,
	},

	// Card base
	card: {
		backgroundColor: Colors.surface,
		borderRadius: BorderRadius.lg,
		padding: Spacing.base,
		...Shadows.subtle,
	},

	// Typography
	heading1: {
		fontSize: FontSizes["3xl"],
		fontWeight: FontWeights.bold,
		color: Colors.textPrimary,
	},
	heading2: {
		fontSize: FontSizes["2xl"],
		fontWeight: FontWeights.bold,
		color: Colors.textPrimary,
	},
	heading3: {
		fontSize: FontSizes.xl,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	sectionTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		paddingHorizontal: Spacing.xs,
	},
	bodyText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.textPrimary,
	},
	bodyTextSecondary: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
	},
	caption: {
		fontSize: FontSizes.xs,
		color: Colors.textTertiary,
	},
	label: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.textLabel,
		marginBottom: Spacing.sm,
	},

	// Layout helpers
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	center: {
		alignItems: "center",
		justifyContent: "center",
	},
});
