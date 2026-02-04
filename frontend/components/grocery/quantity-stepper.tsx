import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

type QuantityStepperProps = {
	value: number;
	onIncrement: () => void;
	onDecrement: () => void;
	min?: number;
	max?: number;
};

export function QuantityStepper({ value, onIncrement, onDecrement, min = 0, max = 999 }: QuantityStepperProps) {
	const canDecrement = value > min;
	const canIncrement = value < max;

	return (
		<View style={styles.container}>
			<Pressable
				onPress={onDecrement}
				disabled={!canDecrement}
				style={({ pressed }) => [
					styles.button,
					!canDecrement && styles.buttonDisabled,
					{ opacity: pressed && canDecrement ? 0.7 : 1 },
				]}
			>
				<IconSymbol name="minus" size={18} color={canDecrement ? Colors.textPrimary : Colors.textTertiary} />
			</Pressable>
			<Text style={styles.value}>{value}</Text>
			<Pressable
				onPress={onIncrement}
				disabled={!canIncrement}
				style={({ pressed }) => [
					styles.button,
					!canIncrement && styles.buttonDisabled,
					{ opacity: pressed && canIncrement ? 0.7 : 1 },
				]}
			>
				<IconSymbol name="plus" size={18} color={canIncrement ? Colors.textPrimary : Colors.textTertiary} />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
	},
	button: {
		width: 40,
		height: 40,
		borderRadius: BorderRadius.sm,
		backgroundColor: Colors.secondaryBg,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	value: {
		fontSize: FontSizes.xl,
		fontWeight: FontWeights.bold,
		color: Colors.textPrimary,
		minWidth: 40,
		textAlign: "center",
	},
});
