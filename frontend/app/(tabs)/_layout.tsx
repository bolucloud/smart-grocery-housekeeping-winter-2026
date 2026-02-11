import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors.tint,
				tabBarInactiveTintColor: Colors.tabIconDefault,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: {
					backgroundColor: Colors.surface,
					borderTopColor: Colors.borderSubtle,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="inventory"
				options={{
					title: "Items",
					tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="add"
				options={{
					title: "Add",
					tabBarIcon: ({ color }) => <IconSymbol size={24} name="plus.circle.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="history"
				options={{
					title: "History",
					tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="recipes"
				options={{
					title: "Recipes",
					tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
				}}
			/>
		</Tabs>
	);
}
