import { Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from "@/constants/theme";

type SegmentedControlProps = {
	options: string[];
	selectedIndex: number;
	onChange: (index: number) => void;
};

export function SegmentedControl({ options, selectedIndex, onChange }: SegmentedControlProps) {
	return (
		<View style={styles.container}>
			{options.map((option, index) => {
				const isActive = index === selectedIndex;
				return (
					<Pressable
						key={option}
						onPress={() => onChange(index)}
						style={[styles.segment, isActive && styles.segmentActive]}
					>
						<Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{option}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		backgroundColor: Colors.secondaryBg,
		borderRadius: BorderRadius.md,
		padding: Spacing.xs,
	},
	segment: {
		flex: 1,
		paddingVertical: Spacing.sm + 2,
		alignItems: "center",
		borderRadius: BorderRadius.sm,
	},
	segmentActive: {
		backgroundColor: Colors.primary,
		...Shadows.subtle,
	},
	segmentText: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
		color: Colors.textSecondary,
		textTransform: "capitalize",
	},
	segmentTextActive: {
		color: Colors.primaryText,
	},
});
