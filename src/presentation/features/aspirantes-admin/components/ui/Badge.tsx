import type { EstadoSeguimiento } from "../../types";
import { LABELS } from "../../constants";

export function Badge({ estado }: { estado: EstadoSeguimiento }) {
  return (
    <span className={`badge badge--${estado}`}><p>{LABELS[estado]}</p></span>
  );
}
