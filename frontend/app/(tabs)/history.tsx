import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatCard } from "@/components/grocery";
import { Card, FilterPills, IconSymbol } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

const filterOptions = [
	{ key: "all", label: "All" },
	{ key: "finished", label: "Used Up" },
	{ key: "spoiled", label: "Spoiled" },
];

export default function HistoryScreen() {
	const [filter, setFilter] = useState("all");

	return (
		<SafeAreaView style={CommonStyles.screen} edges={["top"]}>
			<View style={styles.header}>
				<Text style={styles.title}>History</Text>
			</View>

			<ScrollView contentContainerStyle={CommonStyles.screenContent}>
				{/* Stats */}
				<View style={styles.statsRow}>
					<View style={styles.statWrapper}>
						<StatCard
							title="Used Up"
							value={8}
							subtitle="Items consumed"
							icon="checkmark.circle.fill"
							iconColor={Colors.greenText}
							backgroundColor={Colors.greenBg}
							borderColor={Colors.greenBorder}
							titleColor={Colors.greenText}
							subtitleColor={Colors.greenText}
						/>
					</View>
					<View style={styles.statWrapper}>
						<StatCard
							title="Spoiled"
							value={2}
							subtitle="Items wasted"
							icon="trash"
							iconColor={Colors.redText}
							backgroundColor={Colors.redBg}
							borderColor={Colors.redBorder}
							titleColor={Colors.redText}
							subtitleColor={Colors.redText}
						/>
					</View>
				</View>

				<FilterPills options={filterOptions} selected={filter} onSelect={setFilter} />

				{/* History Items */}
				<Card leftBorderColor={Colors.greenText}>
					<View style={styles.historyItem}>
						<View style={styles.historyLeft}>
							<View style={CommonStyles.row}>
								<IconSymbol name="checkmark.circle.fill" size={18} color={Colors.greenText} />
								<Text style={styles.historyName}>Carrots</Text>
							</View>
							<Text style={styles.historyMeta}>{"vegetable \u2022 2 bunch"}</Text>
						</View>
						<View style={styles.historyBadgeGreen}>
							<Text style={styles.historyBadgeTextGreen}>Used Up</Text>
						</View>
					</View>
				</Card>

				<Card leftBorderColor={Colors.redText}>
					<View style={styles.historyItem}>
						<View style={styles.historyLeft}>
							<View style={CommonStyles.row}>
								<IconSymbol name="trash" size={18} color={Colors.redText} />
								<Text style={styles.historyName}>Yogurt</Text>
							</View>
							<Text style={styles.historyMeta}>{"packaged \u2022 1 tub"}</Text>
						</View>
						<View style={styles.historyBadgeRed}>
							<Text style={styles.historyBadgeTextRed}>Spoiled</Text>
						</View>
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
	statsRow: {
		flexDirection: "row",
		gap: Spacing.base,
	},
	statWrapper: {
		flex: 1,
	},
	historyItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	historyLeft: {
		flex: 1,
		gap: Spacing.xs,
	},
	historyName: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		marginLeft: Spacing.sm,
	},
	historyMeta: {
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
		textTransform: "capitalize",
	},
	historyBadgeGreen: {
		paddingHorizontal: Spacing.sm + 2,
		paddingVertical: Spacing.xs,
		borderRadius: 9999,
		borderWidth: 1,
		backgroundColor: Colors.greenBg,
		borderColor: Colors.greenBorder,
	},
	historyBadgeTextGreen: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
		color: Colors.greenTextDark,
	},
	historyBadgeRed: {
		paddingHorizontal: Spacing.sm + 2,
		paddingVertical: Spacing.xs,
		borderRadius: 9999,
		borderWidth: 1,
		backgroundColor: Colors.redBg,
		borderColor: Colors.redBorder,
	},
	historyBadgeTextRed: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
		color: Colors.redTextDark,
	},
});
