import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────

export type ItemStatus = "active" | "finished" | "spoiled";

export type InventoryItem = {
	id: string;
	name: string;
	brand: string;
	barcode: string;
	typeIndex: number;
	category: string;
	storageIndex: number;
	quantity: string;
	unit: string;
	size: string;
	sizeUnit: string;
	bestBeforeDate: string;
	purchaseDate: string;
	shelfLifeDays: string;
	notes: string;
	status: ItemStatus;
	addedAt: string; // ISO timestamp
};

export type GroceryRun = {
	id: string;
	storeName: string;
	date: string; // YYYY-MM-DD
	itemIds: string[];
	createdAt: string; // ISO timestamp
};

// ─── Helpers ─────────────────────────────────────────────────

export function deriveDisplayStatus(
	item: InventoryItem
): "fresh" | "expiring" | "expired" | "spoiled" | "finished" {
	if (item.status === "finished") return "finished";
	if (item.status === "spoiled") return "spoiled";
	if (!item.bestBeforeDate) return "fresh";

	const [y, m, d] = item.bestBeforeDate.split("-").map(Number);
	const expiry = new Date(y, m - 1, d);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (expiry < today) return "expired";

	const threeDays = new Date(today);
	threeDays.setDate(threeDays.getDate() + 3);
	if (expiry <= threeDays) return "expiring";

	return "fresh";
}

// ─── Store ───────────────────────────────────────────────────

type InventoryState = {
	items: InventoryItem[];
	runs: GroceryRun[];
	addItems: (newItems: Omit<InventoryItem, "status" | "addedAt">[]) => void;
	addRun: (storeName: string, date: string, newItems: Omit<InventoryItem, "status" | "addedAt">[]) => void;
	markFinished: (id: string) => void;
	markSpoiled: (id: string) => void;
	updateItem: (id: string, updates: Partial<Omit<InventoryItem, "id" | "status" | "addedAt">>) => void;
	clearAll: () => void;
};

export const useInventoryStore = create<InventoryState>()(
	persist(
		(set, get) => ({
			items: [],
			runs: [],

			addItems: (newItems) => {
				const stamped: InventoryItem[] = newItems.map((item) => ({
					...item,
					status: "active",
					addedAt: new Date().toISOString(),
				}));
				set((state) => ({ items: [...state.items, ...stamped] }));
			},

			addRun: (storeName, date, newItems) => {
				const stamped: InventoryItem[] = newItems.map((item) => ({
					...item,
					status: "active",
					addedAt: new Date().toISOString(),
				}));
				const run: GroceryRun = {
					id: Date.now().toString(),
					storeName,
					date,
					itemIds: stamped.map((i) => i.id),
					createdAt: new Date().toISOString(),
				};
				set((state) => ({
					items: [...state.items, ...stamped],
					runs: [run, ...state.runs],
				}));
			},

			markFinished: (id) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.id === id ? { ...item, status: "finished" } : item
					),
				})),

			markSpoiled: (id) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.id === id ? { ...item, status: "spoiled" } : item
					),
				})),

			updateItem: (id, updates) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.id === id ? { ...item, ...updates } : item
					),
				})),

			clearAll: () => set({ items: [], runs: [] }),
		}),
		{
			name: "@inventory_store",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
