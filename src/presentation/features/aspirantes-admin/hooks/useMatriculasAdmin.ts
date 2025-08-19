import { useEffect, useMemo, useState } from "react";
import {
  escucharMatriculas,
  actualizarRevisionMatricula,
  obtenerFlagMatriculasHabilitado,
  setFlagMatriculasHabilitado
} from "../services/matriculasAdmin.service";
import type { MatriculaRow, DocsFisicos, Contabilidad } from "../matriculas.types";

export function useMatriculasAdmin(){
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [filas, setFilas] = useState<MatriculaRow[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [flagHabilitado, setFlagHabilitado] = useState(false);
  const [guardandoFlag, setGuardandoFlag] = useState(false);

  useEffect(() => {
    const stop = escucharMatriculas(
      (rows)=>{ setFilas(rows as MatriculaRow[]); setCargando(false); },
      (e)=>{ setError("No se pudo cargar matrícula."); setCargando(false); console.error(e); }
    );
    return () => stop();
  }, []);

  useEffect(() => {
    (async()=>{ try{ setFlagHabilitado(await obtenerFlagMatriculasHabilitado()); } catch(e){ console.error(e);} })();
  }, []);

  const filasFiltradas = useMemo(()=>{
    const q = busqueda.trim().toUpperCase();
    if(!q) return filas;
    return filas.filter(f=>{
      const nom = `${f.estudiante?.primerApellido ?? ""} ${f.estudiante?.segundoApellido ?? ""} ${f.estudiante?.nombres ?? ""}`.toUpperCase();
      return nom.includes(q) || (f.id ?? "").toUpperCase().includes(q) || (f.grado ?? "").toUpperCase().includes(q);
    });
  }, [filas, busqueda]);

  async function guardarRevision(id:string, docs:DocsFisicos, cuenta:Contabilidad){
    await actualizarRevisionMatricula(id, docs, cuenta);
  }

  async function cambiarFlag(habilitado:boolean){
    setGuardandoFlag(true);
    try{ await setFlagMatriculasHabilitado(habilitado); setFlagHabilitado(habilitado); }
    finally{ setGuardandoFlag(false); }
  }

  return {
    cargando, error, filas:filasFiltradas, busqueda, setBusqueda,
    flagHabilitado, guardandoFlag, cambiarFlag, guardarRevision
  };
}
