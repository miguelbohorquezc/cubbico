import React from "react";
import { createPortal } from "react-dom";
import type { MatriculaRow, DocsFisicos, Contabilidad, AuditEvent } from "../matriculas.types";
import {
  actualizarRevisionMatricula,
  obtenerMatriculaPorId,
  activarMatricula,
  revocarMatricula,
  escucharAuditoria,
} from "../services/matriculasAdmin.service";
import FichaMatriculaPrint from "./print/FichaMatriculaPrint";

/* -------------------- Util fecha local (independiente) -------------------- */
function formatFechaBonita(v: any) {
  let d: Date | null = null;
  try {
    d = v?.toDate ? v.toDate() : typeof v === "number" ? new Date(v) : null;
  } catch {
    d = null;
  }
  if (!d || isNaN(d.getTime())) return { label: "—", dateTime: "" };
  const fecha = d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return { label: `${fecha} · ${hora}`, dateTime: d.toISOString() };
}

/* -------------------- Lógica de estado visual (badge) -------------------- */
function computeBadging(fila: MatriculaRow, docs: DocsFisicos, cuenta: Contabilidad) {
  const esPre = ["walkers", "nursery", "prekinder", "kinder", "transition"].includes(
    fila.grado
  );

  const requiredDocsComplete =
    !!docs.copiaReg &&
    !!docs.certMedico &&
    !!docs.certEstudios &&
    !!docs.carnetVacunas &&
    !!docs.fotos3 &&
    !!docs.certEPS &&
    !!docs.certLaboral &&
    !!docs.retiroSimat &&
    (esPre ? !!docs.fotoFamiliarPre : true);

  const accountingReady = !!cuenta.contratosPagare;
  const puedeMatricular = requiredDocsComplete && accountingReady;

  if ((fila as any).matriculaActiva) {
    return { cls: "badge badge--success", txt: "Matriculado" };
  }
  if (puedeMatricular) return { cls: "badge badge--matricular", txt: "Listo para matricular" };
  if (requiredDocsComplete) return { cls: "badge badge--admitido", txt: "Documentos completos" };
  return { cls: "badge badge--en_revision", txt: "En revisión" };
}

