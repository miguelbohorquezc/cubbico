import { FieldItem } from "../ui/FieldItem";
import { toTelLink, toWhatsAppLink } from "../../lib/phone";
import { DEFAULT_CC } from "../../constants";

export function ApplicantCard({ fila }: { fila: any }) {
  const nombreCompleto = `${fila.nombres ?? ""} ${fila.apellidos ?? ""}`.trim();
  return (
    <section className="card" aria-label="Aspirante">
      <h4>Aspirante</h4>
      <ul className="list">
        <FieldItem k="Nombre" v={nombreCompleto || "—"} />
        <FieldItem k="Fecha nacimiento" v={fila.fechaNacimiento || "—"} />
        <FieldItem k="Lugar nacimiento" v={fila.lugarNacimiento || "—"} />
        <FieldItem k="Sexo" v={fila.sexo === "M" ? "Masculino" : fila.sexo === "F" ? "Femenino" : "—"} />
        <FieldItem k="Edad" v={`${fila.edadAnios || "—"} años, ${fila.edadMeses || "—"} meses`} />
        <FieldItem k="Dirección" v={fila.direccionResidencia || "—"} />
        <FieldItem k="Barrio" v={fila.barrioAspirante || "—"} />
        <FieldItem
          k="Teléfono casa"
          v={
            fila.telefonoCasa ? (
              <div className="phone">
                <a className="link" href={toTelLink(fila.telefonoCasa)}>{fila.telefonoCasa}</a>
                <span className="sep">·</span>
                <a className="wa" href={toWhatsAppLink(fila.telefonoCasa, nombreCompleto, DEFAULT_CC)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
            ) : "—"
          }
        />
        <FieldItem k="Religión" v={fila.religion || "—"} />
        <FieldItem k="Colegio procedencia" v={fila.colegioProcedencia || "—"} />
        <FieldItem k="Último grado" v={fila.ultimoGrado || "—"} />
      </ul>
    </section>
  );
}
