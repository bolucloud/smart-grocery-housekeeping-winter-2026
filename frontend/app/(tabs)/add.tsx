import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QuantityStepper } from "@/components/grocery";
import { Button, Card, IconSymbol, SegmentedControl, StyledTextInput } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

const categories = ["Vegetable", "Fruit", "Packaged"];

export default function AddItemScreen() {
	const [name, setName] = useState("");
	const [categoryIndex, setCategoryIndex] = useState(0);
	const [quantity, setQuantity] = useState(1);

	return (
		<SafeAreaView style={CommonStyles.screen} edges={["top"]}>
			<View style={styles.header}>
				<Text style={styles.title}>Add Item</Text>
			</View>

			<ScrollView contentContainerStyle={CommonStyles.screenContent}>
				{/* Scan Button */}
				<Card style={styles.scanCard}>
					<View style={styles.scanIcon}>
						<IconSymbol name="camera.fill" size={28} color={Colors.primaryText} />
					</View>
					<Text style={styles.scanTitle}>Scan Item</Text>
					<Text style={styles.scanSubtitle}>Use camera to identify groceries</Text>
				</Card>

				{/* Manual Entry Form */}
				<Card>
					<Text style={styles.formTitle}>Manual Entry</Text>

					<View style={styles.formFields}>
						<StyledTextInput
							label="Item Name"
							required
							value={name}
							onChangeText={setName}
							placeholder="e.g. Carrots"
							maxLength={50}
							hint={`${name.length}/50 characters`}
						/>

						<View>
							<Text style={CommonStyles.label}>Category</Text>
							<SegmentedControl options={categories} selectedIndex={categoryIndex} onChange={setCategoryIndex} />
						</View>

						<View>
							<Text style={CommonStyles.label}>Quantity</Text>
							<QuantityStepper
								value={quantity}
								onIncrement={() => setQuantity((q) => q + 1)}
								onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
								min={1}
							/>
						</View>

						<StyledTextInput label="Best Before Date" required placeholder="YYYY-MM-DD" />

						<Button title="Add to Inventory" onPress={() => {}} fullWidth size="lg" />
					</View>
				</Card>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.base,
		backgroundColor: Colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderSubtle,
	},
	title: {
		fontSize: FontSizes.xl,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	scanCard: {
		alignItems: "center",
		paddingVertical: Spacing["2xl"],
	},
	scanIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.base,
	},
	scanTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	scanSubtitle: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
	},
	formTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		marginBottom: Spacing.base,
	},
	formFields: {
		gap: Spacing.base,
	},
});
