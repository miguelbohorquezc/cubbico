import { useEffect, useMemo, useState } from "react";
import {
  escucharAspirantes,
  actualizarEstadoSeguimiento,
  obtenerFlagAspirantesHabilitado,
  setFlagAspirantesHabilitado
} from "../services/aspirantesAdmin.service";
import type { EstadoSeguimiento } from "../../apirantes/types/aspirantes";
import { getUTCYear } from "../utils/dates";

export interface FilaAspirante {
  id: string;
  creadoEn?: any;
  nombres: string;
  apellidos: string;
  colegioProcedencia?: string;
  ultimoGrado?: string;
  padre?: { nombresApellidos?: string; telefono?: string; email?: string };
  madre?: { nombresApellidos?: string; telefono?: string; email?: string };
  estadoSeguimiento?: EstadoSeguimiento | null;
  noAdmitidoMotivo?: string | null;
  grupoFamiliarId?: string | null;
  [k: string]: any;
}

export function useAspirantesAdmin() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filasRaw, setFilasRaw] = useState<FilaAspirante[]>([]);
  const [busqueda, setBusqueda] = useState("");

  // --------- UI: Filtro por AÑO (solo UI) ----------
  const currentYear = new Date().getUTCFullYear();
  const [anio, setAnio] = useState<number | "all">(currentYear);

  // Flag formulario público
  const [flagHabilitado, setFlagHabilitado] = useState<boolean>(false);
  const [guardandoFlag, setGuardandoFlag] = useState(false);

  // Listener original (SIN cambios ni filtros en Firestore)
  useEffect(() => {
    const stop = escucharAspirantes((rows) => {
      setFilasRaw(rows as FilaAspirante[]);
      setCargando(false);
    }, (e) => {
      console.error(e);
      setError("No se pudo cargar la lista.");
      setCargando(false);
    });
    return () => stop();
  }, []);

  // Cargar flag del formulario
  useEffect(() => {
    (async () => {
      try {
        const enabled = await obtenerFlagAspirantesHabilitado();
        setFlagHabilitado(enabled);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Derivar años disponibles desde los datos ya recibidos (sin lecturas nuevas)
  const aniosDisponibles = useMemo(() => {
    const set = new Set<number>();
    for (const f of filasRaw) {
      const y = getUTCYear(f.creadoEn);
      if (y) set.add(y);
    }
    // asegura incluir el año actual aunque aún no haya registros
    set.add(currentYear);
    return Array.from(set).sort((a, b) => b - a);
  }, [filasRaw, currentYear]);

  // Filtro por búsqueda (texto)
  const filasBuscadas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return filasRaw;
    return filasRaw.filter(f =>
      `${f.nombres} ${f.apellidos}`.toLowerCase().includes(q) ||
      (f.padre?.nombresApellidos ?? "").toLowerCase().includes(q) ||
      (f.madre?.nombresApellidos ?? "").toLowerCase().includes(q) ||
      (f.grupoFamiliarId ?? "").toLowerCase().includes(q) ||
      (f.id ?? "").toLowerCase().includes(q)
    );
  }, [filasRaw, busqueda]);

  // Filtro por AÑO (UI-only)
  const filas = useMemo(() => {
    if (anio === "all") return filasBuscadas;
    return filasBuscadas.filter((f) => getUTCYear(f.creadoEn) === anio);
  }, [filasBuscadas, anio]);

  // Acciones
  async function cambiarEstado(id: string, estado: EstadoSeguimiento, motivo?: string) {
    await actualizarEstadoSeguimiento(id, estado, motivo);
  }

  async function cambiarFlag(habilitado: boolean) {
    setGuardandoFlag(true);
    try {
      await setFlagHabilitado(habilitado);
      setFlagHabilitado(habilitado);
    } finally {
      setGuardandoFlag(false);
    }
  }

  return {
    // data
    cargando, error, filas,
    // búsqueda
    busqueda, setBusqueda,
    // año (UI-only)
    anio, setAnio, aniosDisponibles,
    // flag formulario
    flagHabilitado, cambiarFlag, guardandoFlag,
    // acciones de fila
    cambiarEstado,
  };
}
