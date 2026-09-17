import React from "react";
import { Badge } from "@/components/ui/badge";
import { getExpiryStatus, EXPIRY_STYLES, formatExpiryDate } from "@/lib/expiryStatus";

export default function ExpiryStatusBadge({ expiration_date }) {
  const status = getExpiryStatus(expiration_date);
  return (
    <Badge variant="outline" className={`text-xs whitespace-nowrap ${EXPIRY_STYLES[status.state]}`}>
      {formatExpiryDate(expiration_date)} · {status.label}
    </Badge>
  );
}