import React from "react";
import { useAspirantesAdmin } from "../hooks/useAspirantesAdmin";
import type { EstadoSeguimiento } from "../../apirantes/types/aspirantes";
import "../styles/admin.css";

const LABELS: Record<EstadoSeguimiento | "en_espera", string> = {
  en_espera: "En espera para revisión",
  en_revision: "En proceso de revisión",
  admitido: "Admitido",
  no_admitido: "No admitido",
  matricular: "Matricular",
};

const ORDEN_ESTADOS: EstadoSeguimiento[] = [
  "en_espera",
  "en_revision",
  "admitido",
  "no_admitido",
  "matricular",
] as any;

const MATRICULA_URL = "/matricula"; // TODO: ajusta cuando tengas el enlace real

// Ajusta el indicativo predeterminado si tu colegio está en otro país:
const DEFAULT_CC = "57"; // 🇨🇴 Colombia

export default function AspirantesAdmin() {
  const {
    cargando,
    error,
    filas,
    busqueda,
    setBusqueda,
    flagHabilitado,
    cambiarFlag,
    guardandoFlag,
    cambiarEstado,
  } = useAspirantesAdmin();

  return (
    <div className="admin-screen">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>Admisiones</h1>
            <p className="muted">Control y seguimiento de nuevos aspirantes.</p>
          </div>

          <div className="flag-toggle" role="group" aria-label="Estado del formulario público">
            <span className={`flag-dot ${flagHabilitado ? "on" : "off"}`} />
            <span className="flag-text">
              Formulario público: {flagHabilitado ? "Activado" : "Desactivado"}
            </span>
            <button
              className="btn btn--primary"
              disabled={guardandoFlag}
              onClick={() => cambiarFlag(!flagHabilitado)}
            >
              {guardandoFlag ? "Guardando..." : flagHabilitado ? "Desactivar" : "Activar"}
            </button>
          </div>
        </header>

        <section className="toolbar">
          <input
            className="input search"
            placeholder="Buscar por nombre, padre/madre, grupo o radicado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </section>

        {error && <div className="alert-error">{error}</div>}
        {cargando ? (
          <div className="loader">Cargando...</div>
        ) : (
          <TablaAspirantes filas={filas} onCambiarEstado={cambiarEstado} />
        )}
      </div>
    </div>
  );
}

