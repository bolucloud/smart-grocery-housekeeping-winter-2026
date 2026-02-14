import type React from "react";
import { Badge } from "@/components/ui/badge";

type ProductStatus = "fresh" | "expiring" | "expired" | "spoiled" | "finished";

type StatusBadgeProps = {
	status: ProductStatus;
};

const statusConfig: Record<ProductStatus, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }> = {
	fresh: { label: "Fresh", variant: "green" },
	expiring: { label: "Expiring Soon", variant: "amber" },
	expired: { label: "Expired", variant: "red" },
	spoiled: { label: "Spoiled", variant: "red" },
	finished: { label: "Used Up", variant: "gray" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
	const config = statusConfig[status];
	return <Badge label={config.label} variant={config.variant} />;
}
