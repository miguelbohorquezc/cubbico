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
  const [mostrarExito, setMostrarExito] = useState<boolean>(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        // Cargar áreas
        const areasSnap = await getDocs(collection(db, 'areas'));
        //@ts-ignore
        setAreas(areasSnap.docs.map(d => ({ id: d.id, ...(d.data() as Area) })));

        // Consultas: configuración, indicadores, selecciones y salón
        const [cfgSnap, indsSnap, selSnap, classSnap] = await Promise.all([
          getDoc(doc(db, 'preschool_config', `${classRoomId}_${year}`)),
          getDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`)),
          getDoc(doc(db, 'preschool_selections', `${classRoomId}_${year}_${studentId}`)),
          getDoc(doc(db, 'classRooms', classRoomId))
        ]);

        // Propósitos
        setPropositos(cfgSnap.exists() ? (cfgSnap.data()?.propositos || []) : []);

        // Indicadores activos
        const filtered = indsSnap.exists()
          ? (indsSnap.data()?.indicadores || []).filter(
              (i: Indicador) => i.activo && i.periodos.includes(periodo)
            )
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
