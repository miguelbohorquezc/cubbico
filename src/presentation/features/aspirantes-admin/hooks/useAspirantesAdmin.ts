import { useEffect, useMemo, useState } from "react";
import {
  escucharAspirantes,
  actualizarEstadoSeguimiento,
  obtenerFlagAspirantesHabilitado,
  setFlagAspirantesHabilitado
} from "../services/aspirantesAdmin.service";
import type { EstadoSeguimiento, FilaAspirante } from "../types";

export function useAspirantesAdmin() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filas, setFilas] = useState<FilaAspirante[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [flagHabilitado, setFlagHabilitado] = useState<boolean>(false);
  const [guardandoFlag, setGuardandoFlag] = useState(false);

  useEffect(() => {
    const stop = escucharAspirantes((rows) => {
      setFilas(rows as FilaAspirante[]);
      setCargando(false);
    }, (e) => {
      setError("No se pudo cargar la lista.");
      setCargando(false);
      console.error(e);
    });
    return () => stop();
  }, []);

  useEffect(() => {
    (async () => {
      try { setFlagHabilitado(await obtenerFlagAspirantesHabilitado()); }
      catch (e) { console.error(e); }
    })();
  }, []);

  const filasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter(f =>
      `${f.nombres ?? ""} ${f.apellidos ?? ""}`.toLowerCase().includes(q) ||
      (f.padre?.nombresApellidos ?? "").toLowerCase().includes(q) ||
      (f.madre?.nombresApellidos ?? "").toLowerCase().includes(q) ||
      (f.grupoFamiliarId ?? "").toLowerCase().includes(q) ||
      (f.id ?? "").toLowerCase().includes(q)
    );
  }, [filas, busqueda]);

  async function cambiarEstado(id: string, estado: EstadoSeguimiento, motivo?: string) {
    await actualizarEstadoSeguimiento(id, estado, motivo);
  }

  async function cambiarFlag(habilitado: boolean) {
    setGuardandoFlag(true);
    try {
      await setFlagAspirantesHabilitado(habilitado);
      setFlagHabilitado(habilitado);
    } finally {
      setGuardandoFlag(false);
    }
  }

  return {
    cargando, error, filas: filasFiltradas, busqueda, setBusqueda,
    flagHabilitado, cambiarFlag, guardandoFlag, cambiarEstado
  };
}
