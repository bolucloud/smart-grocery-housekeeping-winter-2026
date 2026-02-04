import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatCard } from "@/components/grocery";
import { AlertBanner, Card, IconSymbol } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

export default function DashboardScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={CommonStyles.screen} edges={["top"]}>
			{/* Header */}
			<View style={styles.header}>
				<View>
					<Text style={styles.greeting}>Hey, there</Text>
					<Text style={styles.subtitle}>{"Let's track your groceries!"}</Text>
				</View>
				<Pressable
					onPress={() => router.push("/settings")}
					style={({ pressed }) => [styles.settingsButton, { opacity: pressed ? 0.7 : 1 }]}
				>
					<IconSymbol name="gearshape.fill" size={18} color={Colors.textSecondary} />
				</Pressable>
			</View>

			<ScrollView contentContainerStyle={CommonStyles.screenContent}>
				{/* Expiring Alert */}
				<AlertBanner
					variant="error"
					title="Expiring Soon (2)"
					message="You have items that need attention before they expire."
				/>

				{/* Fridge Overview */}
				<View>
					<Text style={CommonStyles.sectionTitle}>{"What's in the Fridge?"}</Text>
					<View style={styles.statGrid}>
						<StatCard
							title="Vegetables"
							value={3}
							backgroundColor={Colors.greenBg}
							borderColor={Colors.greenBorder}
							titleColor={Colors.greenTextDark}
						/>
						<StatCard
							title="Fruits"
							value={2}
							backgroundColor={Colors.orangeBg}
							borderColor={Colors.orangeBorder}
							titleColor={Colors.orangeText}
						/>
						<StatCard
							title="Packaged"
							value={4}
							backgroundColor={Colors.blueBg}
							borderColor={Colors.blueBorder}
							titleColor={Colors.blueTextDark}
						/>
					</View>
				</View>

				{/* Recently Added */}
				<View>
					<Text style={CommonStyles.sectionTitle}>Recently Added</Text>
					<Card>
						{["Carrots", "Milk", "Bananas", "Rice", "Eggs"].map((item, idx) => (
							<View key={item} style={[styles.recentRow, idx < 4 && styles.recentRowBorder]}>
								<Text style={styles.recentName}>{item}</Text>
								<Text style={styles.recentDate}>Jan {30 - idx}</Text>
							</View>
						))}
					</Card>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.base,
		backgroundColor: Colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderSubtle,
	},
	greeting: {
		fontSize: FontSizes.xl,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	subtitle: {
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
		marginTop: 2,
	},
	settingsButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: Colors.inputBg,
		alignItems: "center",
		justifyContent: "center",
	},
	statGrid: {
		flexDirection: "row",
		gap: Spacing.md,
		marginTop: Spacing.md,
	},
	recentRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.sm,
	},
	recentRowBorder: {
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderSubtle,
	},
	recentName: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
		color: Colors.secondaryText,
	},
	recentDate: {
		fontSize: FontSizes.xs,
		color: Colors.textTertiary,
		fontFamily: "monospace",
	},
});
