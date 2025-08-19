import type { EstadoSeguimiento } from "../types";
import { ApplicantRow } from "./ApplicantRow";

type Props = {
  filas: any[];
  onCambiarEstado: (id: string, estado: EstadoSeguimiento, motivo?: string) => Promise<void>;
};

export function ApplicantsTable({ filas, onCambiarEstado }: Props) {
  if (!filas.length) return <div className="empty">No hay inscripciones todavía.</div>;
  return (
    <div className="table-wrap">
      <table className="table" role="grid">
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
          {filas.map(f => (
            <ApplicantRow key={f.id} fila={f} onCambiarEstado={onCambiarEstado} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
