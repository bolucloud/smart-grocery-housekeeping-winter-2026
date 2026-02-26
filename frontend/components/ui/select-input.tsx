import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { IconSymbol } from "./icon-symbol";

export type SelectOption = {
	value: string;
	label: string;
};

type SelectInputProps = {
	label?: string;
	required?: boolean;
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

export function SelectInput({
	label,
	required,
	options,
	value,
	onChange,
	placeholder = "Select...",
}: SelectInputProps) {
	const [open, setOpen] = useState(false);
	const selectedLabel = options.find((o) => o.value === value)?.label;

	return (
		<View>
			{label && (
				<Text style={styles.label}>
					{label}
					{required && <Text style={styles.required}> *</Text>}
				</Text>
			)}

			<Pressable onPress={() => setOpen(true)} style={styles.trigger}>
				<Text style={[styles.triggerText, !selectedLabel && styles.placeholder]}>
					{selectedLabel ?? placeholder}
				</Text>
				<IconSymbol name="chevron.right" size={14} color={Colors.textTertiary} style={styles.chevron} />
			</Pressable>

			<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
				<Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
					<Pressable style={styles.sheet} onPress={() => {}}>
						<Text style={styles.sheetTitle}>{label ?? "Select"}</Text>
						<FlatList
							data={options}
							keyExtractor={(item) => item.value}
							renderItem={({ item }) => {
								const isSelected = item.value === value;
								return (
									<Pressable
										style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
										onPress={() => {
											onChange(item.value);
											setOpen(false);
										}}
									>
										<Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
											{item.label}
										</Text>
										{isSelected && (
											<IconSymbol name="checkmark.circle.fill" size={18} color={Colors.greenText} />
										)}
									</Pressable>
								);
							}}
						/>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	label: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.textLabel,
		marginBottom: Spacing.sm,
	},
	required: {
		color: Colors.redText,
	},
	trigger: {
		backgroundColor: Colors.inputBg,
		borderWidth: 1,
		borderColor: Colors.border,
		borderRadius: BorderRadius.md,
		paddingHorizontal: Spacing.base,
		paddingVertical: Spacing.md,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	triggerText: {
		fontSize: FontSizes.sm,
		color: Colors.textPrimary,
		flex: 1,
	},
	placeholder: {
		color: Colors.textTertiary,
	},
	chevron: {
		transform: [{ rotate: "90deg" }],
	},
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: Colors.surface,
		borderTopLeftRadius: BorderRadius.lg,
		borderTopRightRadius: BorderRadius.lg,
		paddingTop: Spacing.base,
		paddingBottom: Spacing["4xl"],
		maxHeight: "60%",
	},
	sheetTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		paddingHorizontal: Spacing.base,
		paddingBottom: Spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderSubtle,
		marginBottom: Spacing.xs,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.base,
		paddingVertical: Spacing.md,
	},
	optionPressed: {
		backgroundColor: Colors.borderSubtle,
	},
	optionText: {
		fontSize: FontSizes.sm,
		color: Colors.textPrimary,
	},
	optionTextSelected: {
		fontWeight: FontWeights.semibold,
	},
});
