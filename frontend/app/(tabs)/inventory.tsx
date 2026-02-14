import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "@/components/grocery";
import { AlertBanner, FilterPills, SearchBar } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";

const filterOptions = [
	{
		key: "all",
		label: "All",
	},
	{
		key: "fresh",
		label: "Fresh",
	},
	{
		key: "expiring",
		label: "Expiring",
	},
	{
		key: "spoiled",
		label: "Spoiled",
	},
];

export default function InventoryScreen() {
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");

	return (
		<SafeAreaView style={CommonStyles.screen} edges={["top"]}>
			<View style={CommonStyles.screenHeader}>
				<Text style={CommonStyles.screenTitle}>Inventory</Text>
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

