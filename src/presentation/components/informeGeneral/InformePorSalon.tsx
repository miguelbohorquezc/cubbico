import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../infrastructure/firebase/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import logo from '../../../assets/logo/logotipo.jpg';
import './InformePorSalon.css';

interface Grades {
  l1: number;
  l2: number;
  l3: number;
  fallas: number;
}

interface SubjectMeta {
  areaId: string;
  asignatura: string;
  ihs: string;
  orden: string;
  nivel: string;
}

interface StudentAverage {
  studentId: string;
  studentName: string;
  averages: Record<string, number>;
  generalAverage: number;
  position: number;
}

const calculateAverage = (grades: Grades): number => {
  const { l1, l2, l3 } = grades;
  return Math.round(((l1 + l2 + l3) / 3) * 100) / 100;
};

const getGradeCategory = (avg: number): { letter: string; color: string } => {
  if (avg >= 4.6) return { letter: 'S', color: '#3498db' };
  if (avg >= 4.0) return { letter: 'A', color: '#2ecc71' };
  if (avg >= 3.0) return { letter: 'B', color: '#f39c12' };
  return { letter: 'B', color: '#e74c3c' };
};

const ClassAveragesReport: React.FC = () => {
  const { classroomId, schoolLevel, periodId, year } = useParams<{
    classroomId?: string;
    schoolLevel?: string;
    periodId?: string;
    year?: string;
  }>();

  const [classroomName, setClassroomName] = useState<string>('');
  const [subjectsMeta, setSubjectsMeta] = useState<SubjectMeta[]>([]);
  const [studentAverages, setStudentAverages] = useState<StudentAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchClassAverages = async () => {
      if (!classroomId || !schoolLevel || !periodId || !year) {
        setError('Parámetros inválidos');
        setLoading(false);
        return;
      }

      try {
        // Obtener nombre del salón
        const classroomDocRef = doc(db, 'classRooms', classroomId);
        const classroomDoc = await getDoc(classroomDocRef);
        if (classroomDoc.exists()) {
          setClassroomName(classroomDoc.data().nombreSalon || classroomId);
        } else {
          setClassroomName(classroomId);
        }

        // 1. Metadatos de áreas filtrado por nivel
        const desiredNivel = schoolLevel.toLowerCase();
        const areasQuery = query(
          collection(db, 'areas'),
          where('nivel', '==', desiredNivel)
        );
        const areasSnap = await getDocs(areasQuery);
        const metaList = areasSnap.docs.map(doc => ({
          areaId: doc.id,
          asignatura: doc.data().asignatura || doc.id,
          ihs: doc.data().ihs ? String(doc.data().ihs) : 'N/A',
          orden: doc.data().orden ? String(doc.data().orden) : '9999',
          nivel: doc.data().nivel || ''
        }));

        setSubjectsMeta(metaList);
        const validAreaIds = metaList.map(m => m.areaId);

        // 2. Obtener estudiantes del salón
        const studentsQuery = query(
          collection(db, 'student'),
          where('classroomId', '==', classroomId)
        );
        const studentsSnap = await getDocs(studentsQuery);
        const studentsData = studentsSnap.docs.map(snap => ({
          id: snap.id,
          ...(snap.data() as any)
        }));

        // 3. Calcular promedios y general
        const averagesArr = await Promise.all(
          studentsData.map(async student => {
            const historyDoc = await getDoc(doc(db, 'history', student.id));
            const yearData = historyDoc.data()?.years?.[year];
            const periodAreas = yearData?.periods?.[periodId]?.areas || {};

            const averages: Record<string, number> = {};
            Object.entries(periodAreas).forEach(([areaId, areaData]: any) => {
              if (!validAreaIds.includes(areaId)) return;
              const grades: Grades = areaData.grades || { l1: 0, l2: 0, l3: 0, fallas: 0 };
              averages[areaId] = calculateAverage(grades);
            });

            const generalAverage = parseFloat(
              (
                Object.values(averages).reduce((sum, val) => sum + val, 0) /
                Object.values(averages).length || 0
              ).toFixed(2)
            );

            return {
              studentId: student.id,
              studentName: `${student.name} ${student.lastName}`,
              averages,
              generalAverage,
              position: 0 // temporal
            };
          })
        );

        // 4. Ordenar y asignar posiciones
        const sorted = [...averagesArr].sort((a, b) => b.generalAverage - a.generalAverage);
        sorted.forEach((item, idx) => {
          item.position = idx + 1;
        });

        setStudentAverages(sorted);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchClassAverages();
  }, [classroomId, schoolLevel, periodId, year]);

  if (loading) return <div>Cargando promedios de la clase...</div>;
  if (error) return <div>Error: {error}</div>;

  const areaIds = subjectsMeta.map(m => m.areaId);
  const classAverage = parseFloat(
    (
      studentAverages.reduce((sum, s) => sum + s.generalAverage, 0) /
      studentAverages.length || 0
    ).toFixed(2)
  );

  return (
    <div className="class-averages-report">
      <table className="table-header-info-report">
        <thead className="thead-header-info">
          <tr className="tr-header">
            <td className="td-logo-school" rowSpan={1}>
              <img src={logo} alt="logotipo" />
            </td>
            <td align="center" className="td-header" colSpan={2}>
              <b>COLINA CAMPESTRE SCHOOL</b>
              <p>De Sincelejo, Sucre, 
              con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria 
              por parte de Secretaria de Educación Municipal, 
              según resolución No 2747 del 12 de diciembre de 2023. Carrera 34No 38-158, 
              teléfonos: 2771068-3006781806</p>
              <p>NIT: 901731191-3</p>
            </td>
            <td align="center" className="td-dane">DANE 370001038852</td>
          </tr>
        </thead>
      </table>
      <h2>
        <p className='title-p'>{`REPORTE DE PROMEDIOS - SALÓN ${classroomName.toUpperCase()} - ${schoolLevel?.toUpperCase()} - P ${periodId}`}</p>
      </h2>
      <table>
        <thead>
          <tr>
            <th scope="col" className='th-asignatura'><p>Posiciones</p></th>
            <th scope="col" className='th-estudiante'><p>Estudiante</p></th>
            {areaIds.map(id => (
              <th key={id} scope="col" className='th-asignatura'>
                <p className='p-asignaturas'>{subjectsMeta.find(m => m.areaId === id)?.asignatura || id}</p>
              </th>
            ))}
            <th scope="col" className='th-asignatura'><p>Promedio General</p></th>
          </tr>
        </thead>
        <tbody>
          {studentAverages.map(student => (
            <tr key={student.studentId}>
              <td><p className='student-position-p'>{student.position}</p></td>
              <td><p className='student-name-p'>{student.studentName}</p></td>
              {areaIds.map(id => {
                const avg = student.averages[id];
                if (avg === undefined) {
                  return <td key={id}>-</td>;
                }
                const cat = getGradeCategory(avg);
                return (
                  <td key={id}>
                    <p className='promedio-p'>{avg.toFixed(2)}</p> 
                    <span style={{ color: cat.color }}>{cat.letter}</span>
                  </td>
                );
              })}
              <td>
                <p className='promedio-p'>{student.generalAverage.toFixed(2)}</p>{' '}
                <span style={{ color: getGradeCategory(student.generalAverage).color }}>
                  {getGradeCategory(student.generalAverage).letter}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="class-summary">
        <strong>Promedio general del salón:</strong> {classAverage.toFixed(2)}{' '}
        <span style={{ color: getGradeCategory(classAverage).color }}>
          {getGradeCategory(classAverage).letter}
        </span>
      </div>
    </div>
  );
};

export default ClassAveragesReport;
