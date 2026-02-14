import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { IconSymbol } from "./icon-symbol";

type EmptyStateProps = {
	icon: React.ComponentProps<typeof IconSymbol>["name"];
	title: string;
	description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
	return (
		<View style={styles.container}>
			<View style={styles.iconCircle}>
				<IconSymbol name={icon} size={40} color={Colors.textTertiary} />
			</View>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.description}>{description}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		paddingVertical: Spacing["4xl"],
		paddingHorizontal: Spacing.base,
	},
	iconCircle: {
		width: 80,
		height: 80,
		borderRadius: BorderRadius.full,
		backgroundColor: Colors.inputBg,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.base,
	},
	title: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		marginBottom: Spacing.sm,
	},
	description: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
		textAlign: "center",
	},
});
