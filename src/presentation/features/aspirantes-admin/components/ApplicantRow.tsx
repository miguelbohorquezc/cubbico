import React from "react";
import type { EstadoSeguimiento } from "../types";
import { Badge } from "./ui/Badge";
import { formatFechaBonita } from "../lib/date";
import { ApplicantCard } from "./expand/ApplicantCard";
import { ParentCard } from "./expand/ParentCard";
import { RecommenderCard } from "./expand/RecommenderCard";
import { FollowUpCard } from "./expand/FollowUpCard";
import { Button } from "./ui/Button";

type Props = {
  fila: any;
  onCambiarEstado: (id: string, estado: EstadoSeguimiento, motivo?: string) => Promise<void>;
};

export function ApplicantRow({ fila, onCambiarEstado }: Props) {
  const [abierta, setAbierta] = React.useState(false);
  const estadoActual: EstadoSeguimiento = (fila.estadoSeguimiento ?? "en_espera") as EstadoSeguimiento;
  const fecha = formatFechaBonita(fila.creadoEn);
  const nombreCompleto = `${fila.nombres ?? ""} ${fila.apellidos ?? ""}`.trim();

  return (
    <>
      <tr className={`row ${abierta ? "row--open" : ""}`}>
        <td className="mono">{fila.id}</td>
        <td className="nowrap"><time className="date" dateTime={fecha.dateTime}>{fecha.label}</time></td>
        <td>
          <div className="strong">{nombreCompleto || "Sin nombre"}</div>
          <div className="muted small">{fila.colegioProcedencia ? `Col. procedencia: ${fila.colegioProcedencia}` : " "}</div>
        </td>
        <td className="nowrap">{fila.grupoFamiliarId || "—"}</td>
        <td><Badge estado={estadoActual} /></td>
        <td className="th-actions">
          <Button onClick={()=>setAbierta(v=>!v)}>{abierta ? "Ocultar" : "Ver"}</Button>
        </td>
      </tr>

      {abierta && (
        <tr className="row-expand">
          <td colSpan={6}>
            <div className="expand">
              <ApplicantCard fila={fila} />
              <ParentCard title="Padre" data={fila.padre} />
              <ParentCard title="Madre" data={fila.madre} />
              <RecommenderCard fila={fila} />
              <FollowUpCard
                fila={fila}
                estadoInicial={estadoActual}
                motivoInicial={fila.noAdmitidoMotivo}
                onCambiarEstado={onCambiarEstado}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
