import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

type BadgeVariant = "green" | "red" | "amber" | "blue" | "orange" | "gray";

type BadgeProps = {
	label: string;
	variant?: BadgeVariant;
	size?: "sm" | "md";
};

const variantColors = {
	green: {
		bg: Colors.greenBg,
		border: Colors.greenBorder,
		text: Colors.greenTextDark,
	},
	red: {
		bg: Colors.redBg,
		border: Colors.redBorder,
		text: Colors.redTextDark,
	},
	amber: {
		bg: Colors.amberBg,
		border: Colors.amberBorder,
		text: Colors.amberTextDark,
	},
	blue: {
		bg: Colors.blueBg,
		border: Colors.blueBorder,
		text: Colors.blueTextDark,
	},
	orange: {
		bg: Colors.orangeBg,
		border: Colors.orangeBorder,
		text: Colors.orangeText,
	},
	gray: {
		bg: Colors.secondaryBg,
		border: Colors.border,
		text: Colors.secondaryText,
	},
};

export function Badge({ label, variant = "gray", size = "sm" }: BadgeProps) {
	const colors = variantColors[variant];

	return (
		<View
			style={[
				styles.badge,
				{
					backgroundColor: colors.bg,
					borderColor: colors.border,
				},
				size === "md" && styles.badgeMd,
			]}
		>
			<Text style={[styles.text, { color: colors.text }, size === "md" && styles.textMd]}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		paddingHorizontal: Spacing.sm + 2,
		paddingVertical: Spacing.xs,
		borderRadius: BorderRadius.full,
		borderWidth: 1,
		alignSelf: "flex-start",
	},
	badgeMd: {
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.xs + 2,
	},
	text: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
	},
	textMd: {
		fontSize: FontSizes.sm,
	},
});
