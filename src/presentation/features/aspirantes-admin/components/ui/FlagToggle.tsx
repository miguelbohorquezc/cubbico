import React from "react";

export function FlagToggle({
  isOn, saving, label, onToggle
}:{
  isOn: boolean; saving?: boolean; label: string; onToggle: (next:boolean)=>void;
}) {
  return (
    <div className="flag-toggle" role="group" aria-label={label}>
      <span className={`flag-dot ${isOn ? "on" : "off"}`} />
      <span className="flag-text">{label}: {isOn ? "ACTIVADO" : "DESACTIVADO"}</span>
      <button className="btn btn--primary" disabled={!!saving} onClick={()=>onToggle(!isOn)}>
        {saving ? "Guardando..." : isOn ? "Desactivar" : "Activar"}
      </button>
    </div>
  );
}
