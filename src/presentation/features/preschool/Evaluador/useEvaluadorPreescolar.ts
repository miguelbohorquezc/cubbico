import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';

interface Indicador {
  id: string;
  texto: string;
  periodos: number[];
  asignatura: string;
  activo: boolean;
  nivel: 'básico' | 'intermedio' | 'avanzado';
}

interface Proposito {
  id: string;
  texto: string;
  referentes: string[];
  asignaturas: string[];
}

interface Area {
  id: string;
  asignatura: string;
}

interface Params {
  studentId: string;
  periodo: number;
  year: string;
  classRoomId: string;
}

interface UseEvaluadorPreescolarResult {
  studentName: string;
  classroomName: string;
  propositos: Proposito[];
  indicadores: Indicador[];
  selecciones: Record<string, string>;
  obtenerNombreAsignatura: (id: string) => string;
  cargando: boolean;
  mostrarExito: boolean;
}

export function useEvaluadorPreescolar(
  { studentId, periodo, year, classRoomId }: Params
): UseEvaluadorPreescolarResult {
  const [studentName, setStudentName] = useState<string>('');
  const [classroomName, setClassroomName] = useState<string>('');
  const [propositos, setPropositos] = useState<Proposito[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [selecciones, setSelecciones] = useState<Record<string, string>>({});
  const [areas, setAreas] = useState<Area[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  //@ts-ignore
  const [mostrarExito, setMostrarExito] = useState<boolean>(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        // Cargar áreas — construir mapa de IDs duplicados al canónico
        const areasSnap = await getDocs(collection(db, 'areas'));
        const todasAreas = areasSnap.docs.map(d => ({ id: d.id, ...(d.data() as Area) }));
        //@ts-ignore
        setAreas(todasAreas);

        const todasPreescolar = todasAreas.filter((a: any) => a.nivel === 'preescolar');
        const sorted = [...todasPreescolar].sort((a: any, b: any) => {
          if ((a.orden || 0) !== (b.orden || 0)) return (a.orden || 0) - (b.orden || 0);
          return (a.id || '').localeCompare(b.id || '');
        });
        const canonicalMap = new Map<string, string>();
        sorted.forEach((area: any) => {
          const key = (area.asignatura || '').trim().toLowerCase();
          const first = sorted.find((a: any) => (a.asignatura || '').trim().toLowerCase() === key);
          if (first?.id) canonicalMap.set(area.id, first.id);
        });

        // Consultas: configuración, indicadores, selecciones y salón
        const [cfgSnap, indsSnap, selSnap, classSnap] = await Promise.all([
          getDoc(doc(db, 'preschool_config', `${classRoomId}_${year}`)),
          getDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`)),
          getDoc(doc(db, 'preschool_selections', `${classRoomId}_${year}_${studentId}`)),
          getDoc(doc(db, 'classRooms', classRoomId))
        ]);

        // Propósitos — remapear asignaturas a IDs canónicos
        const propositosRaw = cfgSnap.exists() ? (cfgSnap.data()?.propositos || []) : [];
        setPropositos(
          propositosRaw.map((p: any) => ({
            ...p,
            asignaturas: (p.asignaturas || []).map((id: string) => canonicalMap.get(id) ?? id)
          }))
        );

        // Indicadores activos con remapeo de IDs duplicados y deduplicación por texto
        const seenInds = new Map<string, boolean>();
        const filtered = indsSnap.exists()
          ? (indsSnap.data()?.indicadores || [])
              .map((i: Indicador) => ({
                ...i,
                asignatura: canonicalMap.get(i.asignatura) ?? i.asignatura
              }))
              .filter((i: Indicador) => {
                const key = `${i.asignatura}|${i.texto.trim().toLowerCase()}`;
                if (seenInds.has(key)) return false;
                seenInds.set(key, true);
                return true;
              })
              .filter((i: Indicador) => i.activo && i.periodos.includes(periodo))
          : [];
        setIndicadores(filtered);

        // Selecciones previas
        setSelecciones(selSnap.exists() ? (selSnap.data()?.selecciones || {}) : {});

        // Nombre del salón
        if (classSnap.exists()) {
          const data = classSnap.data() as { nombreSalon?: string };
          setClassroomName(data.nombreSalon || '');
        }

        // Nombre del estudiante
        const studentSnap = await getDoc(doc(db, 'student', studentId));
        if (studentSnap.exists()) {
          const { name, lastName } = studentSnap.data() as { name: string; lastName: string };
          setStudentName(`${name} ${lastName}`);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [studentId, periodo, year, classRoomId]);

  const obtenerNombreAsignatura = (id: string) => {
    return areas.find(a => a.id === id)?.asignatura || id;
  };

  return {
    studentName,
    classroomName,
    propositos,
    indicadores,
    selecciones,
    obtenerNombreAsignatura,
    cargando,
    mostrarExito
  };
}
