import { useEffect, useRef, useState } from "react";
import { Animated, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";

const SCAN_WIDTH = 280;
const SCAN_HEIGHT = 160;
const CORNER_SIZE = 20;
const CORNER_THICKNESS = 3;
const OVERLAY_COLOR = "rgba(0,0,0,0.65)";
const COLOR_FOR_DETECTION_FLASH = "#ffffff";

type Props = {
	visible: boolean;
	onScanned: (barcode: string) => void;
	onClose: () => void;
};

export function BarcodeScannerModal({ visible, onScanned, onClose }: Props) {
	const [permission, requestPermission] = useCameraPermissions();
	const [detectedCode, setDetectedCode] = useState<string | null>(null);

	const flashAnim = useRef(new Animated.Value(0)).current;
	const pillAnim = useRef(new Animated.Value(0)).current;
	const autoSubmitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Reset everything when the modal opens or closes
	useEffect(() => {
		if (visible) {
			setDetectedCode(null);
			flashAnim.setValue(0);
			pillAnim.setValue(0);
		}
		return () => {
			if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
		};
	}, [visible]);

	const handleBarcodeScanned = ({ data }: { data: string }) => {
		if (detectedCode) return;
		setDetectedCode(data);

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		// Flash: fade in quickly, hold briefly, fade out
		Animated.sequence([
			Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
			Animated.timing(flashAnim, { toValue: 0.6, duration: 200, useNativeDriver: true }),
			Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
		]).start();

		// Pill: fade in
		Animated.timing(pillAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();

		// Auto-submit after the user has had a moment to see the feedback
		autoSubmitTimer.current = setTimeout(() => {
			onScanned(data);
		}, 1100);
	};

	const cornerColor = detectedCode ? COLOR_FOR_DETECTION_FLASH : "#fff";

	const renderBody = () => {
		if (!permission) return null;

		if (!permission.granted) {
			return (
				<View style={styles.permissionContainer}>
					<Text style={styles.permissionTitle}>Camera Access Needed</Text>
					<Text style={styles.permissionBody}>
						The camera is only used while scanning. No photos are stored.
					</Text>

					{permission.canAskAgain ? (
						<Pressable style={styles.primaryButton} onPress={requestPermission}>
							<Text style={styles.primaryButtonText}>Allow Camera</Text>
						</Pressable>
					) : (
						<>
							<Text style={styles.deniedNote}>
								Camera permission was denied. Enable it in Settings to scan barcodes.
							</Text>
							<Pressable style={styles.primaryButton} onPress={() => Linking.openSettings()}>
								<Text style={styles.primaryButtonText}>Open Settings</Text>
							</Pressable>
						</>
					)}

					<Pressable style={styles.ghostButton} onPress={onClose}>
						<Text style={styles.ghostButtonText}>Use Manual Entry</Text>
					</Pressable>
				</View>
			);
		}

		return (
			<View style={StyleSheet.absoluteFillObject}>
				<CameraView
					style={StyleSheet.absoluteFillObject}
					facing="back"
					barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
					onBarcodeScanned={handleBarcodeScanned}
				/>

				{/* 4-panel dark overlay */}
				<View style={styles.overlayTop} />
				<View style={styles.overlayMiddle}>
					<View style={styles.overlaySide} />

					{/* Scan zone — transparent window into camera */}
					<View style={styles.scanZone}>
						{/* Green flash when detected */}
						<Animated.View
							style={[
								StyleSheet.absoluteFillObject,
								{ backgroundColor: COLOR_FOR_DETECTION_FLASH, opacity: flashAnim, borderRadius: 4 },
							]}
							pointerEvents="none"
						/>

						{/* Corner marks — turn green on detection */}
						<View style={[styles.corner, styles.cornerTL, { borderColor: cornerColor }]} />
						<View style={[styles.corner, styles.cornerTR, { borderColor: cornerColor }]} />
						<View style={[styles.corner, styles.cornerBL, { borderColor: cornerColor }]} />
						<View style={[styles.corner, styles.cornerBR, { borderColor: cornerColor }]} />

						{/* Detected pill — fades in at the bottom of the scan zone */}
						<Animated.View style={[styles.detectedPill, { opacity: pillAnim }]} pointerEvents="none">
							<Text style={styles.detectedPillText}>Barcode detected</Text>
						</Animated.View>
					</View>

					<View style={styles.overlaySide} />
				</View>
				<View style={styles.overlayBottom}>
					<Text style={styles.scanPrompt}>
						{detectedCode ? "Looking up product…" : "Point at a grocery barcode"}
					</Text>
					{!detectedCode && (
						<Pressable
							style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.7 }]}
							onPress={onClose}
						>
							<Text style={styles.cancelText}>Cancel</Text>
						</Pressable>
					)}
				</View>
			</View>
		);
	};

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
			<View style={styles.container}>{renderBody()}</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},

	// ── Permission screen ──────────────────────────
	permissionContainer: {
		flex: 1,
		backgroundColor: Colors.surface,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing["2xl"],
		gap: Spacing.base,
	},
	permissionTitle: {
		fontSize: FontSizes.xl,
		fontWeight: FontWeights.bold,
		color: Colors.textPrimary,
		textAlign: "center",
	},
	permissionBody: {
		fontSize: FontSizes.sm,
		color: Colors.textSecondary,
		textAlign: "center",
		lineHeight: 22,
	},
	deniedNote: {
		fontSize: FontSizes.sm,
		color: Colors.amberText,
		textAlign: "center",
	},
	primaryButton: {
		backgroundColor: Colors.primary,
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xl,
		width: "100%",
		alignItems: "center",
	},
	primaryButtonText: {
		color: Colors.primaryText,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
	},
	ghostButton: {
		paddingVertical: Spacing.sm,
		alignItems: "center",
	},
	ghostButtonText: {
		color: Colors.textSecondary,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.medium,
	},

	// ── 4-panel scan overlay ───────────────────────
	overlayTop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: "50%",
		marginBottom: SCAN_HEIGHT / 2,
		backgroundColor: OVERLAY_COLOR,
	},
	overlayMiddle: {
		position: "absolute",
		left: 0,
		right: 0,
		top: "50%",
		marginTop: -(SCAN_HEIGHT / 2),
		height: SCAN_HEIGHT,
		flexDirection: "row",
	},
	overlaySide: {
		flex: 1,
		backgroundColor: OVERLAY_COLOR,
	},
	scanZone: {
		width: SCAN_WIDTH,
		height: SCAN_HEIGHT,
		overflow: "hidden",
	},
	overlayBottom: {
		position: "absolute",
		top: "50%",
		marginTop: SCAN_HEIGHT / 2,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: OVERLAY_COLOR,
		alignItems: "center",
		paddingTop: Spacing.xl,
		gap: Spacing.xl,
	},
	scanPrompt: {
		color: "#fff",
		fontSize: FontSizes.base,
		fontWeight: FontWeights.medium,
	},
	cancelButton: {
		backgroundColor: "rgba(255,255,255,0.15)",
		borderRadius: BorderRadius.full,
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.xl,
	},
	cancelText: {
		color: "#fff",
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
	},

	// ── Corner marks ──────────────────────────────
	corner: {
		position: "absolute",
		width: CORNER_SIZE,
		height: CORNER_SIZE,
	},
	cornerTL: {
		top: 0,
		left: 0,
		borderTopWidth: CORNER_THICKNESS,
		borderLeftWidth: CORNER_THICKNESS,
	},
	cornerTR: {
		top: 0,
		right: 0,
		borderTopWidth: CORNER_THICKNESS,
		borderRightWidth: CORNER_THICKNESS,
	},
	cornerBL: {
		bottom: 0,
		left: 0,
		borderBottomWidth: CORNER_THICKNESS,
		borderLeftWidth: CORNER_THICKNESS,
	},
	cornerBR: {
		bottom: 0,
		right: 0,
		borderBottomWidth: CORNER_THICKNESS,
		borderRightWidth: CORNER_THICKNESS,
	},

	// ── Detected pill ─────────────────────────────
	detectedPill: {
		position: "absolute",
		bottom: Spacing.sm,
		left: Spacing.sm,
		right: Spacing.sm,
		backgroundColor: "rgba(0,0,0,0.72)",
		borderRadius: BorderRadius.full,
		paddingVertical: Spacing.sm,
		alignItems: "center",
	},
	detectedPillText: {
		color: COLOR_FOR_DETECTION_FLASH,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
	},
});
