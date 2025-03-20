import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../infrastructure/firebase/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface SubjectData {
  areaId: string;
  asignatura: string;
  ihs: string;
  grades: {
    l1: number;
    l2: number;
    l3: number;
    fallas: number;
  };
  achievements: {
    logro1: string;
    logro2: string;
    logro3: string;
  };
}

const AcademicReport = () => {
  const { studentId, year } = useParams<{ studentId?: string; year?: string }>();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!studentId || !year) throw new Error('Parámetros inválidos');

        // 1. Obtener datos del historial académico
        const historyRef = doc(db, 'history', studentId);
        const historySnap = await getDoc(historyRef);
        
        if (!historySnap.exists()) throw new Error('Estudiante no encontrado');

        // 2. Obtener datos de áreas
        const areasSnapshot = await getDocs(collection(db, 'areas'));
        const areasMap = areasSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = {
            asignatura: doc.data().asignatura,
            ihs: doc.data().ihs
          };
          return acc;
        }, {} as Record<string, { asignatura: string; ihs: string }>);

        // 3. Procesar datos académicos
        const yearData = historySnap.data().years[year];
        if (!yearData) throw new Error('No hay datos para este año');

        const subjectsData: SubjectData[] = [];
        
        // Recorrer periodos y áreas
        for (const period of Object.values(yearData.periods)) {
          for (const [areaId, areaData] of Object.entries(period.areas)) {
            // 4. Obtener logros desde achievements
            let achievements = { logro1: 'N/A', logro2: 'N/A', logro3: 'N/A' };
            const achievementId = areaData.metadata.achievementId;

            if (achievementId) {
              const achievementRef = doc(db, 'achievements', achievementId);
              const achievementSnap = await getDoc(achievementRef);
              
              if (achievementSnap.exists()) {
                const achievementData = achievementSnap.data();
                achievements = {
                  logro1: achievementData.logros.logro1,
                  logro2: achievementData.logros.logro2,
                  logro3: achievementData.logros.logro3
                };
              }
            }

            subjectsData.push({
              areaId,
              asignatura: areasMap[areaId]?.asignatura || areaId,
              ihs: areasMap[areaId]?.ihs || 'N/A',
              grades: areaData.grades,
              achievements
            });
          }
        }

        setSubjects(subjectsData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, year]);

  const calculateAverage = (l1: number, l2: number, l3: number) => {
    return ((l1 + l2 + l3) / 3).toFixed(2);
  };

  if (loading) return <div>Cargando informe...</div>;
  if (error) return <div>Error: {error}</div>;
  if (subjects.length === 0) return <div>No se encontraron datos académicos</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        Informe Académico - {year}
      </h2>
      
      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Asignatura</th>
              <th style={tableHeaderStyle}>IHS</th>
              <th style={tableHeaderStyle}>Notas</th>
              <th style={tableHeaderStyle}>Promedio</th>
              <th style={tableHeaderStyle}>Logros</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr key={index} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                <td style={cellStyle}>{subject.asignatura}</td>
                <td style={cellStyle}>{subject.ihs}</td>
                <td style={cellStyle}>
                  <div style={gradeContainer}>
                    <span style={gradeLabel}>L1:</span> {subject.grades.l1}<br/>
                    <span style={gradeLabel}>L2:</span> {subject.grades.l2}<br/>
                    <span style={gradeLabel}>L3:</span> {subject.grades.l3}
                  </div>
                </td>
                <td style={{ ...cellStyle, fontWeight: 'bold' }}>
                  {calculateAverage(subject.grades.l1, subject.grades.l2, subject.grades.l3)}
                </td>
                <td style={cellStyle}>
                  <div style={achievementContainer}>
                    <div style={achievementItem}>
                      <span style={achievementNumber}>1</span>
                      {subject.achievements.logro1}
                    </div>
                    <div style={achievementItem}>
                      <span style={achievementNumber}>2</span>
                      {subject.achievements.logro2}
                    </div>
                    <div style={achievementItem}>
                      <span style={achievementNumber}>3</span>
                      {subject.achievements.logro3}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Estilos mejorados
const tableHeaderStyle = {
  backgroundColor: '#3498db',
  color: 'white',
  padding: '12px',
  textAlign: 'left',
  fontSize: '14px'
};

const cellStyle = {
  padding: '12px',
  borderBottom: '1px solid #ecf0f1',
  verticalAlign: 'top',
  fontSize: '14px'
};

const evenRowStyle = {
  backgroundColor: '#f8f9fa'
};

const oddRowStyle = {
  backgroundColor: '#ffffff'
};

const gradeContainer = {
  lineHeight: '1.6'
};

const gradeLabel = {
  display: 'inline-block',
  width: '30px',
  color: '#7f8c8d'
};

const achievementContainer = {
  display: 'grid',
  gap: '10px'
};

const achievementItem = {
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-start'
};

const achievementNumber = {
  background: '#2ecc71',
  color: 'white',
  minWidth: '24px',
  height: '24px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold'
};

// Función de cálculo promedio
const calculateAverage = (l1: number, l2: number, l3: number) => ((l1 + l2 + l3) / 3).toFixed(2);

export default AcademicReport;