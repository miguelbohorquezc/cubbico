import React from "react";
import { createPortal } from "react-dom";
import type { MatriculaRow, DocsFisicos, Contabilidad } from "../matriculas.types";
import {
  actualizarRevisionMatricula,
  obtenerMatriculaPorId,
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

  if (puedeMatricular) return { cls: "badge badge--matricular", txt: "Listo para matricular" };
  if (requiredDocsComplete) return { cls: "badge badge--admitido", txt: "Documentos completos" };
  return { cls: "badge badge--en_revision", txt: "En revisión" };
}

/* ============================= Componente ============================= */
export function EnrollmentRow({ fila }: { fila: MatriculaRow }) {
  const [abierta, setAbierta] = React.useState(false);

  const fecha = formatFechaBonita(fila.creadoEn);
  const nombre = `${fila.estudiante?.primerApellido ?? ""} ${
    fila.estudiante?.segundoApellido ?? ""
  } ${fila.estudiante?.nombres ?? ""}`.trim();

  const [docs, setDocs] = React.useState<DocsFisicos>(fila.docs ?? {});
  const [cuenta, setCuenta] = React.useState<Contabilidad>(fila.cuenta ?? {});
  const [guardando, setGuardando] = React.useState(false);

  const badge = computeBadging(fila, docs, cuenta);
  const puedeMatricular = badge.cls.includes("matricular");

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
    // 1) Traer documento completo (por si hay más campos en Firestore)
    const full = await obtenerMatriculaPorId(fila.id);
    setPrintData((full ?? fila) as MatriculaRow);
    setPrinting(true);

    // 2) Esperar a que el Portal monte en <body> y entonces imprimir.
    // requestAnimationFrame doble garantiza layout antes del print.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
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
          <span className={badge.cls}>
            <p>{badge.txt}</p>
          </span>
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
              {/* Header resumen */}
              <section className="card card--header" aria-label="Resumen">
                <div className="header-wrap">
                  <div className="upper">{nombre || "—"}</div>
                  <span className={badge.cls}>
                    <p>{badge.txt}</p>
                  </span>
                </div>
              </section>

              {/* Estudiante */}
              <section className="card">
                <h4>Estudiante</h4>
                <ul className="list">
                  <li className="item">
                    <div className="k">Nombre</div>
                    <div className="v">{nombre || "—"}</div>
                  </li>
                  <li className="item">
                    <div className="k">Identificación</div>
                    <div className="v">
                      {fila.estudiante?.tipoIdentificacion?.replace("_", " ").toUpperCase()} —{" "}
                      {fila.estudiante?.numeroIdentificacion || "—"}
                    </div>
                  </li>
                  <li className="item">
                    <div className="k">Nacimiento</div>
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
                </ul>
              </section>

              {/* Documentos físicos */}
              <section className="card">
                <h4>Documentos físicos</h4>
                <ul className="checklist checklist--grid">
                  <li className="checkcard">
                    <input
                      type="checkbox"
                      checked={!!docs.copiaReg}
                      onChange={onDoc("copiaReg")}
                    />
                    <span>Copia registro civil o TI</span>
                  </li>
                  <li className="checkcard">
                    <input
                      type="checkbox"
                      checked={!!docs.certMedico}
                      onChange={onDoc("certMedico")}
                    />
                    <span>Certificado médico</span>
                  </li>
                  <li className="checkcard">
                    <input
                      type="checkbox"
                      checked={!!docs.certEstudios}
                      onChange={onDoc("certEstudios")}
                    />
                    <span>Certificado de estudios</span>
                  </li>
                  <li className="checkcard">
                    <input
                      type="checkbox"
                      checked={!!docs.carnetVacunas}
                      onChange={onDoc("carnetVacunas")}
                    />
                    <span>Copia carnet de vacunas</span>
                  </li>
                  <li className="checkcard">
                    <input type="checkbox" checked={!!docs.fotos3} onChange={onDoc("fotos3")} />
                    <span>3 fotografías</span>
                  </li>
                  <li className="checkcard">
                    <input type="checkbox" checked={!!docs.certEPS} onChange={onDoc("certEPS")} />
                    <span>Certificado de EPS</span>
                  </li>
                  <li className="checkcard">
                    <input
                      type="checkbox"
                      checked={!!docs.certLaboral}
                      onChange={onDoc("certLaboral")}
                    />
                    <span>Certificado laboral</span>
                  </li>
                  <li className="checkcard">
                    <input
                      type="checkbox"
                      checked={!!docs.retiroSimat}
                      onChange={onDoc("retiroSimat")}
                    />
                    <span>Retiro SIMAT</span>
                  </li>
                  <li className="checkcard">
                    <input
                      type="checkbox"
                      checked={!!docs.fotoFamiliarPre}
                      onChange={onDoc("fotoFamiliarPre")}
                    />
                    <span>Fotografía familiar (Preescolar)</span>
                  </li>
                </ul>
              </section>

              {/* Contabilidad */}
              <section className="card">
                <h4>Contabilidad</h4>
                <div className="checkrow">
                  <input
                    type="checkbox"
                    checked={!!cuenta.contratosPagare}
                    onChange={onCta("contratosPagare")}
                  />
                  <div>
                    <div className="row-title">Contratos y pagaré</div>
                    <div className="row-sub small">Requerido para habilitar matrícula.</div>
                  </div>
                </div>
                <div className="checkrow">
                  <input
                    type="checkbox"
                    checked={!!cuenta.pagoMatriculaYCupo}
                    onChange={onCta("pagoMatriculaYCupo")}
                  />
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
                  <button className="btn btn--primary" disabled={!puedeMatricular}>
                    Matricular
                  </button>
                </div>
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
            // logoUrl="/logo.png" // opcional
          />,
          document.body
        )}
    </>
  );
}

export default EnrollmentRow;
