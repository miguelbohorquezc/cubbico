import React from "react";

type Tab = { id: "aspirantes" | "matriculas"; label: string };
const TABS: Tab[] = [
  { id: "aspirantes", label: "Aspirantes" },
  { id: "matriculas", label: "Matrículas" },
];

export function TabBar({ value, onChange }:{
  value: "aspirantes" | "matriculas";
  onChange: (v:"aspirantes"|"matriculas")=>void;
}) {
  return (
    <div className="tabs" role="tablist" aria-label="Secciones de Admisiones">
      {TABS.map(t=>(
        <button
          key={t.id}
          role="tab"
          aria-selected={value===t.id}
          className={`tab ${value===t.id ? "tab--active" : ""}`}
          onClick={()=>onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
