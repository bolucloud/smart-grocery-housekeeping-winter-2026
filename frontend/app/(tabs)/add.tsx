import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
	BarcodeScannerModal,
	Button,
	Card,
	DateInput,
	IconSymbol,
	SegmentedControl,
	SelectInput,
	StyledTextInput,
} from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

// ─── Constants ───────────────────────────────────────────────

const STORAGE_LOCATIONS = ["Fridge", "Pantry", "Freezer"];

const CATEGORY_OPTIONS = [
	{ value: "Produce", label: "Produce" },
	{ value: "Dairy", label: "Dairy" },
	{ value: "Meat", label: "Meat" },
	{ value: "Pantry", label: "Pantry" },
	{ value: "Frozen", label: "Frozen" },
	{ value: "Beverages", label: "Beverages" },
	{ value: "Bakery", label: "Bakery" },
	{ value: "Snacks", label: "Snacks" },
	{ value: "Deli", label: "Deli" },
	{ value: "Seafood", label: "Seafood" },
	{ value: "Household", label: "Household" },
	{ value: "Personal Care", label: "Personal Care" },
];

const UNIT_OPTIONS = [
	{ value: "ct", label: "Count (ct)" },
	{ value: "piece", label: "Piece" },
	{ value: "bag", label: "Bag" },
	{ value: "box", label: "Box" },
	{ value: "bottle", label: "Bottle" },
	{ value: "can", label: "Can" },
	{ value: "jar", label: "Jar" },
	{ value: "carton", label: "Carton" },
	{ value: "tub", label: "Tub" },
	{ value: "container", label: "Container" },
	{ value: "pack", label: "Pack" },
	{ value: "loaf", label: "Loaf" },
	{ value: "pouch", label: "Pouch" },
];

const SIZE_UNIT_OPTIONS = [
	{ value: "oz", label: "oz" },
	{ value: "fl oz", label: "fl oz" },
	{ value: "lb", label: "lb" },
	{ value: "g", label: "g" },
	{ value: "kg", label: "kg" },
	{ value: "ml", label: "ml" },
	{ value: "L", label: "L" },
	{ value: "gal", label: "gal" },
];

// ─── Open Food Facts helpers ──────────────────────────────────

function mapOFFCategory(tags: string[]): string | null {
	const s = tags.join(" ").toLowerCase();
	if (s.includes("dairy") || s.includes("milk") || s.includes("cheese") || s.includes("yogurt")) return "Dairy";
	if (s.includes("meat") || s.includes("poultry") || s.includes("chicken") || s.includes("beef")) return "Meat";
	if (s.includes("seafood") || s.includes("fish")) return "Seafood";
	if (s.includes("beverage") || s.includes("drink") || s.includes("juice")) return "Beverages";
	if (s.includes("frozen")) return "Frozen";
	if (s.includes("bread") || s.includes("bakery") || s.includes("pastry")) return "Bakery";
	if (s.includes("snack") || s.includes("chip") || s.includes("cracker") || s.includes("cookie")) return "Snacks";
	if (s.includes("produce") || s.includes("fruit") || s.includes("vegetable")) return "Produce";
	if (s.includes("deli")) return "Deli";
	return null;
}

