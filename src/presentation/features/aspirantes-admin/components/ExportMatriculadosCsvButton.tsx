import React from "react";
import type { GradoAspirado, MatriculaRow } from "../matriculas.types";

export default function ExportMatriculadosCsvButton({
  rows,
  filenamePrefix = "matriculados",
}: {
  rows: MatriculaRow[];
  filenamePrefix?: string;
}) {
  const [filtroGrado, setFiltroGrado] = React.useState<GradoAspirado | "">("" as any);
  const [desde, setDesde] = React.useState<string>("");
  const [hasta, setHasta] = React.useState<string>("");
  const [exporting, setExporting] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);

  const matriculados = React.useMemo(() => {
    let base = (rows || []).filter((r) => (r as any).matriculaActiva === true);

    if (filtroGrado) base = base.filter((r) => r.grado === filtroGrado);

    const dDesde = desde ? new Date(`${desde}T00:00:00`) : null;
    const dHasta = hasta ? new Date(`${hasta}T23:59:59`) : null;
    const toDate = (v: any): Date | null => {
      try {
        if (!v) return null;
        if (typeof v?.toDate === "function") return v.toDate();
        if (v instanceof Date) return v;
        if (typeof v === "number") return new Date(v);
        if (typeof v === "string") return new Date(v);
        return null;
      } catch { return null; }
    };

    if (dDesde || dHasta) {
      base = base.filter((r) => {
        const m = toDate((r as any).matriculadoEn);
        if (!m) return false;
        if (dDesde && m < dDesde) return false;
        if (dHasta && m > dHasta) return false;
        return true;
      });
    }

    base.sort((a, b) => {
      const ad = toDate((a as any).matriculadoEn) || toDate(a.creadoEn) || new Date(0);
      const bd = toDate((b as any).matriculadoEn) || toDate(b.creadoEn) || new Date(0);
      return bd.getTime() - ad.getTime();
    });

    return base;
  }, [rows, filtroGrado, desde, hasta]);

  async function onExport() {
    if (exporting) return;
    setExporting(true);
    try {
      if (!matriculados.length) {
        setToast({ type: "info", message: "No hay matriculados para exportar con ese filtro." });
        return;
      }
      const csv = buildCsv(matriculados);
      const now = new Date();
      const ts = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
      const extra =
        (filtroGrado ? `_grado-${filtroGrado}` : "") +
        (desde ? `_desde-${desde}` : "") +
        (hasta ? `_hasta-${hasta}` : "");
      const filename = `${filenamePrefix}${extra}_${ts}.csv`;
      downloadCsv(csv, filename);
      setToast({ type: "success", message: `Exportados ${matriculados.length} registros.` });
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Error al exportar. Revisa tu navegador." });
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 16, display: "grid", gap: 12 }}>
        <h4 style={{ margin: 0 }}>Exportar matriculados (.csv)</h4>

        <div className="filters" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field">
            <label className="small">Grado (opcional)</label>
            <select
              value={filtroGrado || ""}
              onChange={(e) => setFiltroGrado((e.target.value || "") as any)}
            >
              <option value="">Todos</option>
              {GRADOS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="small">Desde (activación)</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="field">
            <label className="small">Hasta (activación)</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn--primary" onClick={onExport} disabled={exporting}>
            {exporting ? "Generando CSV…" : "Exportar .csv"}
          </button>
          <span className="muted small">
            Se usa el listado ya cargado en pantalla (<code>matriculaActiva = true</code>).
          </span>
        </div>

        <div className="muted small">Coincidencias actuales: <strong>{matriculados.length}</strong></div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

/* ----------------------------- Constantes/Utils ----------------------------- */

const GRADOS: GradoAspirado[] = [
  "walkers","nursery","prekinder","kinder","transition",
  "primero","segundo","tercero","cuarto","quinto","sexto","septimo",
];

type ToastState = { type: "success" | "error" | "info"; message: string } | null;

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div role="status" aria-live="polite"
      style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1000, maxWidth: "90vw" }}>
      <div style={{
        padding: "10px 14px", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        background: toast.type === "success" ? "#10b981" : toast.type === "info" ? "#3b82f6" : "#ef4444",
        color: "white", fontWeight: 600
      }}>
        {toast.message}
      </div>
    </div>
  );
}

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function buildCsv(rows: MatriculaRow[]): string {
  const header = [
    "PrimerApellido",
    "SegundoApellido",
    "Nombres",
    "TipoIdent",
    "NumeroIdent",
  ];

  const lines = rows.map((r) => {
    const e = r.estudiante || ({} as any);
    return [
      e.primerApellido ?? "",
      e.segundoApellido ?? "",
      e.nombres ?? "",
      e.tipoIdentificacion ?? "",
      e.numeroIdentificacion ?? "",
    ].map(csvEscape).join(",");
  });

  const bom = "\uFEFF";
  return bom + [header.join(","), ...lines].join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
