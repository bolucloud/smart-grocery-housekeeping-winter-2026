import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from "@/constants/theme";
import { IconSymbol } from "./icon-symbol";

type AlertVariant = "info" | "warning" | "error" | "success";

type AlertBannerProps = {
	variant: AlertVariant;
	title?: string;
	message: string;
	icon?: React.ReactNode;
};

const variantConfig = {
	info: {
		bg: Colors.blueBg,
		border: Colors.blueBorder,
		titleColor: Colors.blueTextDark,
		textColor: Colors.blueTextDark,
		iconName: "info.circle.fill" as const,
		iconColor: Colors.blueText,
	},
	warning: {
		bg: Colors.amberBg,
		border: Colors.amberBorder,
		titleColor: Colors.amberTextDark,
		textColor: Colors.amberTextDark,
		iconName: "exclamationmark.triangle.fill" as const,
		iconColor: Colors.amberText,
	},
	error: {
		bg: Colors.redBg,
		border: Colors.redBorder,
		titleColor: Colors.redTextDark,
		textColor: Colors.redTextDark,
		iconName: "exclamationmark.triangle.fill" as const,
		iconColor: Colors.redText,
	},
	success: {
		bg: Colors.greenBg,
		border: Colors.greenBorder,
		titleColor: Colors.greenTextDark,
		textColor: Colors.greenTextDark,
		iconName: "checkmark.circle.fill" as const,
		iconColor: Colors.greenText,
	},
};

export function AlertBanner({ variant, title, message, icon }: AlertBannerProps) {
	const config = variantConfig[variant];

	return (
		<View
			style={[
				styles.banner,
				{
					backgroundColor: config.bg,
					borderColor: config.border,
				},
			]}
		>
			{icon || <IconSymbol name={config.iconName} size={20} color={config.iconColor} style={styles.icon} />}
			<View style={styles.content}>
				{title && <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>}
				<Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: "row",
		borderRadius: BorderRadius.lg,
		padding: Spacing.base,
		borderWidth: 1,
		gap: Spacing.md,
		...Shadows.subtle,
	},
	icon: {
		marginTop: 2,
	},
	content: {
		flex: 1,
		gap: Spacing.xs,
	},
	title: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
	},
	message: {
		fontSize: FontSizes.sm,
		lineHeight: 20,
	},
});
