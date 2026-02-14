import { StyleSheet, TextInput, View } from "react-native";
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from "@/constants/theme";
import { IconSymbol } from "./icon-symbol";

type SearchBarProps = {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = "Search..." }: SearchBarProps) {
	return (
		<View style={styles.container}>
			<IconSymbol name="magnifyingglass" size={18} color={Colors.textTertiary} />
			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={Colors.textTertiary}
				style={styles.input}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.surface,
		borderRadius: BorderRadius.md,
		paddingHorizontal: Spacing.base,
		paddingVertical: Spacing.md,
		gap: Spacing.sm,
		...Shadows.subtle,
	},
	input: {
		flex: 1,
		fontSize: FontSizes.sm,
		color: Colors.textPrimary,
		padding: 0,
	},
});
