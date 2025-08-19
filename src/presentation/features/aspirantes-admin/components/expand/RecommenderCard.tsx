import { FieldItem } from "../ui/FieldItem";
import { toTelLink, toWhatsAppLink } from "../../lib/phone";
import { DEFAULT_CC } from "../../constants";

export function RecommenderCard({ fila }: { fila: any }) {
  return (
    <section className="card" aria-label="Recomendador y anexos">
      <h4>Recomendador y anexos</h4>
      <ul className="list">
        <FieldItem k="Recomendó" v={fila.recomendador?.nombresApellidos || "—"} />
        <FieldItem k="Parentesco" v={fila.recomendador?.parentesco || "—"} />
        <FieldItem
          k="Teléfono"
          v={
            fila.recomendador?.telefono ? (
              <div className="phone">
                <a className="link" href={toTelLink(fila.recomendador.telefono)}>{fila.recomendador.telefono}</a>
                <span className="sep">·</span>
                <a className="wa" href={toWhatsAppLink(fila.recomendador.telefono, fila.recomendador?.nombresApellidos, DEFAULT_CC)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
            ) : "—"
          }
        />
        <FieldItem k="Familiares en el colegio" v={fila.familiaresEnColegio || "—"} />
      </ul>
    </section>
  );
}
