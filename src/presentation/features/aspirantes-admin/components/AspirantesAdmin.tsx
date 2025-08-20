import React from "react";
import "../styles/admin.css";

import { TabBar } from "./ui/TabBar";
import { FlagToggle } from "./ui/FlagToggle";

import { useAspirantesAdmin } from "../hooks/useAspirantesAdmin";
import { useMatriculasAdmin } from "../hooks/useMatriculasAdmin";

import { ApplicantsTable } from "./ApplicantsTable";
import { EnrollmentsTable } from "./EnrollmentsTable";

export default function AspirantesAdmin(){
  const [tab, setTab] = React.useState<"aspirantes"|"matriculas">("aspirantes");

  // Estado de Aspirantes
  const A = useAspirantesAdmin();
  // Estado de Matrículas
  const M = useMatriculasAdmin();

  const isA = tab === "aspirantes";
  const titulo = isA ? "Admisiones – Aspirantes" : "Admisiones – Matrículas";
  const sub = isA
    ? "Control y seguimiento de aspirantes."
    : "Revisión documental y contabilidad de matrículas.";

  const {
  cargando, error, filas,
  busqueda, setBusqueda,
  flagHabilitado, cambiarFlag, guardandoFlag,
  cambiarEstado,
  // 👇 añade estos tres
  anio, setAnio, aniosDisponibles
} = useAspirantesAdmin();


  return (
    <div className="admin-screen">
      <div className="admin-container">
        <header className="admin-header">

          <div>
            <h1>{titulo}</h1>
            <p className="muted">{sub}</p>
          </div>

          {/* Toggle anclado – cambia según tab */}
          
            {isA ? (
              <FlagToggle
                isOn={A.flagHabilitado}
                saving={A.guardandoFlag}
                label="FORMULARIO DE ASPIRANTES"
                onToggle={A.cambiarFlag}
              />
            ) : (
              <FlagToggle
                isOn={M.flagHabilitado}
                saving={M.guardandoFlag}
                label="FORMULARIO DE MATRÍCULA"
                onToggle={M.cambiarFlag}
              />
            )}

          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
              <label htmlFor="anioSel" className="small" style={{ fontWeight: 700 }}>Año</label>
              <select
                id="anioSel"
                className="select"
                value={anio === "all" ? "all" : String(anio)}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnio(v === "all" ? "all" : parseInt(v, 10));
                }}
                style={{ minWidth: 120 }}
                aria-label="Filtrar por año"
                title="Filtrar por año"
              >
                {/* Opción 'Todos' (opcional). Si no la quieres, quítala. */}
                <option value="all">Todos</option>
                {aniosDisponibles.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
          </div>

        </header>
        {/* Tabs */}
        <TabBar value={tab} onChange={setTab} />


        {/* Búsqueda */}
        <section className="toolbar">
          <input
            className="input search"
            placeholder={isA
              ? "Buscar aspirante por nombre, padre/madre, grupo o radicado…"
              : "Buscar matrícula por nombre, grado o radicado…"
            }
            value={isA ? A.busqueda : M.busqueda}
            onChange={(e)=> (isA ? A.setBusqueda(e.target.value) : M.setBusqueda(e.target.value))}
            aria-label="Buscar"
          />
        </section>

        {/* Listado */}
        {isA ? (
          A.cargando
            ? <div className="loader">Cargando…</div>
            : A.error
              ? <div className="alert alert--error">{A.error}</div>
              : <ApplicantsTable filas={A.filas} onCambiarEstado={A.cambiarEstado as any} />
        ) : (
          M.cargando
            ? <div className="loader">Cargando…</div>
            : M.error
              ? <div className="alert alert--error">{M.error}</div>
              : <EnrollmentsTable filas={M.filas} />
        )}
      </div>
    </div>
  );
}
