import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

type ProductStatus = "fresh" | "expiring" | "expired" | "spoiled" | "finished";

type ProductCardProps = {
	name: string;
	category: string;
	quantity: number;
	unit: string;
	expiryDate: string;
	status: ProductStatus;
	batchNumber?: number;
	totalBatches?: number;
	onEdit?: () => void;
	onUsedUp?: () => void;
	onSpoiled?: () => void;
};

const statusBorderColors: Record<ProductStatus, string> = {
	fresh: Colors.greenText,
	expiring: Colors.amberText,
	expired: Colors.redText,
	spoiled: Colors.redTextDark,
	finished: Colors.textTertiary,
};

const statusIcons: Record<ProductStatus, React.ComponentProps<typeof IconSymbol>["name"]> = {
	fresh: "leaf.fill",
	expiring: "exclamationmark.triangle.fill",
	expired: "xmark.circle.fill",
	spoiled: "trash",
	finished: "checkmark.circle.fill",
};

const statusIconColors: Record<ProductStatus, string> = {
	fresh: Colors.greenText,
	expiring: Colors.amberText,
	expired: Colors.redText,
	spoiled: Colors.redText,
	finished: Colors.greenText,
};

export function ProductCard({
	name,
	category,
	quantity,
	unit,
	expiryDate,
	status,
	batchNumber,
	totalBatches,
	onEdit,
	onUsedUp,
	onSpoiled,
}: ProductCardProps) {
	const isActive = status !== "finished" && status !== "spoiled";
	const formattedDate = new Date(expiryDate).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return (
		<Card leftBorderColor={statusBorderColors[status]}>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<View style={styles.titleRow}>
						<IconSymbol name={statusIcons[status]} size={18} color={statusIconColors[status]} />
						<Text style={styles.name}>{name}</Text>
						{totalBatches && totalBatches > 1 && (
							<View style={styles.batchBadge}>
								<Text style={styles.batchText}>
									Batch {batchNumber}/{totalBatches}
								</Text>
							</View>
						)}
					</View>
					<Text style={styles.meta}>
						{category} &bull; {quantity} {unit}
					</Text>
					<View style={styles.dateRow}>
						<IconSymbol name="clock.fill" size={12} color={Colors.textTertiary} />
						<Text style={styles.dateText}>Expires {formattedDate}</Text>
					</View>
				</View>
				{onEdit && isActive && (
					<Pressable onPress={onEdit} style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.6 : 1 }]}>
						<IconSymbol name="pencil" size={16} color={Colors.textSecondary} />
					</Pressable>
				)}
			</View>

			{isActive && (onUsedUp || onSpoiled) && (
				<View style={styles.actions}>
					{onUsedUp && (
						<Button
							title="Used Up"
							variant="secondary"
							size="sm"
							icon="checkmark.circle.fill"
							onPress={onUsedUp}
							style={[
								styles.actionButton,
								{
									backgroundColor: Colors.greenBg,
									borderColor: Colors.greenBorder,
								},
							]}
						/>
					)}
					{onSpoiled && (
						<Button
							title="Spoiled"
							variant="secondary"
							size="sm"
							icon="trash"
							onPress={onSpoiled}
							style={[
								styles.actionButton,
								{
									backgroundColor: Colors.redBg,
									borderColor: Colors.redBorder,
								},
							]}
						/>
					)}
				</View>
			)}

			{!isActive && (
				<View style={styles.statusBar}>
					<IconSymbol
						name={status === "finished" ? "checkmark.circle.fill" : "trash"}
						size={14}
						color={status === "finished" ? Colors.greenText : Colors.redText}
					/>
					<Text style={styles.statusText}>{status === "finished" ? "Marked as used up" : "Marked as spoiled"}</Text>
				</View>
			)}
		</Card>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: Spacing.md,
	},
	headerLeft: {
		flex: 1,
		gap: Spacing.xs,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	name: {
		fontSize: FontSizes.base,
		fontWeight: FontWeights.semibold,
		color: Colors.textPrimary,
	},
	batchBadge: {
		paddingHorizontal: Spacing.sm,
		paddingVertical: 2,
		backgroundColor: Colors.secondaryBg,
		borderRadius: 9999,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	batchText: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.medium,
		color: Colors.secondaryText,
	},
	meta: {
		fontSize: FontSizes.xs,
		color: Colors.textSecondary,
		textTransform: "capitalize",
	},
	dateRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	dateText: {
		fontSize: FontSizes.xs,
		color: Colors.textTertiary,
	},
	editButton: {
		padding: Spacing.sm,
	},
	actions: {
		flexDirection: "row",
		gap: Spacing.sm,
		marginTop: Spacing.md,
	},
	actionButton: {
		flex: 1,
	},
	statusBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
		marginTop: Spacing.md,
		paddingVertical: Spacing.sm,
		backgroundColor: Colors.secondaryBg,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	statusText: {
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.medium,
		color: Colors.secondaryText,
	},
});
