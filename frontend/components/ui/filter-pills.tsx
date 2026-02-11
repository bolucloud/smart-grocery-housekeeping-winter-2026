import type React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from "@/constants/theme";

type FilterOption = {
	key: string;
	label: string;
	icon?: React.ReactNode;
};

type FilterPillsProps = {
	options: FilterOption[];
	selected: string;
	onSelect: (key: string) => void;
};

export function FilterPills({ options, selected, onSelect }: FilterPillsProps) {
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
			{options.map((option) => {
				const isActive = option.key === selected;
				return (
					<Pressable
						key={option.key}
						onPress={() => onSelect(option.key)}
						style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
					>
						<Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: Spacing.sm,
	},
	pill: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm + 2,
		borderRadius: BorderRadius.full,
	},
	pillActive: {
		backgroundColor: Colors.primary,
		...Shadows.medium,
	},
	pillInactive: {
		backgroundColor: Colors.surface,
		...Shadows.subtle,
	},
	pillText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
	},
	pillTextActive: {
		color: Colors.primaryText,
	},
	pillTextInactive: {
		color: Colors.textSecondary,
	},
});
