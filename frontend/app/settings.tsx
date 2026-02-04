import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, Card, ListItem, StyledTextInput } from "@/components/ui";
import { CommonStyles } from "@/constants/styles";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

export default function SettingsScreen() {
	return (
		<ScrollView style={CommonStyles.screen} contentContainerStyle={CommonStyles.screenContent}>
			{/* Profile */}
			<Card>
				<View style={styles.profileRow}>
					<Avatar name="John Smith" size={64} />
					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>John Smith</Text>
						<Text style={styles.profileEmail}>john.smith@email.com</Text>
					</View>
				</View>
				<View style={styles.profileActions}>
					<ListItem icon="person.circle.fill" label="Edit Profile" onPress={() => {}} />
				</View>
			</Card>

			{/* Recipe Source */}
			<Card>
				<View style={CommonStyles.row}>
					<Text style={styles.cardTitle}>Recipe Source</Text>
				</View>
				<Text style={styles.cardDescription}>Choose where to search for recipes when viewing full recipe details.</Text>
				<View style={styles.formFields}>
					<StyledTextInput
						label="Website URL"
						placeholder="https://www.example.com"
						defaultValue="https://www.allrecipes.com"
					/>
					<Button title="Save Recipe Source" onPress={() => {}} fullWidth />
				</View>
			</Card>

			{/* Account */}
			<Card>
				<Text style={styles.cardTitle}>Account</Text>
				<View style={styles.settingsList}>
					<ListItem label="Privacy Settings" onPress={() => {}} />
					<ListItem label="Notifications" onPress={() => {}} />
					<ListItem label="Help & Support" onPress={() => {}} />
				</View>
			</Card>

			{/* Logout */}
			<Button title="Log Out" variant="danger" icon="arrow.right.square" onPress={() => {}} fullWidth size="lg" />

			{/* App Info */}
			<View style={styles.appInfo}>
				<Text style={styles.appInfoText}>GroceryTracker v1.0</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	profileRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.base,
		marginBottom: Spacing.base,
	},
	profileInfo: {
		flex: 1,
	},
	profileName: {
		fontSize: FontSizes.lg,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	profileEmail: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
		marginTop: 2,
	},
	profileActions: {
		gap: Spacing.sm,
	},
	cardTitle: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
		marginBottom: Spacing.sm,
	},
	cardDescription: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
		lineHeight: 20,
		marginBottom: Spacing.base,
	},
	formFields: {
		gap: Spacing.md,
	},
	settingsList: {
		gap: Spacing.sm,
	},
	appInfo: {
		alignItems: "center",
		paddingTop: Spacing.base,
	},
	appInfoText: {
		fontSize: FontSizes.xs,
		color: Colors.textTertiary,
	},
});