/* -------------------- UI: Confirmar activar -------------------- */
function ConfirmMatriculaDialog(props: {
  open: boolean;
  nombreEstudiante: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const { open, onCancel, onConfirm, nombreEstudiante, loading } = props;
  if (!open) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" className="modal-overlay" onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 1000 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}
        style={{ width: "min(520px, 92vw)", background: "white", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.25)", padding: 24 }}>
        <h3 id="confirm-title" style={{ marginTop: 0 }}>Confirmar matrícula</h3>
        <p>¿Activar la matrícula de <strong>{nombreEstudiante || "el estudiante"}</strong>?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="btn btn--primary" onClick={onConfirm} disabled={loading} aria-busy={loading}>
            {loading ? "Matriculando…" : "Sí, matricular"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* -------------------- UI: Confirmar revocar (con motivo) -------------------- */
function ConfirmRevocarDialog(props: {
  open: boolean;
  nombreEstudiante: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}) {
  const { open, onCancel, onConfirm, nombreEstudiante, loading } = props;
  const [reason, setReason] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  React.useEffect(() => {
    if (!open) { setReason(""); setTouched(false); }
  }, [open]);

  if (!open) return null;
  const invalid = touched && reason.trim().length < 4;

  return createPortal(
    <div role="dialog" aria-modal="true" className="modal-overlay" onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 1000 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 92vw)", background: "white", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.25)", padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Revocar matrícula</h3>
        <p>¿Deseas revocar la matrícula de <strong>{nombreEstudiante || "el estudiante"}</strong>?</p>
        <label className="small" htmlFor="motivo">Motivo (obligatorio)</label>
        <textarea
          id="motivo"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={4}
          style={{ width: "100%", resize: "vertical", borderRadius: 8, padding: 10, border: invalid ? "1px solid #ef4444" : "1px solid #ddd" }}
          placeholder="Ej.: Se retracta el acudiente; error en asignación de cupo; etc."
        />
        {invalid && <div className="small" style={{ color: "#ef4444", marginTop: 6 }}>
          Por favor escribe al menos 4 caracteres.
        </div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button className="btn" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="btn btn--danger" onClick={() => onConfirm(reason.trim())} disabled={loading || invalid}>
            {loading ? "Revocando…" : "Sí, revocar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* -------------------- UI: Toast liviano -------------------- */
type ToastState = { type: "success" | "error"; message: string } | null;
function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return createPortal(
    <div role="status" aria-live="polite"
      style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1000, maxWidth: "90vw" }}>
      <div style={{ padding: "10px 14px", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", background: toast.type === "success" ? "#10b981" : "#ef4444", color: "white", fontWeight: 600 }}>
        {toast.message}
      </div>
    </div>, document.body
  );
}

/* ============================= Componente ============================= */
export function EnrollmentRow({ fila }: { fila: MatriculaRow }) {
  const [abierta, setAbierta] = React.useState(false);

  const fecha = formatFechaBonita(fila.creadoEn);
  const nombre = `${fila.estudiante?.primerApellido ?? ""} ${fila.estudiante?.segundoApellido ?? ""} ${fila.estudiante?.nombres ?? ""}`.trim();

  const [docs, setDocs] = React.useState<DocsFisicos>(fila.docs ?? {});
  const [cuenta, setCuenta] = React.useState<Contabilidad>(fila.cuenta ?? {});
  const [guardando, setGuardando] = React.useState(false);
  const [matriculando, setMatriculando] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmRevocarOpen, setConfirmRevocarOpen] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);

  const badge = computeBadging(fila, docs, cuenta);
  const puedeMatricular = badge.cls.includes("matricular");

  /* ---------- Historial (auditoría) ---------- */
  const [audit, setAudit] = React.useState<AuditEvent[]>([]);
  React.useEffect(() => {
    const off = escucharAuditoria(fila.id, setAudit);
    return () => off && off();
  }, [fila.id]);

  const onDoc =
    (k: keyof DocsFisicos) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setDocs((d) => ({ ...d, [k]: e.target.checked }));

  const onCta =
    (k: keyof Contabilidad) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setCuenta((c) => ({ ...c, [k]: e.target.checked }));

  async function guardar() {
    setGuardando(true);
    try {
      await actualizarRevisionMatricula(fila.id, docs, cuenta);
      setToast({ type: "success", message: "Revisión guardada." });
    } catch {
      setToast({ type: "error", message: "No se pudo guardar la revisión." });
    } finally {
      setGuardando(false);
    }
  }

  /* ------------------------- Impresión de ficha ------------------------- */
  const [printData, setPrintData] = React.useState<MatriculaRow | null>(null);
  const [printing, setPrinting] = React.useState(false);

  React.useEffect(() => {
    const onAfter = () => {
      setPrinting(false);
      setPrintData(null);
    };
    window.addEventListener("afterprint", onAfter);
    return () => window.removeEventListener("afterprint", onAfter);
  }, []);

  async function imprimirFicha() {
    const full = await obtenerMatriculaPorId(fila.id);
    setPrintData((full ?? fila) as MatriculaRow);
    setPrinting(true);
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  /* -------------------- Confirmación + Activación -------------------- */
  function abrirConfirmacion() {
    if ((fila as any).matriculaActiva) return;
    setConfirmOpen(true);
  }
  async function confirmarMatricula() {
    if (matriculando) return;
    setMatriculando(true);
    try {
      await activarMatricula(fila.id);
      setToast({ type: "success", message: "Matrícula activada correctamente." });
      setConfirmOpen(false);
    } catch {
      setToast({ type: "error", message: "No se pudo activar la matrícula." });
    } finally {
      setMatriculando(false);
    }
  }

  /* -------------------- Confirmación + Revocación -------------------- */
  function abrirRevocacion() {
    if (!(fila as any).matriculaActiva) return;
    setConfirmRevocarOpen(true);
  }
  async function confirmarRevocacion(reason: string) {
    if (matriculando) return;
    setMatriculando(true);
    try {
      await revocarMatricula(fila.id, reason);
      setToast({ type: "success", message: "Matrícula revocada." });
      setConfirmRevocarOpen(false);
    } catch {
      setToast({ type: "error", message: "No se pudo revocar la matrícula." });
    } finally {
      setMatriculando(false);
    }
  }

  return (
    <>
      {/* --------------------------- Fila principal --------------------------- */}
      <tr className={`row ${abierta ? "row--open" : ""}`}>
        <td className="mono">{fila.id}</td>
        <td className="nowrap">
          <time className="date" dateTime={fecha.dateTime}>
            {fecha.label}
          </time>
        </td>
        <td>
          <div className="strong">{nombre || "—"}</div>
        </td>
        <td className="nowrap">{fila.grado}</td>
        <td>
          <span className={badge.cls}><p>{badge.txt}</p></span>
        </td>
        <td className="th-actions">
          <button className="btn" onClick={() => setAbierta((v) => !v)}>
            {abierta ? "Ocultar" : "Revisar"}
          </button>
        </td>
      </tr>

      {/* --------------------------- Detalle expandido --------------------------- */}
      {abierta && (
        <tr className="row-expand">
          <td colSpan={6}>
            <div className="expand">
              {/* Estudiante */}
              <section className="card">
                <h4>Estudiante</h4>
                <ul className="list">
                  <li className="item">
                    <div className="k">Identificación</div>
                    <div className="v">
                      {fila.estudiante?.tipoIdentificacion?.replace("_", " ").toUpperCase()} —{" "}
                      {fila.estudiante?.numeroIdentificacion || "—"}
                    </div>
                  </li>
                  <li className="item">
                    <div className="k">Fecha y lugar de nacimiento</div>
                    <div className="v">
                      {fila.estudiante?.fechaNacimiento || "—"} —{" "}
                      {fila.estudiante?.lugarNacimiento || "—"} —{" "}
                      {fila.estudiante?.edadAnos || "—"} años
                    </div>
                  </li>
                  <li className="item">
                    <div className="k">Dirección/Teléfono</div>
                    <div className="v">
                      {fila.estudiante?.direccion || "—"} — {fila.estudiante?.telefono || "—"}
                    </div>
                  </li>
                  <li className="item">
                    <div className="k">Colegio anterior</div>
                    <div className="v">{fila.estudiante?.colegioAnterior || "—"}</div>
                  </li>
                  <li className="item">
                    <div className="k">Estado matrícula</div>
                    <div className="v">
                      <span className={badge.cls}><p>{badge.txt}</p></span>
                    </div>
                  </li>
                </ul>
              </section>

              {/* Documentos físicos */}
              <section className="card">
                <h4>Documentos físicos</h4>
                <ul className="list-grid">
                  <li className="checkcard"><input type="checkbox" checked={!!docs.copiaReg} onChange={onDoc("copiaReg")}/><span>Copia registro civil o TI</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.certMedico} onChange={onDoc("certMedico")}/><span>Certificado médico</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.certEstudios} onChange={onDoc("certEstudios")}/><span>Certificado de estudios</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.carnetVacunas} onChange={onDoc("carnetVacunas")}/><span>Copia carnet de vacunas</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.fotos3} onChange={onDoc("fotos3")}/><span>3 fotografías</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.certEPS} onChange={onDoc("certEPS")}/><span>Certificado de EPS</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.certLaboral} onChange={onDoc("certLaboral")}/><span>Certificado laboral</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.retiroSimat} onChange={onDoc("retiroSimat")}/><span>Retiro SIMAT</span></li>
                  <li className="checkcard"><input type="checkbox" checked={!!docs.fotoFamiliarPre} onChange={onDoc("fotoFamiliarPre")}/><span>Fotografía familiar (Preescolar)</span></li>
                </ul>
              </section>

              {/* Contabilidad + Acciones */}
              <section className="card">
                <h4>Contabilidad</h4>
                <div className="checkrow">
                  <input type="checkbox" checked={!!cuenta.contratosPagare} onChange={onCta("contratosPagare")}/>
                  <div>
                    <div className="row-title">Contratos y pagaré</div>
                    <div className="row-sub small">Requerido para habilitar matrícula.</div>
                  </div>
                </div>
                <div className="checkrow">
                  <input type="checkbox" checked={!!cuenta.pagoMatriculaYCupo} onChange={onCta("pagoMatriculaYCupo")}/>
                  <div>
                    <div className="row-title">Pago de matrícula y cupo</div>
                    <div className="row-sub small">Opcional — se puede registrar más tarde.</div>
                  </div>
                </div>

                <div className="actions">
                  <button className="btn" onClick={guardar} disabled={guardando}>
                    {guardando ? "Guardando…" : "Guardar revisión"}
                  </button>
                  <button className="btn" onClick={imprimirFicha}>
                    Imprimir ficha
                  </button>

                  {/* Botón Matricular o Revocar según estado */}
                  {!(fila as any).matriculaActiva ? (
                    <button
                      className="btn btn--primary"
                      onClick={abrirConfirmacion}
                      disabled={!puedeMatricular || matriculando}
                      aria-disabled={!puedeMatricular || matriculando}
                    >
                      {matriculando ? "Matriculando…" : "Matricular"}
                    </button>
                  ) : (
                    <button
                      className="btn btn--danger"
                      onClick={abrirRevocacion}
                      disabled={matriculando}
                      aria-disabled={matriculando}
                    >
                      {matriculando ? "Revocando…" : "Revocar"}
                    </button>
                  )}
                </div>
              </section>

              {/* Historial / Bitácora */}
              <section className="card">
                <h4>Historial</h4>
                {audit.length === 0 ? (
                  <div className="muted small">Sin eventos aún.</div>
                ) : (
                  <ul className="timeline">
                    {audit.map((ev) => {
                      const t = formatFechaBonita(ev.ts);
                      return (
                        <li key={ev.id} className="timeline-item" style={{ marginBottom: 6 }}>
                          <span className="mono small">{t.label}</span>{" "}
                          — <strong>{ev.action}</strong>
                          {ev.actor?.email ? <> por <em>{ev.actor.email}</em></> : null}
                          {ev.reason ? <> — Motivo: {ev.reason}</> : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </td>
        </tr>
      )}

      {/* --------------------------- Área de impresión (PORTAL) --------------------------- */}
      {printing && printData &&
        createPortal(
          <FichaMatriculaPrint
            data={printData}
            docs={docs}
            cuenta={cuenta}
            escuela={{ nombre: "COLEGIO", nit: "", direccion: "", telefono: "", ciudad: "" }}
          />,
          document.body
        )}

      {/* Modales */}
      <ConfirmMatriculaDialog
        open={confirmOpen}
        nombreEstudiante={nombre}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmarMatricula}
        loading={matriculando}
      />
      <ConfirmRevocarDialog
        open={confirmRevocarOpen}
        nombreEstudiante={nombre}
        onCancel={() => setConfirmRevocarOpen(false)}
        onConfirm={confirmarRevocacion}
        loading={matriculando}
      />

      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export default EnrollmentRow;
