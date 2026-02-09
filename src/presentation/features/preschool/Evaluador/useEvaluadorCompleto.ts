import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';

// Tipos reutilizados
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
  area?: string;
  ihs?: number;
  orden?: number;
  nivel?: string;
}

interface Params {
  studentId: string;
  periodo: number;
  year: string;
  classRoomId: string;
}

export function useEvaluadorCompleto({
  studentId,
  periodo,
  year,
  classRoomId
}: Params) {
  const [studentName, setStudentName] = useState<string>('');
  const [classroomName, setClassroomName] = useState<string>('');
  const [propositos, setPropositos] = useState<Proposito[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [selecciones, setSelecciones] = useState<Record<string, string>>({});
  const [areas, setAreas] = useState<Area[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        // 1. Áreas
        const areasSnap = await getDocs(collection(db, 'areas'));
        setAreas(
          areasSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Area[]
        );

        // 2. Configuración, indicadores y selecciones
        const [cfg, indsSnap, selSnap] = await Promise.all([
          getDoc(doc(db, 'preschool_config', `${classRoomId}_${year}`)),
          getDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`)),
          getDoc(
            doc(db, 'preschool_selections', `${classRoomId}_${year}_${studentId}`)
          )
        ]);

        setPropositos(cfg.exists() ? cfg.data().propositos || [] : []);

        const filtrados =
          indsSnap.exists()
            ? (indsSnap.data().indicadores || []).filter(
                (i: Indicador) => i.activo && i.periodos.includes(periodo)
              )
            : [];
        setIndicadores(filtrados);
        setSelecciones(selSnap.exists() ? selSnap.data().selecciones || {} : {});

        // 3. Nombre del estudiante y salón
        const [studentSnap, classroomSnap] = await Promise.all([
          getDoc(doc(db, 'student', studentId)),
          getDoc(doc(db, 'classRooms', classRoomId))
        ]);

        if (studentSnap.exists()) {
          const { name, lastName } = studentSnap.data() as {
            name: string;
            lastName: string;
          };
          setStudentName(`${name} ${lastName}`);
        }

        if (classroomSnap.exists()) {
          const { salon } = classroomSnap.data() as { salon: string };
          setClassroomName(salon || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [studentId, periodo, year, classRoomId]);

  const obtenerNombreAsignatura = (id: string) => {
    return areas.find(a => a.id === id)?.asignatura || id;
  };

  const handleSeleccion = (asigId: string, indId: string) => {
    setSelecciones(prev => ({ ...prev, [asigId]: indId }));
  };

  const guardarEvaluacion = async () => {
    try {
      setGuardando(true);
      await setDoc(
        doc(db, 'preschool_selections', `${classRoomId}_${year}_${studentId}`),
        {
          selecciones,
          _meta: {
            studentId,
            classRoomId,
            year,
            periodo,
            lastUpdate: new Date(),
            completado: true
          }
        },
        { merge: true }
      );
      setMostrarExito(true);
      setTimeout(() => setMostrarExito(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  return {
    studentName,
    classroomName,
    propositos,
    indicadores,
    selecciones,
    obtenerNombreAsignatura,
    handleSeleccion,
    guardarEvaluacion,
    cargando,
    guardando,
    mostrarExito
  };
}