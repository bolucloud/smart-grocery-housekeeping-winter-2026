import type React from "react";
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { BorderRadius, Colors, Shadows, Spacing } from "@/constants/theme";

type CardProps = {
	children: React.ReactNode;
	leftBorderColor?: string;
	style?: StyleProp<ViewStyle>;
	onPress?: () => void;
};

export function Card({ children, leftBorderColor, style, onPress }: CardProps) {
	const cardStyle = [
		styles.card,
		leftBorderColor && {
			borderLeftWidth: 4,
			borderLeftColor: leftBorderColor,
		},
		style,
	];

	if (onPress) {
		return (
			<Pressable onPress={onPress} style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.95 : 1 }]}>
				{children}
			</Pressable>
		);
	}

	return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.surface,
		borderRadius: BorderRadius.lg,
		padding: Spacing.base,
		...Shadows.subtle,
	},
});
