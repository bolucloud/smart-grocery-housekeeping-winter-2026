// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolViewProps, SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbol -> Material Icon mappings.
 * - Material Icons: https://icons.expo.fyi
 * - SF Symbols: https://developer.apple.com/sf-symbols/
 */
const MAPPING = {
	// Tab icons
	"house.fill": "home",
	"list.bullet": "format-list-bulleted",
	"plus.circle.fill": "add-circle",
	"clock.fill": "history",
	"book.fill": "menu-book",

	// Navigation / header
	"gearshape.fill": "settings",
	"chart.bar.fill": "bar-chart",
	"chevron.right": "chevron-right",
	"chevron.left": "chevron-left",
	xmark: "close",

	// Actions
	plus: "add",
	minus: "remove",
	pencil: "edit",
	trash: "delete",
	"camera.fill": "photo-camera",
	magnifyingglass: "search",
	"arrow.uturn.backward": "undo",
	"arrow.right.square": "logout",

	// Status
	"checkmark.circle.fill": "check-circle",
	"exclamationmark.triangle.fill": "warning",
	"xmark.circle.fill": "cancel",
	"info.circle.fill": "info",
	"leaf.fill": "eco",
	sparkles: "auto-awesome",
	"flame.fill": "local-fire-department",
	"archivebox.fill": "archive",

	// Misc
	"person.circle.fill": "account-circle",
	globe: "language",
	"lightbulb.fill": "lightbulb",
	"arrow.up.right": "open-in-new",
	"barcode.viewfinder": "qr-code-scanner",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
	name,
	size = 24,
	color,
	style,
}: {
	name: IconSymbolName;
	size?: number;
	color: string | OpaqueColorValue;
	style?: StyleProp<TextStyle>;
	weight?: SymbolWeight;
}) {
	return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
