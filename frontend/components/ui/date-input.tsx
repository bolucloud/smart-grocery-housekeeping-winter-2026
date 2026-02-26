import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { IconSymbol } from "./icon-symbol";

type DateInputProps = {
	label?: string;
	required?: boolean;
	value: string; // YYYY-MM-DD or empty string
	onChange: (date: string) => void;
	placeholder?: string;
	minimumDate?: Date;
	maximumDate?: Date;
};

// Parse a YYYY-MM-DD string as local time (avoids UTC-offset off-by-one day issues)
function parseLocalDate(dateStr: string): Date {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(y, m - 1, d);
}

// Format a Date as "Mon DD, YYYY" for display
function formatDisplay(date: Date): string {
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Format a Date back to YYYY-MM-DD for storage
function toISODate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function DateInput({
	label,
	required,
	value,
	onChange,
	placeholder = "Select a date",
	minimumDate,
	maximumDate,
}: DateInputProps) {
	const [showPicker, setShowPicker] = useState(false);

	const dateValue = value ? parseLocalDate(value) : new Date();
	const displayText = value ? formatDisplay(parseLocalDate(value)) : null;

	// Android fires onChange inline — no modal needed
	const handleAndroidChange = (_event: DateTimePickerEvent, selected?: Date) => {
		setShowPicker(false);
		if (selected) onChange(toISODate(selected));
	};

	// iOS picker updates as the user scrolls — we commit on "Done"
	const [iosDraft, setIosDraft] = useState<Date>(dateValue);

	const handleIosChange = (_event: DateTimePickerEvent, selected?: Date) => {
		if (selected) setIosDraft(selected);
	};

	const handleIosDone = () => {
		onChange(toISODate(iosDraft));
		setShowPicker(false);
	};

	const openPicker = () => {
		setIosDraft(dateValue);
		setShowPicker(true);
	};

	return (
		<View>
			{label && (
				<Text style={styles.label}>
					{label}
					{required && <Text style={styles.required}> *</Text>}
				</Text>
			)}

			<Pressable
				onPress={openPicker}
				style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
			>
				<Text style={[styles.triggerText, !displayText && styles.placeholder]}>
					{displayText ?? placeholder}
				</Text>
				<IconSymbol name="calendar" size={18} color={Colors.textTertiary} />
			</Pressable>

			{/* Android: render picker directly — it shows as a system dialog */}
			{Platform.OS === "android" && showPicker && (
				<DateTimePicker
					value={dateValue}
					mode="date"
					display="default"
					onChange={handleAndroidChange}
					minimumDate={minimumDate}
					maximumDate={maximumDate}
				/>
			)}

			{/* iOS: bottom sheet modal with fade backdrop, same style as SelectInput */}
			{Platform.OS === "ios" && (
				<Modal
					visible={showPicker}
					transparent
					animationType="fade"
					onRequestClose={() => setShowPicker(false)}
				>
					<Pressable style={styles.backdrop} onPress={() => setShowPicker(false)}>
						<Pressable style={styles.sheet} onPress={() => {}}>
							<View style={styles.sheetHeader}>
								<Pressable onPress={() => setShowPicker(false)}>
									<Text style={styles.sheetCancel}>Cancel</Text>
								</Pressable>
								<Text style={styles.sheetTitle}>{label ?? "Select date"}</Text>
								<Pressable onPress={handleIosDone}>
									<Text style={styles.sheetDone}>Done</Text>
								</Pressable>
							</View>
							<DateTimePicker
								value={iosDraft}
								mode="date"
								display="spinner"
								onChange={handleIosChange}
								minimumDate={minimumDate}
								maximumDate={maximumDate}
								themeVariant="light"
								style={styles.picker}
							/>
						</Pressable>
					</Pressable>
				</Modal>
			)}
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
	triggerPressed: {
		opacity: 0.7,
	},
	triggerText: {
		fontSize: FontSizes.sm,
		color: Colors.textPrimary,
		flex: 1,
	},
	placeholder: {
		color: Colors.textTertiary,
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
		paddingBottom: Spacing["4xl"],
		maxHeight: "55%",
	},
	sheetHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.base,
		paddingVertical: Spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderSubtle,
	},
	sheetTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	sheetCancel: {
		fontSize: FontSizes.base,
		color: Colors.textSecondary,
	},
	sheetDone: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.primary,
	},
	picker: {
		width: "100%",
		alignSelf: "center",
	},
});
