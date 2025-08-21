
export type TabKey = "aspirantes" | "matriculas" | "exportar";

export function TabBar({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  return (
    <div className="tabbar" role="tablist" aria-label="Navegación de secciones">
      <button
        role="tab"
        aria-selected={value === "aspirantes"}
        className={`tab ${value === "aspirantes" ? "active" : ""}`}
        onClick={() => onChange("aspirantes")}
      >
        Aspirantes
      </button>

      <button
        role="tab"
        aria-selected={value === "matriculas"}
        className={`tab ${value === "matriculas" ? "active" : ""}`}
        onClick={() => onChange("matriculas")}
      >
        Matrículas
      </button>

      {/* ➕ Nuevo botón, mantiene mismas clases/markup */}
      <button
        role="tab"
        aria-selected={value === "exportar"}
        className={`tab ${value === "exportar" ? "active" : ""}`}
        onClick={() => onChange("exportar")}
      >
        Exportar
      </button>
    </div>
  );
}
