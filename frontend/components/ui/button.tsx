import type React from "react";
import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from "@/constants/theme";
import { IconSymbol } from "./icon-symbol";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
	title: string;
	onPress: () => void;
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: React.ComponentProps<typeof IconSymbol>["name"];
	disabled?: boolean;
	fullWidth?: boolean;
	style?: StyleProp<ViewStyle>;
};

const sizeStyles = {
	sm: {
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.base,
		fontSize: FontSizes.xs,
	},
	md: {
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.lg,
		fontSize: FontSizes.sm,
	},
	lg: {
		paddingVertical: 14,
		paddingHorizontal: Spacing.xl,
		fontSize: FontSizes.sm,
	},
};

const variantStyles = {
	primary: {
		bg: Colors.primary,
		text: Colors.primaryText,
		border: Colors.primary,
	},
	secondary: {
		bg: Colors.secondaryBg,
		text: Colors.secondaryText,
		border: Colors.secondaryBg,
	},
	danger: {
		bg: Colors.redBg,
		text: Colors.redTextDark,
		border: Colors.redBorder,
	},
	success: {
		bg: Colors.greenBg,
		text: Colors.greenTextDark,
		border: Colors.greenBorder,
	},
};

export function Button({
	title,
	onPress,
	variant = "primary",
	size = "md",
	icon,
	disabled = false,
	fullWidth = false,
	style,
}: ButtonProps) {
	const colors = variantStyles[variant];
	const sizing = sizeStyles[size];

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.base,
				{
					backgroundColor: colors.bg,
					borderColor: colors.border,
					paddingVertical: sizing.paddingVertical,
					paddingHorizontal: sizing.paddingHorizontal,
					opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
					transform: [{ scale: pressed ? 0.98 : 1 }],
				},
				fullWidth && styles.fullWidth,
				variant === "primary" && Shadows.medium,
				style,
			]}
		>
			{icon && <IconSymbol name={icon} size={sizing.fontSize + 2} color={colors.text} style={styles.icon} />}
			<Text style={[styles.text, { color: colors.text, fontSize: sizing.fontSize }]}>{title}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: BorderRadius.md,
		borderWidth: 1,
		gap: Spacing.sm,
	},
	fullWidth: {
		width: "100%",
	},
	text: {
		fontWeight: FontWeights.semibold,
	},
	icon: {
		marginRight: -Spacing.xs,
	},
});
