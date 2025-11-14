import React from "react";
import "../styles/admin.css";

import { TabBar } from "./ui/TabBar";
import { FlagToggle } from "./ui/FlagToggle";

import { useAspirantesAdmin } from "../hooks/useAspirantesAdmin";
import { useMatriculasAdmin } from "../hooks/useMatriculasAdmin";

import { ApplicantsTable } from "./ApplicantsTable";
import { EnrollmentsTable } from "./EnrollmentsTable";

export default function AdmisionesAdmin(){
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

  return (
    <div className="admin-screen">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>{titulo}</h1>
            <p className="muted">{sub}</p>
          </div>

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
          
        </header>
        
        <TabBar value={tab}
        //@ts-ignore
          onChange={setTab} />

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
