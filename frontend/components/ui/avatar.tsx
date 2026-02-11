import { StyleSheet, Text, View } from "react-native";
import { Colors, FontWeights } from "@/constants/theme";

type AvatarProps = {
	name: string;
	size?: number;
	backgroundColor?: string;
};

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, size = 64, backgroundColor = Colors.primary }: AvatarProps) {
	const fontSize = size * 0.35;

	return (
		<View
			style={[
				styles.avatar,
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor,
				},
			]}
		>
			<Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	avatar: {
		alignItems: "center",
		justifyContent: "center",
	},
	initials: {
		color: Colors.primaryText,
		fontWeight: FontWeights.bold,
	},
});
