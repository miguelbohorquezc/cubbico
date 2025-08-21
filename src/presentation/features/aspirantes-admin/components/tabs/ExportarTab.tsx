import MatriculadosPorGradoCsv from "../MatriculadosPorGradoCsv";

/** Pestaña "Exportar": consulta por grado, filtra y exporta CSV (nombres + tipo/número). */
export default function ExportarTab() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <MatriculadosPorGradoCsv />
    </div>
  );
}