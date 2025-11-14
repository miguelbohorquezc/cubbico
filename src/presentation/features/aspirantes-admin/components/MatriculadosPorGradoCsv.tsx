import React from "react";
import type { GradoAspirado, MatriculaRow } from "../matriculas.types";
import { obtenerPorGradoSinIndices } from "../services/matriculasAdmin.service";

/* ----------------------------- Utils ----------------------------- */
const GRADOS: GradoAspirado[] = [
  "walkers","nursery","prekinder","kinder","transition",
  "primero","segundo","tercero","cuarto","quinto","sexto","septimo"
];

function toDate(val: any): Date | null {
  try {
    if (!val) return null;
    if (typeof val?.toDate === "function") return val.toDate();
    if (val instanceof Date) return val;
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") return new Date(val);
    return null;
  } catch { return null; }
}

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

/** CSV reducido: solo nombres/apellidos + tipo y número de identificación */
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
//@ts-ignore
function fmt(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("es-CO")} ${d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
}

/* ----------------------------- UI: Toast simple ----------------------------- */
type ToastState = { type: "success" | "error" | "info"; message: string } | null;
function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div role="status" aria-live="polite"
      style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1000 }}>
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

/* ----------------------------- Componente ----------------------------- */
export default function MatriculadosPorGradoCsv() {
  const [grado, setGrado] = React.useState<GradoAspirado>("primero" as GradoAspirado);
  const [desde, setDesde] = React.useState<string>("");
  const [hasta, setHasta] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [raw, setRaw] = React.useState<MatriculaRow[]>([]);
  const [toast, setToast] = React.useState<ToastState>(null);

  const filtered = React.useMemo(() => {
    const dDesde = desde ? new Date(`${desde}T00:00:00`) : null;
    const dHasta = hasta ? new Date(`${hasta}T23:59:59`) : null;

    let base = (raw || []).filter((r) => (r as any).matriculaActiva === true);

    if (dDesde || dHasta) {
      base = base.filter((r) => {
        const m = toDate((r as any).matriculadoEn);
        if (!m) return false;
        if (dDesde && m < dDesde) return false;
        if (dHasta && m > dHasta) return false;
        return true;
      });
    }

    // ordenar por fecha de matricula desc; fallback creadoEn
    base.sort((a, b) => {
      const ad = toDate((a as any).matriculadoEn) || toDate(a.creadoEn) || new Date(0);
      const bd = toDate((b as any).matriculadoEn) || toDate(b.creadoEn) || new Date(0);
      return bd.getTime() - ad.getTime();
    });

    return base;
  }, [raw, desde, hasta]);

  async function consultar() {
    setLoading(true);
    try {
      const data = await obtenerPorGradoSinIndices(grado, { pageSize: 800, max: 20000 });
      setRaw(data);
      setToast({ type: "success", message: `Cargados ${data.length} registros de ${grado}.` });
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Error al consultar. Revisa permisos o conexión." });
    } finally {
      setLoading(false);
    }
  }

  function exportarCsv() {
    if (!filtered.length) {
      setToast({ type: "info", message: "No hay datos para exportar." });
      return;
    }
    const csv = buildCsv(filtered);
    const now = new Date();
    const ts = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
    const extra =
      (grado ? `_grado-${grado}` : "") +
      (desde ? `_desde-${desde}` : "") +
      (hasta ? `_hasta-${hasta}` : "");
    downloadCsv(csv, `matriculados${extra}_${ts}.csv`);
    setToast({ type: "success", message: `Exportados ${filtered.length} registros.` });
  }

  return (
    <>
      <div className="card" style={{ padding: 16, display: "grid", gap: 12 }}>
        <h4 style={{ margin: 0 }}>Matriculados por grado (consulta, filtro y exportación)</h4>

        {/* Filtros de consulta */}
        <div className="filters" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field">
            <label className="small">Grado</label>
            <select value={grado} onChange={(e) => setGrado(e.target.value as GradoAspirado)}>
              {GRADOS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary" onClick={consultar} disabled={loading}>
            {loading ? "Consultando…" : "Consultar"}
          </button>
        </div>

        {/* Filtros locales (cliente) */}
        <div className="filters" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field">
            <label className="small">Desde (activación)</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="field">
            <label className="small">Hasta (activación)</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <button className="btn" onClick={exportarCsv} disabled={loading || !raw.length}>
            Exportar .csv
          </button>
          <span className="muted small">
            Total cargado: <strong>{raw.length}</strong> — Coincidencias filtradas: <strong>{filtered.length}</strong>
          </span>
        </div>

        {/* Lista simple de resultados */}
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Primer Apellido</th>
                <th>Segundo Apellido</th>
                <th>Nombres</th>
                <th>Tipo</th>
                <th>Número</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="muted">No hay registros con esos filtros.</td></tr>
              ) : (
                filtered.map((r) => {
                  const e = r.estudiante || ({} as any);
                  return (
                    <tr key={r.id}>
                      <td>{e.primerApellido ?? "—"}</td>
                      <td>{e.segundoApellido ?? "—"}</td>
                      <td>{e.nombres ?? "—"}</td>
                      <td className="nowrap">{e.tipoIdentificacion ?? "—"}</td>
                      <td className="nowrap">{e.numeroIdentificacion ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
