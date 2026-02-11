import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { IconSymbol } from "./icon-symbol";

type ListItemProps = {
	icon?: React.ComponentProps<typeof IconSymbol>["name"];
	iconColor?: string;
	label: string;
	subtitle?: string;
	rightElement?: React.ReactNode;
	showChevron?: boolean;
	onPress?: () => void;
};

export function ListItem({
	icon,
	iconColor = Colors.textSecondary,
	label,
	subtitle,
	rightElement,
	showChevron = true,
	onPress,
}: ListItemProps) {
	return (
		<Pressable onPress={onPress} style={({ pressed }) => [styles.container, { opacity: pressed && onPress ? 0.7 : 1 }]}>
			{icon && <IconSymbol name={icon} size={18} color={iconColor} style={styles.icon} />}
			<View style={styles.content}>
				<Text style={styles.label}>{label}</Text>
				{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
			</View>
			{rightElement}
			{showChevron && <IconSymbol name="chevron.right" size={18} color={Colors.textTertiary} />}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.md,
		backgroundColor: Colors.inputBg,
		borderRadius: BorderRadius.md,
	},
	icon: {
		marginRight: Spacing.md,
	},
	content: {
		flex: 1,
	},
	label: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.textPrimary,
	},
	subtitle: {
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
		marginTop: 2,
	},
});
