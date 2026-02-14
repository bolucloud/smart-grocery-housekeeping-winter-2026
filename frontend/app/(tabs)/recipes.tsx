import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertBanner, Badge, Button, Card } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

export default function RecipesScreen() {
	return (
		<SafeAreaView style={CommonStyles.screen} edges={["top"]}>
			<View style={CommonStyles.screenHeader}>
				<Text style={CommonStyles.screenTitle}>Recipes</Text>
			</View>

			<ScrollView contentContainerStyle={CommonStyles.screenContent}>
				<AlertBanner
					variant="info"
					title="Use It Up!"
					message="2 items are expiring soon. Here are some recipe ideas to help!"
				/>

				{/* Recipe Card */}
				<Card>
					<View style={styles.recipeHeader}>
						<Text style={styles.recipeName}>Stir-Fried Vegetables</Text>
						<Badge label="2 expiring" variant="green" />
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionLabel}>Ingredients</Text>
						<View style={styles.ingredientList}>
							<Badge label="Carrots" variant="amber" />
							<Badge label="Broccoli" variant="amber" />
							<Badge label="Soy Sauce" variant="gray" />
							<Badge label="Garlic" variant="gray" />
							<Badge label="Oil" variant="gray" />
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionLabel}>Instructions</Text>
						<Text style={styles.instructions}>
							Heat oil in a wok, add garlic, then stir-fry vegetables for 3-4 minutes. Add soy sauce and serve hot over
							rice.
						</Text>
					</View>

					<Button title="Search Full Recipe" onPress={() => {}} fullWidth icon="magnifyingglass" />
				</Card>

				{/* Recipe Card 2 */}
				<Card>
					<View style={styles.recipeHeader}>
						<Text style={styles.recipeName}>Banana Smoothie</Text>
						<Badge label="1 expiring" variant="green" />
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionLabel}>Ingredients</Text>
						<View style={styles.ingredientList}>
							<Badge label="Bananas" variant="amber" />
							<Badge label="Milk" variant="gray" />
							<Badge label="Honey" variant="gray" />
							<Badge label="Ice" variant="gray" />
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionLabel}>Instructions</Text>
						<Text style={styles.instructions}>
							Blend bananas with milk, honey, and ice until smooth. Pour into a glass and enjoy immediately.
						</Text>
					</View>

					<Button title="Search Full Recipe" onPress={() => {}} fullWidth icon="magnifyingglass" />
				</Card>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	recipeHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: Spacing.base,
	},
	recipeName: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.bold,
		color: Colors.textPrimary,
		flex: 1,
	},
	section: {
		marginBottom: Spacing.base,
	},
	sectionLabel: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
		color: Colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
	},
	ingredientList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.sm,
	},
	instructions: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
		lineHeight: 20,
	},
});
