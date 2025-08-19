import React from "react";
import type { MatriculaRow, DocsFisicos, Contabilidad } from "../../matriculas.types";

export default function FichaMatriculaPrint({
  data,
  docs,
  cuenta,
  membrete = true,
  size = "legal",
  escuela = { nombre: "COLEGIO", nit: "", direccion: "", telefono: "", ciudad: "" },
  logoUrl,
}: {
  data: MatriculaRow & Record<string, any>;
  docs: DocsFisicos;
  cuenta: Contabilidad;
  membrete?: boolean;
  size?: "legal" | "a4";
  escuela?: { nombre: string; nit?: string; direccion?: string; telefono?: string; ciudad?: string };
  logoUrl?: string;
}) {
  const S = data?.estudiante ?? ({} as any);
  const M = data?.madre ?? ({} as any);
  const P = data?.padre ?? ({} as any);

  const up = (v: any) => (v == null || v === "" ? "—" : String(v).toUpperCase());
  const lo = (v: any) => (v == null || v === "" ? "—" : String(v));
  const idTipo = up(S?.tipoIdentificacion?.replace("_", " "));
  const esPre = ["walkers", "nursery", "prekinder", "kinder", "transition"].includes(data.grado);
  const check = (ok?: boolean) => (ok ? "☑" : "☐");

  const created = (() => {
    let d: Date | null = null;
    try {
      d = data?.creadoEn?.toDate ? data.creadoEn.toDate() : typeof data?.creadoEn === "number" ? new Date(data.creadoEn) : null;
    } catch { d = null; }
    return d ? d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase() : "—";
  })();

  return (
    <div className="print-area">
      <div className={`print-sheet pf-root ${membrete ? "pf--membrete" : "pf--con-header"} ${size === "legal" ? "pf--size-legal" : "pf--size-a4"}`}>
        {!membrete && (
          <header className="pf-head">
            <div className="pf-head__left">
              {logoUrl ? <img className="pf-logo" src={logoUrl} alt="Logo" /> : <div className="pf-logo--ph" />}
            </div>
            <div className="pf-head__center">
              <div className="pf-school">{up(escuela.nombre)}</div>
              <div className="pf-meta">
                {up(escuela.ciudad)}{escuela.nit ? ` · NIT ${up(escuela.nit)}` : ""}{escuela.direccion ? ` · ${up(escuela.direccion)}` : ""}{escuela.telefono ? ` · TEL ${up(escuela.telefono)}` : ""}
              </div>
              <div className="pf-title">FICHA DE MATRÍCULA</div>
            </div>
            <div className="pf-head__right">
              <div className="pf-box">
                <div><b>RADICADO</b> {up(data.id)}</div>
                <div><b>FECHA</b> {created}</div>
                <div><b>GRADO</b> {up(data.grado)}</div>
              </div>
            </div>
          </header>
        )}

        {membrete && (
          <div className="pf-strip">
            <div className="pf-strip__item"><b>RADICADO</b> {up(data.id)}</div>
            <div className="pf-strip__item"><b>FECHA</b> {created}</div>
            <div className="pf-strip__item"><b>GRADO</b> {up(data.grado)}</div>
          </div>
        )}

        {/* 1. ANTECEDENTES PERSONALES */}
        <section className="pf-section">
          <h3 className="pf-section__title">ANTECEDENTES PERSONALES DEL ESTUDIANTE</h3>
          <div className="pf-grid pf-col-2">
            <dl className="pf-kv"><dt>APELLIDOS</dt><dd>{up(`${lo(S.primerApellido)} ${lo(S.segundoApellido)}`)}</dd></dl>
            <dl className="pf-kv"><dt>NOMBRES</dt><dd>{up(lo(S.nombres))}</dd></dl>
            <dl className="pf-kv"><dt>TIPO DE IDENTIFICACIÓN</dt><dd>{idTipo}</dd></dl>
            <dl className="pf-kv"><dt>NÚMERO</dt><dd>{up(lo(S.numeroIdentificacion))}</dd></dl>
            <dl className="pf-kv"><dt>FECHA DE NACIMIENTO</dt><dd>{up(lo(S.fechaNacimiento))}</dd></dl>
            <dl className="pf-kv"><dt>LUGAR DE NACIMIENTO</dt><dd>{up(lo(S.lugarNacimiento))}</dd></dl>
            <dl className="pf-kv"><dt>EDAD (AÑOS)</dt><dd>{up(lo(S.edadAnos))}</dd></dl>
            <dl className="pf-kv pf-span-2"><dt>DIRECCIÓN Y TELÉFONO</dt><dd>{up(lo(S.direccion))} · {up(lo(S.telefono))}</dd></dl>
          </div>
        </section>

        {/* 2. ANTECEDENTES ESCOLARES Y SOCIALES */}
        <section className="pf-section">
          <h3 className="pf-section__title">ANTECEDENTES ESCOLARES Y SOCIALES</h3>
          <div className="pf-grid pf-col-3">
            <dl className="pf-kv"><dt>N° DE MATRÍCULA</dt><dd>{up(data.id)}</dd></dl>
            <dl className="pf-kv"><dt>GRADO / CURSO</dt><dd>{up(data.grado)}</dd></dl>
            <dl className="pf-kv"><dt>FECHA DE MATRÍCULA</dt><dd>{created}</dd></dl>
            <dl className="pf-kv pf-span-3"><dt>COLEGIO / JARDÍN DE PROCEDENCIA</dt><dd>{up(lo(S.colegioAnterior))}</dd></dl>
          </div>
        </section>

        {/* 3. PADRES Y ACUDIENTE */}
        <section className="pf-section">
          <h3 className="pf-section__title">DATOS DE PADRES Y ACUDIENTE</h3>
          <div className="pf-grid pf-col-3">
            <div className="pf-card">
              <div className="pf-card__title">MADRE</div>
              <div className="pf-grid pf-col-2">
                <dl className="pf-kv pf-span-2"><dt>NOMBRE COMPLETO</dt><dd>{up(lo(M.nombreCompleto))}</dd></dl>
                <dl className="pf-kv"><dt>FECHA NAC.</dt><dd>{up(lo(M.fechaNacimiento))}</dd></dl>
                <dl className="pf-kv"><dt>CIUDAD</dt><dd>{up(lo(M.ciudad))}</dd></dl>
                <dl className="pf-kv"><dt>EMPRESA</dt><dd>{up(lo(M.empresa))}</dd></dl>
                <dl className="pf-kv"><dt>CARGO</dt><dd>{up(lo(M.cargoActual))}</dd></dl>
                <dl className="pf-kv"><dt>CELULAR</dt><dd>{up(lo(M.celular))}</dd></dl>
                <dl className="pf-kv"><dt>CÉDULA</dt><dd>{up(lo(M.cedula))}</dd></dl>
                <dl className="pf-kv pf-span-2"><dt>EMAIL</dt><dd className="pf-lower">{lo(M.email)}</dd></dl>
              </div>
            </div>

            <div className="pf-card">
              <div className="pf-card__title">PADRE</div>
              <div className="pf-grid pf-col-2">
                <dl className="pf-kv pf-span-2"><dt>NOMBRE COMPLETO</dt><dd>{up(lo(P.nombreCompleto))}</dd></dl>
                <dl className="pf-kv"><dt>FECHA NAC.</dt><dd>{up(lo(P.fechaNacimiento))}</dd></dl>
                <dl className="pf-kv"><dt>CIUDAD</dt><dd>{up(lo(P.ciudad))}</dd></dl>
                <dl className="pf-kv"><dt>EMPRESA</dt><dd>{up(lo(P.empresa))}</dd></dl>
                <dl className="pf-kv"><dt>CARGO</dt><dd>{up(lo(P.cargoActual))}</dd></dl>
                <dl className="pf-kv"><dt>CELULAR</dt><dd>{up(lo(P.celular))}</dd></dl>
                <dl className="pf-kv"><dt>CÉDULA</dt><dd>{up(lo(P.cedula))}</dd></dl>
                <dl className="pf-kv pf-span-2"><dt>EMAIL</dt><dd className="pf-lower">{lo(P.email)}</dd></dl>
              </div>
            </div>

            <div className="pf-card">
              <div className="pf-card__title">ACUDIENTE / RESPONSABLE</div>
              <div className="pf-grid pf-col-1">
                <dl className="pf-kv"><dt>RESPONSABLE DE COSTOS</dt><dd>{up(lo(data.responsableCostos))}</dd></dl>
                <dl className="pf-kv"><dt>COMPROMISO: PAGO PRIMEROS 10 DÍAS</dt><dd>{up(data.compromisoPagoPrimerosDiezDias === "si" ? "SÍ" : data.compromisoPagoPrimerosDiezDias === "no" ? "NO" : "—")}</dd></dl>
                <dl className="pf-kv"><dt>ACEPTA TÉRMINOS</dt><dd>{up(!!data.aceptaTerminos ? "SÍ" : "NO")}</dd></dl>
              </div>
            </div>
          </div>
        </section>

        {/* 4. REVISIÓN DOCUMENTAL */}
        <section className="pf-section">
          <h3 className="pf-section__title">REVISIÓN DOCUMENTAL Y CONTABILIDAD</h3>
          <div className="pf-grid pf-col-2">
            <div className="pf-card">
              <div className="pf-card__title">DOCUMENTOS ENTREGADOS</div>
              <ul className="pf-list">
                <li>{check(docs.copiaReg)} COPIA REGISTRO CIVIL O TI</li>
                <li>{check(docs.certMedico)} CERTIFICADO MÉDICO</li>
                <li>{check(docs.certEstudios)} CERTIFICADO DE ESTUDIOS</li>
                <li>{check(docs.carnetVacunas)} COPIA CARNET DE VACUNAS</li>
                <li>{check(docs.fotos3)} 3 FOTOGRAFÍAS</li>
                <li>{check(docs.certEPS)} CERTIFICADO DE EPS</li>
                <li>{check(docs.certLaboral)} CERTIFICADO LABORAL</li>
                <li>{check(docs.retiroSimat)} RETIRO SIMAT</li>
                <li>{check(docs.fotoFamiliarPre || !esPre)} FOTOGRAFÍA FAMILIAR (PREESCOLAR)</li>
              </ul>
            </div>
            <div className="pf-card">
              <div className="pf-card__title">CONTABILIDAD</div>
              <ul className="pf-list">
                <li>{check(cuenta.contratosPagare)} CONTRATOS Y PAGARÉ (REQUERIDO)</li>
                <li>{check(cuenta.pagoMatriculaYCupo)} PAGO MATRÍCULA Y CUPO (OPCIONAL)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. OBSERVACIONES */}
        <section className="pf-section">
          <h3 className="pf-section__title">OBSERVACIONES</h3>
          <div className="pf-notes" />
        </section>

        {/* 6. FIRMAS */}
        <section className="pf-section">
          <h3 className="pf-section__title">FIRMAS</h3>
          <div className="pf-signs pf-signs--4">
            <div className="pf-sign">
              <div className="pf-line" />
              <span>FIRMA MADRE</span>
              <div className="pf-minikv"><label>Nombre:</label><div className="pf-blankline" /></div>
              <div className="pf-minikv"><label>C.C.:</label><div className="pf-blankline" /></div>
            </div>
            <div className="pf-sign">
              <div className="pf-line" />
              <span>FIRMA PADRE</span>
              <div className="pf-minikv"><label>Nombre:</label><div className="pf-blankline" /></div>
              <div className="pf-minikv"><label>C.C.:</label><div className="pf-blankline" /></div>
            </div>
            <div className="pf-sign">
              <div className="pf-line" />
              <span>FIRMA ACUDIENTE</span>
              <div className="pf-minikv"><label>Nombre:</label><div className="pf-blankline" /></div>
              <div className="pf-minikv"><label>C.C.:</label><div className="pf-blankline" /></div>
            </div>
            <div className="pf-sign">
              <div className="pf-line" />
              <span>FIRMA ESTUDIANTE</span>
              <div className="pf-minikv"><label>Nombre:</label><div className="pf-blankline" /></div>
              <div className="pf-minikv"><label>ID:</label><div className="pf-blankline" /></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
