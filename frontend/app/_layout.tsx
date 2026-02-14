import "react-native-reanimated";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/theme";

const LightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: Colors.background,
		card: Colors.surface,
		text: Colors.textPrimary,
		border: Colors.borderSubtle,
		primary: Colors.primary,
	},
};

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	return (
		<ThemeProvider value={LightTheme}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: "Home" }} />
				<Stack.Screen name="settings" options={{ title: "Settings", presentation: "card" }} />
				<Stack.Screen name="reports" options={{ title: "Insights", presentation: "card" }} />
			</Stack>
			<StatusBar style="dark" />
		</ThemeProvider>
	);
}
