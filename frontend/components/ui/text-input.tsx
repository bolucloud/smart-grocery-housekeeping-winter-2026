import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

type StyledTextInputProps = TextInputProps & {
	label?: string;
	required?: boolean;
	error?: string;
	hint?: string;
};

export function StyledTextInput({ label, required, error, hint, style, ...rest }: StyledTextInputProps) {
	return (
		<View style={styles.container}>
			{label && (
				<Text style={styles.label}>
					{label}
					{required && <Text style={styles.required}> *</Text>}
				</Text>
			)}
			<TextInput
				style={[styles.input, error && styles.inputError, style]}
				placeholderTextColor={Colors.textTertiary}
				{...rest}
			/>
			{error && <Text style={styles.error}>{error}</Text>}
			{hint && !error && <Text style={styles.hint}>{hint}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 0,
	},
	label: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.textLabel,
		marginBottom: Spacing.sm,
	},
	required: {
		color: Colors.redText,
	},
	input: {
		backgroundColor: Colors.inputBg,
		borderWidth: 1,
		borderColor: Colors.border,
		borderRadius: BorderRadius.md,
		paddingHorizontal: Spacing.base,
		paddingVertical: Spacing.md,
		fontSize: FontSizes.sm,
		color: Colors.textPrimary,
	},
	inputError: {
		borderColor: Colors.redText,
	},
	error: {
		fontSize: FontSizes.xs,
		color: Colors.redText,
		marginTop: Spacing.xs,
	},
	hint: {
		fontSize: FontSizes.xs,
		color: Colors.textTertiary,
		marginTop: Spacing.xs,
	},
});
