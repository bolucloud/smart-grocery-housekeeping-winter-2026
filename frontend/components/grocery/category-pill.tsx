import type React from "react";
import { Badge } from "@/components/ui/badge";

type Category = "vegetable" | "fruit" | "packaged";

type CategoryPillProps = {
	category: Category;
};

const categoryConfig: Record<Category, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
	vegetable: { label: "Vegetable", variant: "green" },
	fruit: { label: "Fruit", variant: "orange" },
	packaged: { label: "Packaged", variant: "blue" },
};

export function CategoryPill({ category }: CategoryPillProps) {
	const config = categoryConfig[category];
	return <Badge label={config.label} variant={config.variant} />;
}
