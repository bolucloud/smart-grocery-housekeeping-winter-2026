import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from "@/constants/theme";

type StatCardProps = {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ComponentProps<typeof IconSymbol>["name"];
	iconColor?: string;
	backgroundColor?: string;
	borderColor?: string;
	titleColor?: string;
	subtitleColor?: string;
};

export function StatCard({
	title,
	value,
	subtitle,
	icon,
	iconColor = Colors.textSecondary,
	backgroundColor = Colors.surface,
	borderColor,
	titleColor = Colors.textSecondary,
	subtitleColor,
}: StatCardProps) {
	return (
		<View style={[styles.card, { backgroundColor }, borderColor && { borderWidth: 1, borderColor }]}>
			{icon && (
				<View style={styles.iconRow}>
					<IconSymbol name={icon} size={18} color={iconColor} />
					<Text style={[styles.title, { color: titleColor }]}>{title}</Text>
				</View>
			)}
			{!icon && <Text style={[styles.title, { color: titleColor }]}>{title}</Text>}
			<Text style={styles.value}>{value}</Text>
			{subtitle && <Text style={[styles.subtitle, subtitleColor && { color: subtitleColor }]}>{subtitle}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		padding: Spacing.base,
		borderRadius: BorderRadius.lg,
		...Shadows.subtle,
	},
	iconRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		marginBottom: Spacing.sm,
	},
	title: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	value: {
		fontSize: FontSizes["2xl"],
		fontWeight: FontWeights.bold,
		color: Colors.textPrimary,
	},
	subtitle: {
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
	},
});
