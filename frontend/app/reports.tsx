import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatCard } from "@/components/grocery";
import { AlertBanner, Card } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

export default function ReportsScreen() {
	return (
		<ScrollView style={CommonStyles.screen} contentContainerStyle={CommonStyles.screenContent}>
			{/* Performance Summary */}
			<View>
				<Text style={CommonStyles.sectionTitle}>Performance Summary</Text>
				<View style={styles.statsRow}>
					<View style={styles.statWrapper}>
						<StatCard
							title="Consumed"
							value={12}
							subtitle="Items used"
							backgroundColor={Colors.greenBg}
							borderColor={Colors.greenBorder}
							titleColor={Colors.greenText}
							subtitleColor={Colors.greenText}
						/>
					</View>
					<View style={styles.statWrapper}>
						<StatCard
							title="Spoiled"
							value={3}
							subtitle="25% waste"
							backgroundColor={Colors.redBg}
							borderColor={Colors.redBorder}
							titleColor={Colors.redText}
							subtitleColor={Colors.redText}
						/>
					</View>
				</View>
			</View>

			{/* Tips */}
			<AlertBanner
				variant="warning"
				title="Reduce Waste Together"
				message="This month, 3 items went unused: Lettuce, Yogurt, Bread. Consider buying smaller quantities or freezing items right after purchase."
			/>

			{/* Most Used */}
			<View>
				<Text style={CommonStyles.sectionTitle}>Most Used Items</Text>
				<View style={styles.usedList}>
					{[
						{ name: "Milk", count: 12 },
						{ name: "Bananas", count: 10 },
						{ name: "Eggs", count: 8 },
					].map((item) => (
						<Card key={item.name}>
							<View style={CommonStyles.rowBetween}>
								<Text style={styles.usedName}>{item.name}</Text>
								<Text style={styles.usedCount}>{item.count}&times;</Text>
							</View>
						</Card>
					))}
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	statsRow: {
		flexDirection: "row",
		gap: Spacing.base,
		marginTop: Spacing.md,
	},
	statWrapper: {
		flex: 1,
	},
	usedList: {
		gap: Spacing.sm,
		marginTop: Spacing.md,
	},
	usedName: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.medium,
		color: Colors.textPrimary,
	},
	usedCount: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.textSecondary,
		fontFamily: "monospace",
	},
});
