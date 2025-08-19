import { FieldItem } from "../ui/FieldItem";
import { toTelLink, toWhatsAppLink } from "../../lib/phone";
import { DEFAULT_CC } from "../../constants";

export function ParentCard({ title, data }: { title: "Padre" | "Madre"; data?: any }) {
  return (
    <section className="card" aria-label={title}>
      <h4>{title}</h4>
      <ul className="list">
        <FieldItem k="Nombre" v={data?.nombresApellidos || "—"} />
        <FieldItem k="Identificación" v={data?.numeroIdentificacion || "—"} />
        <FieldItem
          k="Teléfono"
          v={
            data?.telefono ? (
              <div className="phone">
                <a className="link" href={toTelLink(data.telefono)}>{data.telefono}</a>
                <span className="sep">·</span>
                <a className="wa" href={toWhatsAppLink(data.telefono, data?.nombresApellidos, DEFAULT_CC)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
            ) : "—"
          }
        />
        <FieldItem k="Email" v={data?.email ? <a className="link" href={`mailto:${data.email}`}>{data.email}</a> : "—"} />
        <FieldItem k="Dirección" v={data?.direccion || "—"} />
        <FieldItem k="Barrio" v={data?.barrio || "—"} />
        <FieldItem k="Empresa" v={data?.empresa || "—"} />
        <FieldItem k="Profesión" v={data?.profesion || "—"} />
      </ul>
    </section>
  );
}
