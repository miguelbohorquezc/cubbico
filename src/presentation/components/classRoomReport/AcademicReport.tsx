import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../infrastructure/firebase/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface SubjectData {
  areaId: string;
  asignatura: string;
  ihs: string;
  grades: { l1: number; l2: number; l3: number; fallas: number };
  achievements: { logro1: string; logro2: string; logro3: string };
}

interface AreaGroup {
  nombreArea: string;
  orden: number;
  subjects: SubjectData[];
}

const AcademicReport = () => {
  const { schoolLevel, studentId, year } = useParams<{ 
    schoolLevel?: '1' | '2';
    studentId?: string;
    year?: string;
  }>();
  
  const [reportData, setReportData] = useState<{
    primary: SubjectData[];
    secondary: AreaGroup[];
  }>({ primary: [], secondary: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSecondary = schoolLevel === '2';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!studentId || !year) throw new Error('Parámetros inválidos');

        // Obtener datos del historial académico y áreas
        const [historySnap, areasSnapshot] = await Promise.all([
          getDoc(doc(db, 'history', studentId)),
          getDocs(collection(db, 'areas'))
        ]);

        if (!historySnap.exists()) throw new Error('Estudiante no encontrado');

        // Procesar datos de áreas
        const areasMap = areasSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = {
            ...doc.data(),
            orden: doc.data().orden || 9999
          };
          return acc;
        }, {} as Record<string, any>);

        // Procesar datos académicos
        const yearData = historySnap.data().years[year];
        if (!yearData) throw new Error('No hay datos para este año');

        const primaryData: SubjectData[] = [];
        const secondaryGroups: Record<string, AreaGroup> = {};

        for (const period of Object.values(yearData.periods)) {
          for (const [areaId, areaData] of Object.entries(period.areas)) {
            const areaInfo = areasMap[areaId] || {};
            const achievements = await getAchievements(areaData.metadata.achievementId);

            const subject: SubjectData = {
              areaId,
              asignatura: areaInfo.asignatura || areaId,
              ihs: areaInfo.ihs || 'N/A',
              grades: areaData.grades,
              achievements
            };

            // Datos para ambos modos
            primaryData.push(subject);

            // Preparar datos para modo secundaria
            const areaKey = areaInfo.area || 'Otras';
            if (!secondaryGroups[areaKey]) {
              secondaryGroups[areaKey] = {
                nombreArea: areaKey,
                orden: areaInfo.orden || 9999,
                subjects: []
              };
            }
            secondaryGroups[areaKey].subjects.push(subject);
          }
        }

        // Ordenar datos para secundaria
        const sortedSecondary = Object.values(secondaryGroups)
          .sort((a, b) => a.orden - b.orden)
          .map(group => ({
            ...group,
            subjects: group.subjects.sort((a, b) => a.asignatura.localeCompare(b.asignatura))
          }));

        setReportData({
          primary: primaryData,
          secondary: sortedSecondary
        });
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, year]);

  const getAchievements = async (achievementId?: string) => {
    try {
      if (!achievementId) return { logro1: 'N/A', logro2: 'N/A', logro3: 'N/A' };
      
      const achievementSnap = await getDoc(doc(db, 'achievements', achievementId));
      return achievementSnap.exists() 
        ? achievementSnap.data().logros 
        : { logro1: 'N/A', logro2: 'N/A', logro3: 'N/A' };
    } catch (error) {
      return { logro1: 'Error', logro2: 'Error', logro3: 'Error' };
    }
  };

  const calculateAverage = (l1: number, l2: number, l3: number) => {
    return ((l1 + l2 + l3) / 3).toFixed(2);
  };

  const renderPrimaryTable = () => (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={headerStyle}>Asignatura</th>
          <th style={headerStyle}>IHS</th>
          <th style={headerStyle}>Notas</th>
          <th style={headerStyle}>Promedio</th>
          <th style={headerStyle}>Logros</th>
        </tr>
      </thead>
      <tbody>
        {reportData.primary.map((subject, index) => (
          <tr key={index} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
            <td style={cellStyle}>{subject.asignatura}</td>
            <td style={cellStyle}>{subject.ihs}</td>
            <td style={cellStyle}>
              <div style={gradesContainer}>
                <span style={gradeLabel}>L1:</span> {subject.grades.l1}<br/>
                <span style={gradeLabel}>L2:</span> {subject.grades.l2}<br/>
                <span style={gradeLabel}>L3:</span> {subject.grades.l3}
              </div>
            </td>
            <td style={{ ...cellStyle, fontWeight: 'bold' }}>
              {calculateAverage(subject.grades.l1, subject.grades.l2, subject.grades.l3)}
            </td>
            <td style={cellStyle}>
              <div style={achievementsContainer}>
                {Object.entries(subject.achievements).map(([key, value], idx) => (
                  <div key={key} style={achievementItemStyle}>
                    <span style={achievementNumberStyle}>{idx + 1}</span>
                    {value}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSecondaryGroups = () => (
    reportData.secondary.map((group, index) => (
      <div key={index} style={{ marginTop: '2rem' }}>
        <h3 style={areaTitleStyle}>{group.nombreArea}</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerStyle}>Asignatura</th>
              <th style={headerStyle}>IHS</th>
              <th style={headerStyle}>Notas</th>
              <th style={headerStyle}>Promedio</th>
              <th style={headerStyle}>Logros</th>
            </tr>
          </thead>
          <tbody>
            {group.subjects.map((subject, idx) => (
              <tr key={idx} style={idx % 2 === 0 ? evenRowStyle : oddRowStyle}>
                <td style={cellStyle}>{subject.asignatura}</td>
                <td style={cellStyle}>{subject.ihs}</td>
                <td style={cellStyle}>
                  <div style={gradesContainer}>
                    <span style={gradeLabel}>L1:</span> {subject.grades.l1}<br/>
                    <span style={gradeLabel}>L2:</span> {subject.grades.l2}<br/>
                    <span style={gradeLabel}>L3:</span> {subject.grades.l3}
                  </div>
                </td>
                <td style={{ ...cellStyle, fontWeight: 'bold' }}>
                  {calculateAverage(subject.grades.l1, subject.grades.l2, subject.grades.l3)}
                </td>
                <td style={cellStyle}>
                  <div style={achievementsContainer}>
                    {Object.entries(subject.achievements).map(([key, value], idx) => (
                      <div key={key} style={achievementItemStyle}>
                        <span style={achievementNumberStyle}>{idx + 1}</span>
                        {value}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))
  );

  if (loading) return <div style={loadingStyle}>Cargando informe...</div>;
  if (error) return <div style={errorStyle}>Error: {error}</div>;
  if (!reportData.primary.length && !reportData.secondary.length) {
    return <div>No se encontraron datos académicos</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        Informe Académico {isSecondary ? 'Secundaria' : 'Primaria'} - {year}
      </h2>

      {isSecondary ? renderSecondaryGroups() : renderPrimaryTable()}
    </div>
  );
};

// Estilos
const containerStyle = {
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto',
  fontFamily: 'Arial, sans-serif'
};

const titleStyle = {
  color: '#2c3e50',
  borderBottom: '2px solid #3498db',
  paddingBottom: '10px',
  marginBottom: '30px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '15px'
} as const;

const headerStyle = {
  backgroundColor: '#3498db',
  color: 'white',
  padding: '12px',
  textAlign: 'left',
  fontSize: '14px'
} as const;

const cellStyle = {
  padding: '12px',
  borderBottom: '1px solid #ecf0f1',
  verticalAlign: 'top',
  fontSize: '14px'
} as const;

const evenRowStyle = {
  backgroundColor: '#f8f9fa'
} as const;

const oddRowStyle = {
  backgroundColor: '#ffffff'
} as const;

const gradesContainer = {
  lineHeight: '1.6'
} as const;

const gradeLabel = {
  display: 'inline-block',
  width: '30px',
  color: '#7f8c8d'
} as const;

const achievementsContainer = {
  display: 'grid',
  gap: '10px'
} as const;

const achievementItemStyle = {
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-start'
} as const;

const achievementNumberStyle = {
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
} as const;

const areaTitleStyle = {
  backgroundColor: '#3498db',
  color: 'white',
  padding: '10px',
  borderRadius: '5px',
  margin: '20px 0 15px'
} as const;

const loadingStyle = {
  padding: '20px',
  textAlign: 'center'
} as const;

const errorStyle = {
  padding: '20px',
  textAlign: 'center',
  color: '#e74c3c'
} as const;

export default AcademicReport;