function TablaAspirantes({
  filas,
  onCambiarEstado,
}: {
  filas: any[];
  onCambiarEstado: (id: string, estado: EstadoSeguimiento, motivo?: string) => Promise<void>;
}) {
  if (!filas.length) {
    return <div className="empty">No hay inscripciones todavía.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Radicado</th>
            <th>Fecha</th>
            <th>Aspirante</th>
            <th>Grupo</th>
            <th>Estado</th>
            <th className="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <Fila key={f.id} fila={f} onCambiarEstado={onCambiarEstado} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Fila({
  fila,
  onCambiarEstado,
}: {
  fila: any;
  onCambiarEstado: (id: string, estado: EstadoSeguimiento, motivo?: string) => Promise<void>;
}) {
  const [abierta, setAbierta] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const estadoActual: EstadoSeguimiento = (fila.estadoSeguimiento ?? "en_espera") as EstadoSeguimiento;
  const [estado, setEstado] = React.useState<EstadoSeguimiento>(estadoActual);
  const [motivo, setMotivo] = React.useState<string>(fila.noAdmitidoMotivo ?? "");

  React.useEffect(() => {
    setEstado(estadoActual);
    setMotivo(fila.noAdmitidoMotivo ?? "");
  }, [fila.estadoSeguimiento, fila.noAdmitidoMotivo]);

  async function guardar() {
    setGuardando(true);
    try {
      await onCambiarEstado(fila.id, estado, motivo);
    } finally {
      setGuardando(false);
    }
  }

  const nombreCompleto = `${fila.nombres ?? ""} ${fila.apellidos ?? ""}`.trim();
  const contactoRapido =
    fila.padre?.telefono || fila.madre?.telefono || fila.telefonoCasa || fila.recomendador?.telefono || "—";
  const fecha = formatFechaBonita(fila.creadoEn);

  return (
    <>
      <tr className={`row ${abierta ? "row--open" : ""}`}>
        <td className="mono">{fila.id}</td>
        <td className="nowrap">
          <time className="date" dateTime={fecha.dateTime}>{fecha.label}</time>
        </td>
        <td>
          <div className="strong">{nombreCompleto || "Sin nombre"}</div>
          <div className="muted small">{fila.colegioProcedencia ? `Col. procedencia: ${fila.colegioProcedencia}` : " "}</div>
        </td>
        <td className="nowrap">{fila.grupoFamiliarId || "—"}</td>
        <td>
          <span className={`badge badge--${estadoActual}`}><p>{LABELS[estadoActual]}</p></span>
        </td>
        <td className="th-actions">
          <button className="btn btn--ghost" onClick={() => setAbierta((v) => !v)}>
            {abierta ? "Ocultar" : "Ver"}
          </button>
        </td>
      </tr>

      {abierta && (
        <tr className="row-expand">
          <td colSpan={6}>
            <div className="expand">

              {/* Aspirante */}
              <section className="card">
                <h4>Aspirante</h4>
                <ul className="list">
                  <Item k="Nombre" v={nombreCompleto || "—"} />
                  <Item k="Fecha nacimiento" v={fila.fechaNacimiento || "—"} />
                  <Item k="Lugar nacimiento" v={fila.lugarNacimiento || "—"} />
                  <Item k="Sexo" v={fila.sexo === "M" ? "Masculino" : fila.sexo === "F" ? "Femenino" : "—"} />
                  <Item k="Edad" v={`${fila.edadAnios || "—"} años, ${fila.edadMeses || "—"} meses`} />
                  <Item k="Dirección" v={fila.direccionResidencia || "—"} />
                  <Item k="Barrio" v={fila.barrioAspirante || "—"} />
                  <Item
                    k="Teléfono casa"
                    v={<PhoneWithWA phone={fila.telefonoCasa} label="WhatsApp" defaultCC={DEFAULT_CC} name={nombreCompleto} />}
                  />
                  <Item k="Religión" v={fila.religion || "—"} />
                  <Item k="Colegio procedencia" v={fila.colegioProcedencia || "—"} />
                  <Item k="Último grado" v={fila.ultimoGrado || "—"} />
                </ul>
              </section>

              {/* Padre */}
              <section className="card">
                <h4>Padre</h4>
                <ul className="list">
                  <Item k="Nombre" v={fila.padre?.nombresApellidos || "—"} />
                  <Item k="Identificación" v={fila.padre?.numeroIdentificacion || "—"} />
                  <Item
                    k="Teléfono"
                    v={<PhoneWithWA phone={fila.padre?.telefono} label="WhatsApp" defaultCC={DEFAULT_CC} name={fila.padre?.nombresApellidos} />}
                  />
                  <Item
                    k="Email"
                    v={fila.padre?.email ? <a className="link" href={`mailto:${fila.padre.email}`}>{fila.padre.email}</a> : "—"}
                  />
                  <Item k="Dirección" v={fila.padre?.direccion || "—"} />
                  <Item k="Barrio" v={fila.padre?.barrio || "—"} />
                  <Item k="Empresa" v={fila.padre?.empresa || "—"} />
                  <Item k="Profesión" v={fila.padre?.profesion || "—"} />
                </ul>
              </section>

              {/* Madre */}
              <section className="card">
                <h4>Madre</h4>
                <ul className="list">
                  <Item k="Nombre" v={fila.madre?.nombresApellidos || "—"} />
                  <Item k="Identificación" v={fila.madre?.numeroIdentificacion || "—"} />
                  <Item
                    k="Teléfono"
                    v={<PhoneWithWA phone={fila.madre?.telefono} label="WhatsApp" defaultCC={DEFAULT_CC} name={fila.madre?.nombresApellidos} />}
                  />
                  <Item
                    k="Email"
                    v={fila.madre?.email ? <a className="link" href={`mailto:${fila.madre.email}`}>{fila.madre.email}</a> : "—"}
                  />
                  <Item k="Dirección" v={fila.madre?.direccion || "—"} />
                  <Item k="Barrio" v={fila.madre?.barrio || "—"} />
                  <Item k="Empresa" v={fila.madre?.empresa || "—"} />
                  <Item k="Profesión" v={fila.madre?.profesion || "—"} />
                </ul>
              </section>

              {/* Recomendador / Anexos */}
              <section className="card">
                <h4>Recomendador y anexos</h4>
                <ul className="list">
                  <Item k="Recomendó" v={fila.recomendador?.nombresApellidos || "—"} />
                  <Item k="Parentesco" v={fila.recomendador?.parentesco || "—"} />
                  <Item
                    k="Teléfono"
                    v={<PhoneWithWA phone={fila.recomendador?.telefono} label="WhatsApp" defaultCC={DEFAULT_CC} name={fila.recomendador?.nombresApellidos} />}
                  />
                  <Item k="Familiares en el colegio" v={fila.familiaresEnColegio || "—"} />
                </ul>
              </section>

              {/* Seguimiento */}
              <section className="card">
                <h4>Seguimiento</h4>
                <div className="grid grid--2">
                  <div>
                    <label className="label" htmlFor={`estado-${fila.id}`}>Estado</label>
                    <select
                      id={`estado-${fila.id}`}
                      className="select"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as EstadoSeguimiento)}
                    >
                      {ORDEN_ESTADOS.map((op) => (
                        <option key={op} value={op}>
                          {LABELS[op]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {estado === "no_admitido" && (
                    <div>
                      <label className="label" htmlFor={`motivo-${fila.id}`}>Motivo de no admisión</label>
                      <textarea
                        id={`motivo-${fila.id}`}
                        className="input"
                        rows={3}
                        placeholder="Describe brevemente el motivo…"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="actions">
                  <button className="btn btn--primary" disabled={guardando} onClick={guardar}>
                    {guardando ? "Guardando…" : "Guardar cambios"}
                  </button>

                  {estado === "matricular" && (
                    <a className="btn" href={MATRICULA_URL} target="_blank" rel="noopener noreferrer">
                      Ir al proceso de matrícula
                    </a>
                  )}
                </div>
              </section>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Item({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <li className="item">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </li>
  );
}

function PhoneWithWA({
  phone,
  label = "WhatsApp",
  defaultCC = DEFAULT_CC,
  name,
}: {
  phone?: string;
  label?: string;
  defaultCC?: string;
  name?: string;
}) {
  if (!phone) return <>—</>;
  const url = toWhatsAppLink(phone, name, defaultCC);
  const tel = toTelLink(phone);
  return (
    <div className="phone">
      <a className="link" href={tel}>{phone}</a>
      <span className="sep">·</span>
      <a className="wa" href={url} target="_blank" rel="noopener noreferrer" title="Abrir WhatsApp">
        <WaIcon /> {label}
      </a>
    </div>
  );
}

function toTelLink(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}

function toWhatsAppLink(raw: string, name?: string, defaultCC = DEFAULT_CC) {
  const digits = (raw || "").replace(/\D/g, "");
  // Si no trae indicativo y parece móvil colombiano (10 dígitos y comienza por 3), anteponer +57
  const withCC =
    digits.length === 10 && digits.startsWith("3")
      ? `${defaultCC}${digits}`
      : digits;
  const saludo = name ? `Hola ${name},` : "Hola,";
  const msg = `${saludo} te contacto desde el colegio respecto a la inscripción.`;
  return `https://wa.me/${withCC}?text=${encodeURIComponent(msg)}`;
}

function formatFechaBonita(v: any) {
  let d: Date | null = null;
  try {
    d = v?.toDate ? v.toDate() : typeof v === "number" ? new Date(v) : null;
  } catch {
    d = null;
  }
  if (!d || isNaN(d.getTime())) {
    return { label: "—", dateTime: "" };
  }
  const fecha = d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return { label: `${fecha} · ${hora}`, dateTime: d.toISOString() };
}

function WaIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
      <path d="M19.11 17.44a4.12 4.12 0 01-1.85-.48c-.29-.15-.63-.44-.9-.78-.26-.33-.56-.77-.58-.82s-.14-.22-.14-.22a1.47 1.47 0 01.03-1.37c.08-.14.2-.3.31-.44s.2-.25.27-.34.11-.15.13-.2.01-.1-.01-.16-.14-.34-.18-.45-.1-.24-.16-.4a2.34 2.34 0 00-.18-.34 1.07 1.07 0 00-.25-.27 1.05 1.05 0 00-.42-.18 1.91 1.91 0 00-.64.02 2.21 2.21 0 00-.71.27 2.46 2.46 0 00-.82.88 2.64 2.64 0 00-.24 1.08c0 .28.06.56.14.81.1.33.28.69.4.9.16.29.33.54.51.79a11.24 11.24 0 001.22 1.38 9.48 9.48 0 001.74 1.36 6.76 6.76 0 002.06.88 4.8 4.8 0 001.61.12 3.2 3.2 0 001.06-.3 2.59 2.59 0 001.13-.97c.17-.27.26-.55.31-.8a1.69 1.69 0 00-.24-1.05c-.09-.15-.22-.27-.33-.38l-.21-.2a.5.5 0 00-.38-.12h-.01l-.66.11c-.18.03-.38.06-.52.08-.15.02-.28.04-.39.05z"/>
    </svg>
  );
}
