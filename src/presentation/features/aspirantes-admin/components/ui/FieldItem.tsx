import React from "react";
export function FieldItem({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <li className="item">
      <div className="k">{k}</div>
      <div className="v">{v ?? "—"}</div>
    </li>
  );
}
