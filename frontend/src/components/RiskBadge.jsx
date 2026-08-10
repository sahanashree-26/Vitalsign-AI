import React from "react";

export default function RiskBadge({ level }) {
  const cls =
    level === "High" ? "badge-high" : level === "Medium" ? "badge-medium" : "badge-low";
  return <span className={cls}>{level} Risk</span>;
}
