import React from "react";
import ExportarTab from "./ExportarTab";

type TabKey = "matriculas" | "exportar";

interface Props {
  /** Tu componente actual de Matrículas (tabla/listado). */
  matriculasSlot: React.ReactNode;
  initialTab?: TabKey;
  className?: string;
}

export default function TabsHostAspirantes({
  matriculasSlot,
  initialTab = "matriculas",
  className = "",
}: Props) {
  const [tab, setTab] = React.useState<TabKey>(initialTab);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setTab((t) => (t === "matriculas" ? "exportar" : "matriculas"));
    }
  }

  return (
    <div className={`tabs ${className}`}>
      <div
        className="tabbar"
        role="tablist"
        aria-label="Secciones aspirante-admin"
        onKeyDown={onKeyDown}
        style={{ display: "flex", gap: 8, borderBottom: "1px solid #eee", marginBottom: 12 }}
      >
        <button
          role="tab"
          aria-selected={tab === "matriculas"}
          className={`tab ${tab === "matriculas" ? "active" : ""}`}
          onClick={() => setTab("matriculas")}
          style={btnStyle(tab === "matriculas")}
        >
          Matrículas
        </button>
        <button
          role="tab"
          aria-selected={tab === "exportar"}
          className={`tab ${tab === "exportar" ? "active" : ""}`}
          onClick={() => setTab("exportar")}
          style={btnStyle(tab === "exportar")}
        >
          Exportar
        </button>
      </div>

      <div className="tabcontent">
        {tab === "matriculas" ? (
          <section aria-label="Pestaña Matrículas">{matriculasSlot}</section>
        ) : (
          <section aria-label="Pestaña Exportar">
            <ExportarTab />
          </section>
        )}
      </div>
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: active ? "#111827" : "transparent",
    color: active ? "#fff" : "#111827",
    fontWeight: 600,
    cursor: "pointer",
  };
}
