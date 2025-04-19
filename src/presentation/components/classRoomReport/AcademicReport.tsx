import React from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../infrastructure/firebase/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import logo from '../../../assets/logo/logotipo.jpg';
import "./AcademicReport.css";

interface Grades {
  l1: number;
  l2: number;
  l3: number;
  fallas: number;
}

interface Achievement {
  logro1: string;
  logro2: string;
  logro3: string;
}

interface SubjectData {
  areaId: string;
  asignatura: string;
  ihs: string;
  grades: Grades;
  achievements: Achievement;
}

interface AreaGroup {
  nombreArea: string;
  orden: number;
  subjects: SubjectData[];
}

interface StudentData {
  name: string;
  lastName: string;
  className: string;
  classRoom: string;
  document?: string;
  id: string;
  classroomId?: string;
}

interface PeriodInfo {
  periodo: string;
  curso: string;
}

const AcademicReport = () => {
  const { schoolLevel, studentId, year, periodId, director } = useParams<{ 
    schoolLevel?: '1' | '2';
    studentId?: string;
    periodId?: string;
    year?: string;
    director?: string;
  }>();
  
  const [reportData, setReportData] = React.useState<{
    primary: SubjectData[];
    secondary: AreaGroup[];
    periodInfo?: PeriodInfo;
  }>({ primary: [], secondary: [] });
  
  const [studentInfo, setStudentInfo] = React.useState<StudentData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const isSecondary = schoolLevel === '2';

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!studentId || !year) throw new Error('Parámetros inválidos');

        // Obtener datos del estudiante
        const studentDoc = await getDoc(doc(db, 'student', studentId));
        if (!studentDoc.exists()) throw new Error('Estudiante no encontrado');
        
        const studentData = studentDoc.data() as StudentData;
        setStudentInfo({
          name: studentData.name || '',
          lastName: studentData.lastName || '',
          className: studentData.className || '',
          classRoom: studentData.classRoom || '',
          document: studentData.document,
          id: studentData.id,
          classroomId: studentData.classroomId
        });

        // Obtener datos académicos
        const [historySnap, areasSnapshot] = await Promise.all([
          getDoc(doc(db, 'history', studentId)),
          getDocs(collection(db, 'areas'))
        ]);

        if (!historySnap.exists()) throw new Error('Historial académico no encontrado');

        const areasMap = areasSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = {
            ...doc.data(),
            orden: doc.data().orden || 9999
          };
          return acc;
        }, {} as Record<string, any>);

        const yearData = historySnap.data()?.years[year];
        if (!yearData) throw new Error('No hay datos para este año');

        const primaryData: SubjectData[] = [];
        const secondaryGroups: Record<string, AreaGroup> = {};

        // Procesar cada período académico
        for (const period of Object.values(yearData.periods)) {
          const periodData = period as any;
          for (const [areaId, areaData] of Object.entries(periodData.areas)) {
            const areaInfo = areasMap[areaId] || {};
            const achievements = await getAchievements((areaData as any).metadata?.achievementId);

            const subject: SubjectData = {
              areaId,
              asignatura: areaInfo.asignatura || areaId,
              ihs: areaInfo.ihs || 'N/A',
              grades: (areaData as any).grades || { l1: 0, l2: 0, l3: 0, fallas: 0 },
              achievements: achievements || { logro1: 'N/A', logro2: 'N/A', logro3: 'N/A' }
            };

            primaryData.push(subject);

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

        setReportData({
          primary: primaryData,
          secondary: Object.values(secondaryGroups)
            .sort((a, b) => a.orden - b.orden)
            .map(group => ({
              ...group,
              subjects: group.subjects.sort((a, b) => 
                a.asignatura.localeCompare(b.asignatura))
            })),
          periodInfo: {
            periodo: yearData.periodo || '',
            curso: yearData.curso || ''
          }
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
    if (!achievementId) return null;
    try {
      const achievementSnap = await getDoc(doc(db, 'achievements', achievementId));
      return achievementSnap.exists() ? achievementSnap.data().logros : null;
    } catch (error) {
      return null;
    }
  };

  const calculateAverage = (l1: number, l2: number, l3: number) => {
    return ((l1 + l2 + l3) / 3).toFixed(2);
  };

  const getGradeCategory = (average: number) => {
    if (average >= 4.6) return { text: 'Superior', color: '#3498db' }; // Azul
    if (average >= 4.0) return { text: 'Alto', color: '#2ecc71' };     // Verde
    if (average >= 3.0) return { text: 'Básico', color: '#f39c12' };   // Amarillo
    return { text: 'Bajo', color: '#e74c3c' };                         // Rojo
  };

  const formatStudentName = (name: string, lastName: string) => {
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const formattedLastName = lastName.split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    return `${formattedName} ${formattedLastName}`;
  };

  const renderStudentInfoTable = () => (
    <table className="table-student-info-report">
      <thead className="thead-student-info">
        <tr>
          <td>ESTUDIANTE</td>
          <td>GRADO</td>
          <td>PERIODO</td>
          <td>FECHA</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="student-name">
            {studentInfo ? 
              formatStudentName(studentInfo.name, studentInfo.lastName) : 
              'Cargando...'}
          </td>
          <td className="student-classroom">
            {studentInfo ? 
              `${studentInfo.classRoom} - ${studentInfo.className}` : 
              'Cargando...'}
          </td>
          <td>{periodId}</td>
          <td>{new Date().toLocaleDateString()}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderPrimaryTable = () => {
    const totalFallas = reportData.primary.reduce(
      (sum, subject) => sum + (subject.grades.fallas || 0),
      0
    );

    return (
      <div className="report-container">
        <table className="table-header-info-report">
          <thead className="thead-header-info">
            <tr className="tr-header">
              <td className="td-logo-school" rowSpan={2}>
                <img src={logo} alt="logotipo" />
              </td>
              <td align="center" className="td-header">
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
        
        {renderStudentInfoTable()}

        <table className="report-table">
          <thead>
            <tr>
              <th className="table-header">Asignatura</th>
              <th className="table-header">IHS</th>
              <th className="table-header">Fallas</th>
              <th className="table-header">Logros</th>
              <th className="table-header">Notas</th>
              <th className="table-header">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {reportData.primary.map((subject, index) => {
              const average = parseFloat(calculateAverage(subject.grades.l1, subject.grades.l2, subject.grades.l3));
              const gradeCategory = getGradeCategory(average);
              
              return (
                <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td className="table-cell">{subject.asignatura}</td>
                  <td className="table-cell">{subject.ihs}</td>
                  <td className="table-cell">{subject.grades.fallas}</td>
                  <td className="table-cell">
                    <div className="achievements-container">
                      {Object.entries(subject.achievements).map(([key, value], idx) => (
                        <div key={key} className="achievement-item">
                          <span className="achievement-number">{idx + 1}</span>
                          {value}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="grades-container">
                      <span className="grade-label">L1:</span> {subject.grades.l1}<br/>
                      <span className="grade-label">L2:</span> {subject.grades.l2}<br/>
                      <span className="grade-label">L3:</span> {subject.grades.l3}
                    </div>
                  </td>
                  <td className="table-cell average-cell">
                    <p>{average.toFixed(2)}</p>
                    <span style={{ 
                      color: gradeCategory.color,
                      fontWeight: 'bold',
                      fontSize: '0.8em'
                    }}>
                      {gradeCategory.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table className="table-student-info-report">
          <tbody>
            <tr>
                <td colSpan={2}><p>CONVENCIONES: I.H.S (Intensidad Horaria Semanal), L(Logro)</p></td>
                <td colSpan={3}align="center">{`Total fallas: ${totalFallas}`}</td>
            </tr>
          </tbody>
        </table>
        <table className="table-student-info-report">
                    <thead className="thead-student-info">
                            <tr className="">
                                <td colSpan={2}><p>ESCALA DE VALORACIÓN</p></td>
                            </tr>
                    </thead>
                    <tbody>
                            <tr>
                                <td colSpan={2}><p>Superior: 4.6 - 5.0; Alto: 4.0 - 4.5; Básico: 3.0 - 3.9; Bajo: 1.0 - 2.9</p></td>
                            </tr>
                    </tbody>
        </table>
        <table className="table-student-info-report">
          <thead className="thead-student-info">
                            <tr className="">
                                <td colSpan={3}>
                                    <p>OBSERVACIONES</p>
                                </td>
                            </tr>
          </thead>
          <tbody>
            <tr><td></td></tr>
          </tbody>
        </table>
        <div className="firma">  
          <p>{director}</p>
          <p>Director(a) de grupo</p>
        </div>
      </div>
    );
  };

  const renderSecondaryGroups = () => {
    let totalFallasSecundaria = 0;

    return (
      <div className="report-container">
        <table className="table-header-info-report">
          <thead className="thead-header-info">
            <tr className="tr-header">
              <td className="td-logo-school" rowSpan={2}>
                <img src={logo} alt="logotipo" />
              </td>
              <td align="center" className="td-header">
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
        
        {renderStudentInfoTable()}

        {reportData.secondary.map((group, index) => {
          const groupFallas = group.subjects.reduce(
            (sum, subject) => sum + (subject.grades.fallas || 0),
            0
          );
          totalFallasSecundaria += groupFallas;

          return (
            <div key={index} className="area-group">
              <h3 className="area-title">{group.nombreArea}</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th className="table-header">Asignatura</th>
                    <th className="table-header">IHS</th>
                    <th className="table-header">Fallas</th>
                    <th className="table-header">Logros</th>
                    <th className="table-header">Notas</th>
                    <th className="table-header">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {group.subjects.map((subject, idx) => {
                    const average = parseFloat(calculateAverage(subject.grades.l1, subject.grades.l2, subject.grades.l3));
                    const gradeCategory = getGradeCategory(average);
                    
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                        <td className="table-cell">{subject.asignatura}</td>
                        <td className="table-cell">{subject.ihs}</td>
                        <td className="table-cell">{subject.grades.fallas}</td>
                        <td className="table-cell">
                          <div className="achievements-container">
                            {Object.entries(subject.achievements).map(([key, value], idx) => (
                              <div key={key} className="achievement-item">
                                <span className="achievement-number">{idx + 1}</span>
                                {value}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="grades-container">
                            <span className="grade-label">L1:</span> {subject.grades.l1}<br/>
                            <span className="grade-label">L2:</span> {subject.grades.l2}<br/>
                            <span className="grade-label">L3:</span> {subject.grades.l3}
                          </div>
                        </td>
                        <td className="table-cell average-cell">
                          <b>{average.toFixed(2)}</b>
                          <span style={{ 
                            color: gradeCategory.color,
                            fontWeight: 'bold',
                            fontSize: '0.8em'
                          }}>
                            {gradeCategory.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td colSpan={2} className="table-cell">Total {group.nombreArea}:</td>
                    <td className="table-cell">{groupFallas}</td>
                    <td colSpan={3} className="table-cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
        
        <div className="grand-total">
          <strong>Total faltas secundaria: {totalFallasSecundaria}</strong>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-state">Cargando informe...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!reportData.primary.length && !reportData.secondary.length) {
    return <div className="error-state">No se encontraron datos académicos</div>;
  }

  return isSecondary ? renderSecondaryGroups() : renderPrimaryTable();
};

export default AcademicReport;