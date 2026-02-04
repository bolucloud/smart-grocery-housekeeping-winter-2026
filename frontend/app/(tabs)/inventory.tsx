import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "@/components/grocery";
import { AlertBanner, FilterPills, IconSymbol, SearchBar } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

const filterOptions = [
	{
		key: "all",
		label: "All",
		icon: <IconSymbol name="sparkles" size={16} color={Colors.primaryText} />,
	},
	{
		key: "fresh",
		label: "Fresh",
		icon: <IconSymbol name="leaf.fill" size={16} color={Colors.primaryText} />,
	},
	{
		key: "expiring",
		label: "Expiring",
		icon: <IconSymbol name="exclamationmark.triangle.fill" size={16} color={Colors.primaryText} />,
	},
	{
		key: "spoiled",
		label: "Spoiled",
		icon: <IconSymbol name="trash" size={16} color={Colors.primaryText} />,
	},
];

export default function InventoryScreen() {
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");

	return (
		<SafeAreaView style={CommonStyles.screen} edges={["top"]}>
			<View style={styles.header}>
				<Text style={styles.title}>Inventory</Text>
			</View>

			<ScrollView contentContainerStyle={CommonStyles.screenContent}>
				<AlertBanner
					variant="info"
					title="Quick Guide"
					message="Tap the edit icon to change item details. Click Used Up when finished, or Spoiled if it goes bad."
				/>

				<SearchBar value={search} onChangeText={setSearch} placeholder="Search items..." />

				<FilterPills options={filterOptions} selected={filter} onSelect={setFilter} />

				<ProductCard
					name="Carrots"
					category="vegetable"
					quantity={3}
					unit="bunch"
					expiryDate="2026-02-10"
					status="fresh"
					onEdit={() => {}}
					onUsedUp={() => {}}
					onSpoiled={() => {}}
				/>

				<ProductCard
					name="Milk"
					category="packaged"
					quantity={1}
					unit="gallon"
					expiryDate="2026-02-05"
					status="expiring"
					onEdit={() => {}}
					onUsedUp={() => {}}
					onSpoiled={() => {}}
				/>

				<ProductCard
					name="Bananas"
					category="fruit"
					quantity={5}
					unit="piece"
					expiryDate="2026-02-01"
					status="expired"
					onEdit={() => {}}
					onUsedUp={() => {}}
					onSpoiled={() => {}}
				/>
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
});
