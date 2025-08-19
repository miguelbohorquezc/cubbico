import React from "react";
import { EnrollmentRow } from "./EnrollmentRow";

export function EnrollmentsTable({ filas }: { filas:any[] }){
  if(!filas.length) return <div className="empty">No hay matrículas todavía.</div>;
  return (
    <div className="table-wrap">
      <table className="table" role="grid">
        <thead>
          <tr>
            <th>Radicado</th>
            <th>Fecha</th>
            <th>Estudiante</th>
            <th>Grado</th>
            <th>Estado</th>
            <th className="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(f => <EnrollmentRow key={f.id} fila={f} />)}
        </tbody>
      </table>
    </div>
  );
}
