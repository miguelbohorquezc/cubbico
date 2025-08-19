import React from "react";
import { ORDEN_ESTADOS } from "../../constants";
import type { EstadoSeguimiento } from "../../types";
import { Button } from "../ui/Button";

type Props = {
  fila: any;
  estadoInicial: EstadoSeguimiento;
  motivoInicial?: string;
  onCambiarEstado: (id: string, estado: EstadoSeguimiento, motivo?: string) => Promise<void>;
};

export function FollowUpCard({ fila, estadoInicial, motivoInicial, onCambiarEstado }: Props) {
  const [estado, setEstado] = React.useState<EstadoSeguimiento>(estadoInicial);
  const [motivo, setMotivo] = React.useState<string>(motivoInicial ?? "");
  const [guardando, setGuardando] = React.useState(false);

  React.useEffect(() => { setEstado(estadoInicial); setMotivo(motivoInicial ?? ""); }, [estadoInicial, motivoInicial]);

  async function guardar() {
    setGuardando(true);
    try { await onCambiarEstado(fila.id, estado, motivo); }
    finally { setGuardando(false); }
  }

  return (
    <section className="card" aria-label="Seguimiento">
      <h4>Seguimiento</h4>
      <div className="grid grid--2">
        <div>
          <label className="label" htmlFor={`estado-${fila.id}`}>Estado</label>
          <select id={`estado-${fila.id}`} className="select" value={estado} onChange={(e)=>setEstado(e.target.value as EstadoSeguimiento)}>
            {ORDEN_ESTADOS.map(op => <option key={op} value={op}>{op.replace("_"," ")}</option>)}
          </select>
        </div>

        {estado === "no_admitido" && (
          <div>
            <label className="label" htmlFor={`motivo-${fila.id}`}>Motivo de no admisión</label>
            <textarea id={`motivo-${fila.id}`} className="input" rows={3} placeholder="Describe brevemente el motivo…" value={motivo} onChange={(e)=>setMotivo(e.target.value)} />
          </div>
        )}
      </div>

      <div className="actions">
        <Button variant="primary" disabled={guardando} onClick={guardar}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </Button>
        {/* Eliminado botón de “Ir al proceso de matrícula” como solicitaste */}
      </div>
    </section>
  );
}
