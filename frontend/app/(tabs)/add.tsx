import { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Modal,
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
import { BorderRadius, Colors, Fonts, FontSizes, FontWeights, Spacing } from "@/constants/theme";

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

// Parse a size/serving string (e.g. "16 fl oz", "355 ml", "500 g") into size + sizeUnit
function parseSizeString(raw: string): { size: string; sizeUnit: string } | null {
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

// Convert a parsed size to its base unit (ml for liquids, g for solids)
function toBaseUnit(size: string, sizeUnit: string): number | null {
	const n = parseFloat(size);
	if (isNaN(n)) return null;
	switch (sizeUnit) {
		case "ml": return n;
		case "L": return n * 1000;
		case "fl oz": return n * 29.5735;
		case "gal": return n * 3785.41;
		case "g": return n;
		case "kg": return n * 1000;
		case "oz": return n * 28.3495;
		case "lb": return n * 453.592;
		default: return null;
	}
}

// Map category from pnns_groups_1, pnns_groups_2, and categories_tags
function mapOFFCategory(pnns1: string, pnns2: string, tags: string[]): string | null {
	// open food api field pnns_groups_2 for finer-grained distinctions
	const g2 = pnns2.toLowerCase();
	if (g2.includes("frozen")) return "Frozen";
	if (g2.includes("deli") || g2.includes("charcuterie")) return "Deli";
	if (g2.includes("seafood") || g2.includes("fish")) return "Seafood";
	if (g2.includes("bread") || g2.includes("pastry") || g2.includes("cake")) return "Bakery";
	if (g2.includes("biscuit") || g2.includes("cookie") || g2.includes("snack")) return "Snacks";

	// open food api field pnns_groups_1 for broad category
	const g1 = pnns1.toLowerCase();
	if (g1.includes("dairy") || g1.includes("milk")) return "Dairy";
	if (g1.includes("fish") || g1.includes("meat") || g1.includes("egg")) return "Meat";
	if (g1.includes("beverage")) return "Beverages";
	if (g1.includes("fruit") || g1.includes("vegetable")) return "Produce";
	if (g1.includes("sugary") || g1.includes("snack")) return "Snacks";
	if (g1.includes("cereal") || g1.includes("fat") || g1.includes("sauce") || g1.includes("composite")) return "Pantry";

	// fallback: categories_tags keyword scan
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

// Infer storage location index from resolved category (0 = Fridge, 1 = Pantry, 2 = Freezer)
function storageFromCategory(category: string): number {
	if (["Dairy", "Meat", "Seafood", "Produce", "Deli"].includes(category)) return 0;
	if (category === "Frozen") return 2;
	return 1;
}

// Infer package unit from packaging_tags, packaging text, and quantity string
function unitFromPackaging(tags: string[], packagingText?: string, quantityText?: string): string | null {
	const s = [tags.join(" "), packagingText ?? "", quantityText ?? ""].join(" ").toLowerCase();
	if (s.includes("can") || s.includes("cans")) return "can";
	if (s.includes("bottle") || s.includes("bottles")) return "bottle";
	if (s.includes("jar") || s.includes("jars")) return "jar";
	if (s.includes("carton") || s.includes("cartons")) return "carton";
	if (s.includes("tub") || s.includes("tubs")) return "tub";
	if (s.includes("pouch") || s.includes("pouches")) return "pouch";
	if (s.includes("loaf") || s.includes("loaves")) return "loaf";
	if (s.includes("bag") || s.includes("bags")) return "bag";
	if (s.includes("box") || s.includes("boxes")) return "box";
	if (s.includes("pack") || s.includes("packs")) return "pack";
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

type SessionItem = FormData & { id: string };

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

// ─── Display helpers ─────────────────────────────────────────

function formatItemSubtitle(item: FormData): string {
	const parts: string[] = [];
	if (item.brand) parts.push(item.brand);
	parts.push(`${item.quantity} ${item.unit}`);
	return parts.join(" · ");
}

function formatDate(iso: string): string {
	if (!iso) return "—";
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, m - 1, d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// ─── Screen ──────────────────────────────────────────────────

export default function AddItemScreen() {
	const insets = useSafeAreaInsets();
	const scrollRef = useRef<ScrollView>(null);

	// Form
	const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
	const [warnings, setWarnings] = useState<string[]>([]);
	const [showToast, setShowToast] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [scannerVisible, setScannerVisible] = useState(false);
	const [isLookingUp, setIsLookingUp] = useState(false);
	const [barcodeStatus, setBarcodeStatus] = useState<BarcodeStatus>(null);
	const [rawApiResponse, setRawApiResponse] = useState<object | null>(null);
	const [showDebug, setShowDebug] = useState(false);

	// Session
	const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);
	const [formCollapsed, setFormCollapsed] = useState(false);
	const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [stashedForm, setStashedForm] = useState<FormData | null>(null);

	// Save modal
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [runStoreName, setRunStoreName] = useState("");
	const [runDate, setRunDate] = useState(() => {
		const t = new Date();
		return [t.getFullYear(), String(t.getMonth() + 1).padStart(2, "0"), String(t.getDate()).padStart(2, "0")].join("-");
	});

	// Stable "today" Date — memoized so it doesn't change on every render and
	// destabilize the iOS DateTimePicker when passed as maximumDate
	const today = useMemo(() => new Date(), []);

	// Auto-expand form when session is emptied
	useEffect(() => {
		if (sessionItems.length === 0) setFormCollapsed(false);
	}, [sessionItems.length]);

	const set = (key: keyof FormData, value: string | number) =>
		setFormData((prev) => ({ ...prev, [key]: value }));

	// ── Open Food Facts lookup ────────────────────

	const lookupBarcode = async (barcode: string) => {
		setIsLookingUp(true);
		setBarcodeStatus(null);
		setRawApiResponse(null);
		setFormData({ ...DEFAULT_FORM, barcode });

		try {
			const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
			const json = await res.json();
			setRawApiResponse(json);

			if (json.status === 1 && json.product) {
				const p = json.product;
				const updates: Partial<FormData> = {};

				// Name: try multiple fields in order
				const name = p.product_name || p.product_name_en || p.generic_name_en || p.generic_name;
				if (name) updates.name = name;

				// Brand
				if (p.brands) updates.brand = p.brands.split(",")[0].trim();

				// Category and storage
				const category = mapOFFCategory(p.pnns_groups_1 ?? "", p.pnns_groups_2 ?? "", p.categories_tags ?? []);
				if (category) {
					updates.category = category;
					updates.storageIndex = storageFromCategory(category);
				}

				// Unit from packaging tags, packaging text, and quantity string
				const unit = unitFromPackaging(p.packaging_tags ?? [], p.packaging, p.quantity);
				if (unit) updates.unit = unit;

				// Per-unit size: prefer serving_size, fall back to quantity string
				const sizeSource = p.serving_size || p.quantity;
				if (sizeSource) {
					const parsed = parseSizeString(sizeSource);
					if (parsed) {
						updates.size = parsed.size;
						updates.sizeUnit = parsed.sizeUnit;
					}
				}

				// Quantity: try multi-pack pattern first, then product_quantity / serving_size
				if (p.quantity) {
					const multiMatch = p.quantity.match(/^(\d+)\s*[x×]/i);
					if (multiMatch) {
						updates.quantity = multiMatch[1];
					} else if (p.product_quantity && p.serving_size) {
						const perUnit = parseSizeString(p.serving_size);
						if (perUnit) {
							const perUnitBase = toBaseUnit(perUnit.size, perUnit.sizeUnit);
							if (perUnitBase && perUnitBase > 0) {
								const count = Math.round(p.product_quantity / perUnitBase);
								if (count > 1 && count <= 100) updates.quantity = String(count);
							}
						}
					}
				}

				// Purchase date: default to today
				const today = new Date();
				updates.purchaseDate = [
					today.getFullYear(),
					String(today.getMonth() + 1).padStart(2, "0"),
					String(today.getDate()).padStart(2, "0"),
				].join("-");

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

	// ── Session handlers ──────────────────────────

	const handleDeleteItem = (id: string) => {
		if (editingItemId === id) {
			setFormData(stashedForm ?? DEFAULT_FORM);
			setStashedForm(null);
			setEditingItemId(null);
			setWarnings([]);
			setBarcodeStatus(null);
		}
		setSessionItems((prev) => prev.filter((item) => item.id !== id));
		if (expandedItemId === id) setExpandedItemId(null);
	};

	const handleStartEdit = (item: SessionItem) => {
		const hasUnsavedData = formData.name.trim() !== "" || formData.bestBeforeDate !== "";
		setStashedForm(hasUnsavedData ? formData : null);
		const { id, ...itemData } = item;
		setFormData(itemData);
		setEditingItemId(id);
		setExpandedItemId(id);
		setFormCollapsed(false);
		setWarnings([]);
		setBarcodeStatus(null);
		setShowAdvanced(false);
		setTimeout(() => scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true }), 100);
	};

	const handleCancelEdit = () => {
		setFormData(stashedForm ?? DEFAULT_FORM);
		setStashedForm(null);
		setEditingItemId(null);
		setExpandedItemId(null);
		setFormCollapsed(true);
		setWarnings([]);
		setBarcodeStatus(null);
	};

	const handleSaveRun = () => {
		// TODO: wire to API
		setSessionItems([]);
		setShowSaveModal(false);
		setRunStoreName("");
	};

	const handleSaveItemsOnly = () => {
		// TODO: wire to API
		setSessionItems([]);
		setShowSaveModal(false);
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

		if (editingItemId) {
			setSessionItems((prev) =>
				prev.map((item) => (item.id === editingItemId ? { ...formData, id: editingItemId } : item))
			);
			setEditingItemId(null);
			setExpandedItemId(null);
			setFormData(stashedForm ?? DEFAULT_FORM);
			setStashedForm(null);
			setFormCollapsed(true);
		} else {
			const newItem: SessionItem = { ...formData, id: Date.now().toString() };
			setSessionItems((prev) => [...prev, newItem]);
			setFormData(DEFAULT_FORM);
			setFormCollapsed(true);
			setShowToast(true);
			setTimeout(() => setShowToast(false), 3000);
		}

		setWarnings([]);
		setBarcodeStatus(null);
		setShowAdvanced(false);
	};

	// ── Render ────────────────────────────────────

	const hasSession = sessionItems.length > 0;

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

			<ScrollView
				ref={scrollRef}
				automaticallyAdjustKeyboardInsets
				contentContainerStyle={[CommonStyles.screenContent, styles.scrollContent]}
				keyboardShouldPersistTaps="handled"
				style={{ flex: 1 }}
			>
				{/* Item details form */}
				<Card>
					{hasSession ? (
						<Pressable
							style={styles.formHeader}
							onPress={() => setFormCollapsed((prev) => !prev)}
						>
							<Text style={styles.formTitle}>
								{editingItemId
									? `Editing: ${formData.name || "item"}`
									: "Item Details"}
							</Text>
							<IconSymbol
								name="chevron.right"
								size={14}
								color={Colors.textSecondary}
								style={{ transform: [{ rotate: formCollapsed ? "90deg" : "-90deg" }] }}
							/>
						</Pressable>
					) : (
						<Text style={styles.formTitle}>Item Details</Text>
					)}

					{!formCollapsed && (
						<View style={styles.fields}>

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

								{/* Debug: raw API response */}
								{rawApiResponse !== null && (
									<View style={{ marginTop: Spacing.sm }}>
										<Pressable
											style={({ pressed }) => [styles.debugToggle, pressed && { opacity: 0.7 }]}
											onPress={() => setShowDebug((prev) => !prev)}
										>
											<Text style={styles.debugToggleText}>API Response</Text>
											<IconSymbol
												name="chevron.right"
												size={14}
												color={Colors.blueText}
												style={{ transform: [{ rotate: showDebug ? "-90deg" : "90deg" }] }}
											/>
										</Pressable>
										{showDebug && (
											<ScrollView style={styles.debugContent} nestedScrollEnabled>
												<Text style={styles.debugText}>
													{JSON.stringify(rawApiResponse, null, 2)}
												</Text>
											</ScrollView>
										)}
									</View>
								)}
							</View>

							{/* Name */}
							<View>
								<Text style={styles.fieldLabel}>
									Item Name <Text style={styles.required}>*</Text>
								</Text>
								<View style={[styles.barcodeRow, { alignItems: "flex-start" }]}>
									<View style={{ flex: 1 }}>
										<StyledTextInput
											placeholder="e.g. Mango Smoothie"
											value={formData.name}
											onChangeText={(v) => {
												set("name", v);
												setWarnings([]);
											}}
											maxLength={50}
											hint={`${formData.name.length}/50`}
										/>
									</View>
									<Pressable
										style={({ pressed }) => [styles.barcodeButton, pressed && { opacity: 0.8 }]}
										onPress={() => Alert.alert("Coming soon", "AI item scanner will be available in a future update.")}
									>
										<IconSymbol name="camera.fill" size={20} color={Colors.primaryText} />
									</Pressable>
								</View>
							</View>

							{/* Brand */}
							<StyledTextInput
								label="Brand"
								placeholder="e.g. Once Upon a Farm"
								value={formData.brand}
								onChangeText={(v) => set("brand", v)}
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
								maximumDate={today}
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

							{/* Submit / Cancel row */}
							{editingItemId ? (
								<View style={styles.editButtonRow}>
									<Button
										title="Cancel"
										variant="secondary"
										onPress={handleCancelEdit}
										style={{ flex: 1 }}
									/>
									<Button
										title="Update Item"
										onPress={handleSubmit}
										style={{ flex: 2 }}
									/>
								</View>
							) : (
								<Button title="Add to Inventory" onPress={handleSubmit} fullWidth size="lg" />
							)}
						</View>
					)}
				</Card>

				{/* Session list */}
				{hasSession && (
					<View style={styles.sessionSection}>
						<Text style={styles.sessionHeader}>
							This Session{"  ·  "}{sessionItems.length} {sessionItems.length === 1 ? "item" : "items"}
						</Text>
						{sessionItems.map((item) => {
							const isExpanded = expandedItemId === item.id;
							const isEditing = editingItemId === item.id;
							return (
								<Card
									key={item.id}
									onPress={isEditing ? undefined : () => setExpandedItemId(isExpanded ? null : item.id)}
								>
									{/* Row */}
									<View style={styles.sessionRow}>
										<View style={styles.sessionRowLeft}>
											{(isExpanded || isEditing) && <View style={styles.dot} />}
											<View style={{ flex: 1 }}>
												<View style={styles.sessionNameRow}>
													<Text style={styles.sessionItemName} numberOfLines={1}>
														{item.name}
													</Text>
													{isEditing && (
														<Text style={styles.editingLabel}>editing</Text>
													)}
												</View>
												<Text style={styles.sessionItemSubtitle} numberOfLines={1}>
													{formatItemSubtitle(item)}
												</Text>
											</View>
										</View>
										<Pressable
											style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}
											onPress={() => handleDeleteItem(item.id)}
											hitSlop={8}
										>
											<IconSymbol name="trash" size={16} color={Colors.textSecondary} />
										</Pressable>
									</View>

									{/* Expanded detail */}
									{isExpanded && !isEditing && (
										<View style={styles.itemDetail}>
											<View style={styles.itemDetailDivider} />
											<View style={styles.detailRow}>
												<Text style={styles.detailLabel}>Category</Text>
												<Text style={styles.detailValue}>{item.category}</Text>
											</View>
											<View style={styles.detailRow}>
												<Text style={styles.detailLabel}>Storage</Text>
												<Text style={styles.detailValue}>{STORAGE_LOCATIONS[item.storageIndex]}</Text>
											</View>
											{!!item.size && (
												<View style={styles.detailRow}>
													<Text style={styles.detailLabel}>Size</Text>
													<Text style={styles.detailValue}>{item.size} {item.sizeUnit}</Text>
												</View>
											)}
											{!!item.bestBeforeDate && (
												<View style={styles.detailRow}>
													<Text style={styles.detailLabel}>Best before</Text>
													<Text style={styles.detailValue}>{formatDate(item.bestBeforeDate)}</Text>
												</View>
											)}
											<View style={{ marginTop: Spacing.md }}>
												<Button title="Update Item" onPress={() => handleStartEdit(item)} fullWidth />
											</View>
										</View>
									)}
								</Card>
							);
						})}
					</View>
				)}

				{/* Save as Grocery Run */}
				{hasSession && (
					<Button
						title="Save List"
						variant="success"
						onPress={() => setShowSaveModal(true)}
						fullWidth
						size="lg"
					/>
				)}
			</ScrollView>

			{/* Barcode scanner modal */}
			<BarcodeScannerModal
				visible={scannerVisible}
				onScanned={(barcode) => {
					setScannerVisible(false);
					lookupBarcode(barcode);
				}}
				onClose={() => setScannerVisible(false)}
			/>

			{/* Save Run modal */}
			<Modal
				visible={showSaveModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowSaveModal(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={styles.modalOverlay}
				>
					<Pressable style={styles.modalBackdrop} onPress={() => setShowSaveModal(false)} />
					<View style={[styles.modalSheet, { paddingBottom: insets.bottom + Spacing.base }]}>
						<View style={styles.modalHandle} />
						<Text style={styles.modalTitle}>Save as Grocery Run</Text>
						<View style={styles.modalFields}>
							<StyledTextInput
								label="Store Name"
								placeholder="e.g. Costco"
								value={runStoreName}
								onChangeText={setRunStoreName}
							/>
							<DateInput
								label="Date"
								value={runDate}
								onChange={setRunDate}
								minimumDate={new Date(2000, 0, 1)}
								maximumDate={today}
							/>
						</View>
						<View style={styles.modalButtons}>
							<Button title="Save Run" onPress={handleSaveRun} fullWidth size="lg" />
							<Button
								title="Save items without run"
								variant="secondary"
								onPress={handleSaveItemsOnly}
								fullWidth
							/>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
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
	// Session list
	sessionSection: {
		gap: Spacing.sm,
	},
	sessionHeader: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.textSecondary,
	},
	sessionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	sessionRowLeft: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: Colors.primary,
	},
	sessionNameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	sessionItemName: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		flex: 1,
	},
	editingLabel: {
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
	},
	sessionItemSubtitle: {
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
		marginTop: 2,
	},
	deleteButton: {
		padding: Spacing.xs,
	},
	itemDetail: {
		marginTop: Spacing.md,
	},
	itemDetailDivider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: Colors.border,
		marginBottom: Spacing.md,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: Spacing.xs,
	},
	detailLabel: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
	},
	detailValue: {
		fontSize: FontSizes.sm,
		color: Colors.textPrimary,
		fontWeight: FontWeights.medium,
	},
	// Form
	formHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	formTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	editButtonRow: {
		flexDirection: "row",
		gap: Spacing.sm,
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
	debugToggle: {
		backgroundColor: Colors.blueBg,
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.md,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	debugToggleText: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
		color: Colors.blueText,
	},
	debugContent: {
		maxHeight: 300,
		backgroundColor: Colors.secondaryBg,
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		marginTop: Spacing.xs,
	},
	debugText: {
		fontFamily: Fonts?.mono,
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
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
	// Save modal
	modalOverlay: {
		flex: 1,
		justifyContent: "flex-end",
	},
	modalBackdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	modalSheet: {
		backgroundColor: Colors.surface,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		paddingTop: Spacing.md,
		paddingHorizontal: Spacing.base,
	},
	modalHandle: {
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: Colors.border,
		alignSelf: "center",
		marginBottom: Spacing.base,
	},
	modalTitle: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		marginBottom: Spacing.base,
	},
	modalFields: {
		gap: Spacing.base,
		marginBottom: Spacing.base,
	},
	modalButtons: {
		gap: Spacing.sm,
	},
});