// Parse OFF quantity string (e.g. "16 fl oz", "500 g") into size + sizeUnit
function parseOFFQuantity(raw: string): { size: string; sizeUnit: string } | null {
	const unitMap: [RegExp, string][] = [
		[/fl\.?\s*oz/i, "fl oz"],
		[/fluid\s*oz/i, "fl oz"],
		[/ounce?s?/i, "oz"],
		[/\boz\b/i, "oz"],
		[/pounds?|\blbs?\b/i, "lb"],
		[/kilograms?|\bkg\b/i, "kg"],
		[/grams?|\bg\b/i, "g"],
		[/millilitres?|milliliters?|\bml\b/i, "ml"],
		[/litres?|liters?|\bl\b/i, "L"],
		[/gallons?|\bgal\b/i, "gal"],
	];
	for (const [pattern, unit] of unitMap) {
		const match = raw.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:${pattern.source})`, "i"));
		if (match) return { size: match[1], sizeUnit: unit };
	}
	return null;
}

// ─── Types ───────────────────────────────────────────────────

type FormData = {
	name: string;
	brand: string;
	barcode: string;
	typeIndex: number;
	category: string;
	storageIndex: number;
	quantity: string;
	size: string;
	sizeUnit: string;
	unit: string;
	bestBeforeDate: string;
	purchaseDate: string;
	shelfLifeDays: string;
	notes: string;
};

type BarcodeStatus = "found" | "not-found" | "error" | null;

const DEFAULT_FORM: FormData = {
	name: "",
	brand: "",
	barcode: "",
	typeIndex: 0,
	category: "Produce",
	storageIndex: 1,
	quantity: "1",
	size: "",
	sizeUnit: "oz",
	unit: "ct",
	bestBeforeDate: "",
	purchaseDate: "",
	shelfLifeDays: "",
	notes: "",
};

// ─── Screen ──────────────────────────────────────────────────

export default function AddItemScreen() {
	const insets = useSafeAreaInsets();
	const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
	const [warnings, setWarnings] = useState<string[]>([]);
	const [showToast, setShowToast] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [scannerVisible, setScannerVisible] = useState(false);
	const [isLookingUp, setIsLookingUp] = useState(false);
	const [barcodeStatus, setBarcodeStatus] = useState<BarcodeStatus>(null);

	const set = (key: keyof FormData, value: string | number) =>
		setFormData((prev) => ({ ...prev, [key]: value }));

	// ── Open Food Facts lookup ────────────────────

	const lookupBarcode = async (barcode: string) => {
		setIsLookingUp(true);
		setBarcodeStatus(null);
		setFormData((prev) => ({ ...prev, barcode }));

		try {
			const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
			const json = await res.json();

			if (json.status === 1 && json.product) {
				const p = json.product;
				const updates: Partial<FormData> = {};

				if (p.product_name) updates.name = p.product_name;
				if (p.brands) updates.brand = p.brands.split(",")[0].trim();
				if (p.quantity) {
					const parsed = parseOFFQuantity(p.quantity);
					if (parsed) {
						updates.size = parsed.size;
						updates.sizeUnit = parsed.sizeUnit;
						updates.unit = "bag";
					}
				}

				const category = mapOFFCategory(p.categories_tags ?? []);
				if (category) updates.category = category;

				setFormData((prev) => ({ ...prev, ...updates }));
				setBarcodeStatus("found");
			} else {
				setBarcodeStatus("not-found");
			}
		} catch {
			setBarcodeStatus("error");
		} finally {
			setIsLookingUp(false);
		}
	};

	// ── Validation ────────────────────────────────

	const validate = (): string[] => {
		const found: string[] = [];

		if (formData.bestBeforeDate) {
			// Parse as local time to avoid UTC off-by-one issues
			const [y, m, d] = formData.bestBeforeDate.split("-").map(Number);
			const expiry = new Date(y, m - 1, d);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (expiry < today) found.push("This item has already expired. Double-check the best before date.");

			const twoYearsOut = new Date();
			twoYearsOut.setFullYear(twoYearsOut.getFullYear() + 2);
			if (expiry > twoYearsOut) found.push("Best before date is more than 2 years away. Is this correct?");

			if (formData.purchaseDate) {
				const [py, pm, pd] = formData.purchaseDate.split("-").map(Number);
				const purchase = new Date(py, pm - 1, pd);
				if (expiry < purchase) found.push("Best before date is before the purchase date. Double-check both dates.");
			}
		}

		if (!Number(formData.quantity) || Number(formData.quantity) < 1) {
			found.push("Quantity must be at least 1.");
		}

		return found;
	};

	// ── Submit ────────────────────────────────────

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.bestBeforeDate) {
			Alert.alert("Missing fields", "Item Name and Best Before Date are required.");
			return;
		}

		const found = validate();
		setWarnings(found);
		if (found.some((w) => w.startsWith("Quantity") || w.startsWith("Best before date is before"))) return;

		// TODO: wire to GroceryContext addItem() once context is built
		setFormData(DEFAULT_FORM);
		setWarnings([]);
		setBarcodeStatus(null);
		setShowAdvanced(false);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

	// ── Render ────────────────────────────────────

	return (
		<SafeAreaView style={CommonStyles.screen} edges={["top"]}>
			{/* Toast */}
			{showToast && (
				<View style={[styles.toast, { top: insets.top + Spacing.sm }]} pointerEvents="none">
					<Text style={styles.toastText}>Item added successfully!</Text>
				</View>
			)}

			<View style={CommonStyles.screenHeader}>
				<Text style={CommonStyles.screenTitle}>Add Item</Text>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
				keyboardVerticalOffset={100}
			>
				<ScrollView
					contentContainerStyle={[CommonStyles.screenContent, styles.scrollContent]}
					keyboardShouldPersistTaps="handled"
				>
					{/* AI scan */}
					<Pressable
						style={({ pressed }) => [styles.scanButton, pressed && styles.scanButtonPressed]}
						onPress={() => Alert.alert("Coming soon", "AI item scanner will be available in a future update.")}
					>
						<IconSymbol name="camera.fill" size={22} color={Colors.primaryText} />
						<Text style={styles.scanButtonText}>Scan Item</Text>
					</Pressable>

					{/* Item details form */}
					<Card>
						<Text style={styles.formTitle}>Item Details</Text>

						<View style={styles.fields}>
							{/* Brand */}
							<StyledTextInput
								label="Brand"
								placeholder="e.g. Once Upon a Farm"
								value={formData.brand}
								onChangeText={(v) => set("brand", v)}
							/>

							{/* Barcode */}
							<View>
								<Text style={styles.fieldLabel}>Barcode (optional)</Text>
								<View style={styles.barcodeRow}>
									<View style={{ flex: 1 }}>
										<StyledTextInput
											placeholder="Scan or enter barcode"
											value={formData.barcode}
											onChangeText={(v) => {
												set("barcode", v);
												setBarcodeStatus(null);
											}}
											keyboardType="number-pad"
										/>
									</View>
									<Pressable
										style={({ pressed }) => [styles.barcodeButton, pressed && { opacity: 0.8 }]}
										onPress={() => setScannerVisible(true)}
									>
										{isLookingUp ? (
											<ActivityIndicator size="small" color={Colors.primaryText} />
										) : (
											<IconSymbol name="barcode.viewfinder" size={20} color={Colors.primaryText} />
										)}
									</Pressable>
								</View>

								{/* Barcode lookup feedback */}
								{barcodeStatus === "found" && (
									<Text style={styles.barcodeFound}>Product found. Fields pre-filled below</Text>
								)}
								{barcodeStatus === "not-found" && (
									<Text style={styles.barcodeNotFound}>
										Barcode not found in database. Fill in details manually or try &quot;Scan Item&quot;
									</Text>
								)}
								{barcodeStatus === "error" && (
									<Text style={styles.barcodeNotFound}>Lookup failed. Check your internet connection</Text>
								)}
							</View>

							{/* Name */}
							<StyledTextInput
								label="Item Name"
								required
								placeholder="e.g. Mango Smoothie"
								value={formData.name}
								onChangeText={(v) => {
									set("name", v);
									setWarnings([]);
								}}
								maxLength={50}
								hint={`${formData.name.length}/50`}
							/>

							{/* Category */}
							<View>
								<SelectInput
									label="Category"
									required
									options={CATEGORY_OPTIONS}
									value={formData.category}
									onChange={(v) => {
										set("category", v);
										if (v !== "Produce") set("typeIndex", 2);
										else if (formData.typeIndex === 2) set("typeIndex", 0);
									}}
								/>
								{formData.category === "Produce" && (
									<View style={{ marginTop: 8 }}>
										<SegmentedControl
											options={["Vegetable", "Fruit"]}
											selectedIndex={formData.typeIndex}
											onChange={(i) => set("typeIndex", i)}
										/>
									</View>
								)}
							</View>

							{/* Storage Location */}
							<View>
								<Text style={styles.fieldLabel}>
									Storage Location <Text style={styles.required}>*</Text>
								</Text>
								<SegmentedControl
									options={STORAGE_LOCATIONS}
									selectedIndex={formData.storageIndex}
									onChange={(i) => set("storageIndex", i)}
								/>
							</View>

							{/* Quantity / Unit */}
							<View style={styles.triRow}>
								<View style={{ flex: 1 }}>
									<StyledTextInput
										label="Qty"
										required
										placeholder="1"
										value={formData.quantity}
										onChangeText={(v) => set("quantity", v)}
										keyboardType="numeric"
									/>
								</View>
								<View style={{ flex: 1 }}>
									<SelectInput
										label="Unit"
										options={UNIT_OPTIONS}
										value={formData.unit}
										onChange={(v) => set("unit", v)}
									/>
								</View>
							</View>

							{/* Package Size */}
							{formData.unit !== "ct" && (
								<View style={styles.triRow}>
									<View style={{ flex: 1 }}>
										<StyledTextInput
											label="Package Size"
											placeholder="e.g. 16"
											value={formData.size}
											onChangeText={(v) => set("size", v)}
											keyboardType="numeric"
										/>
									</View>
									<View style={{ flex: 1 }}>
										<SelectInput
											label="Size Unit"
											options={SIZE_UNIT_OPTIONS}
											value={formData.sizeUnit}
											onChange={(v) => set("sizeUnit", v)}
										/>
									</View>
								</View>
							)}

							{/* Purchase Date */}
							<DateInput
								label="Purchase Date"
								value={formData.purchaseDate}
								onChange={(v) => set("purchaseDate", v)}
								minimumDate={new Date(2000, 0, 1)}
								maximumDate={new Date()}
							/>

							{/* Best Before Date */}
							<DateInput
								label="Best Before Date"
								required
								value={formData.bestBeforeDate}
								onChange={(v) => {
									set("bestBeforeDate", v);
									setWarnings([]);
								}}
								minimumDate={new Date(2000, 0, 1)}
							/>

							{/* Advanced Options */}
							<Pressable
								style={({ pressed }) => [styles.advancedToggle, pressed && { opacity: 0.7 }]}
								onPress={() => setShowAdvanced((prev) => !prev)}
							>
								<Text style={styles.advancedToggleText}>Advanced Options</Text>
								<IconSymbol
									name="chevron.right"
									size={14}
									color={Colors.textSecondary}
									style={{ transform: [{ rotate: showAdvanced ? "-90deg" : "90deg" }] }}
								/>
							</Pressable>

							{showAdvanced && (
								<View style={styles.advancedFields}>
									<StyledTextInput
										label="Expected Shelf Life (days)"
										placeholder="Optional"
										value={formData.shelfLifeDays}
										onChangeText={(v) => set("shelfLifeDays", v)}
										keyboardType="numeric"
									/>
									<StyledTextInput
										label="Notes"
										placeholder="Add notes about this item"
										value={formData.notes}
										onChangeText={(v) => set("notes", v)}
										multiline
										numberOfLines={3}
										style={styles.notesInput}
									/>
								</View>
							)}

							{/* Warnings */}
							{warnings.length > 0 && (
								<View style={styles.warningBanner}>
									<IconSymbol
										name="exclamationmark.triangle.fill"
										size={16}
										color={Colors.amberText}
										style={{ marginTop: 2 }}
									/>
									<View style={{ flex: 1, gap: Spacing.xs }}>
										{warnings.map((w, i) => (
											<Text key={i} style={styles.warningText}>
												{w}
											</Text>
										))}
									</View>
								</View>
							)}

							<Button title="Add to Inventory" onPress={handleSubmit} fullWidth size="lg" />
						</View>
					</Card>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Barcode scanner modal */}
			<BarcodeScannerModal
				visible={scannerVisible}
				onScanned={(barcode) => {
					setScannerVisible(false);
					lookupBarcode(barcode);
				}}
				onClose={() => setScannerVisible(false)}
			/>
		</SafeAreaView>
	);
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
	scrollContent: {
		gap: Spacing.md,
	},
	toast: {
		position: "absolute",
		top: Spacing.xl,
		left: Spacing.base,
		right: Spacing.base,
		zIndex: 100,
		backgroundColor: Colors.primary,
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.base,
		alignItems: "center",
	},
	toastText: {
		color: Colors.primaryText,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
	},
	scanButton: {
		backgroundColor: Colors.primary,
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.base,
		paddingHorizontal: Spacing.base,
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
	},
	scanButtonPressed: {
		opacity: 0.85,
	},
	scanButtonText: {
		color: Colors.primaryText,
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
	},
	formTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		marginBottom: Spacing.base,
	},
	fields: {
		gap: Spacing.base,
	},
	fieldLabel: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.textLabel,
		marginBottom: Spacing.sm,
	},
	required: {
		color: Colors.redText,
	},
	barcodeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	barcodeButton: {
		width: 44,
		height: 44,
		backgroundColor: Colors.primary,
		borderRadius: BorderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
	},
	barcodeFound: {
		fontSize: FontSizes.xs,
		color: Colors.greenText,
		marginTop: Spacing.xs,
	},
	barcodeNotFound: {
		fontSize: FontSizes.xs,
		color: Colors.amberText,
		marginTop: Spacing.xs,
	},
	triRow: {
		flexDirection: "row",
		gap: Spacing.sm,
	},
	advancedToggle: {
		backgroundColor: Colors.secondaryBg,
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.base,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	advancedToggleText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.textSecondary,
	},
	advancedFields: {
		gap: Spacing.base,
	},
	notesInput: {
		height: 80,
		textAlignVertical: "top",
	},
	warningBanner: {
		backgroundColor: Colors.amberBg,
		borderWidth: 1,
		borderColor: Colors.amberBorder,
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		flexDirection: "row",
		gap: Spacing.sm,
		alignItems: "flex-start",
	},
	warningText: {
		fontSize: FontSizes.xs,
		color: Colors.amberTextDark,
	},
});
