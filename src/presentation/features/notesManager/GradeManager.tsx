import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrivateRoutes } from '../../../app/routes/routes';
import { useAppSelector } from '../../../app/store/store';
import Tooltip from '../../components/toolTip/Tooltip';
import InputField from './InputField';
import informe from "../../../assets/navbarIcons/informe.svg"
import './GradeManagerStyle.css';

import { useValidadores } from './useValidadores';
import { useCargarEstudiantesYNotas } from './useCargarEstudiantesYNotas';
import { useConstruirYEnviarLote } from './useConstruirYEnviarLote';
//@ts-ignore
import { Student, CampoCalificacion, MapaNotas } from './types';

const GradeManager: React.FC = () => {
  const { periodId, classroomId, areaId } = useParams<{
    periodId: string;
    classroomId: string;
    areaId: string;
  }>();

  // classroom para el link de informe (idéntico a tu código)
  // @ts-ignore
  const classroom = useAppSelector(state =>
    state.teacherData.classrooms.find((c: { id: string | undefined }) => c.id === classroomId)
  );

  const anioActual = useMemo(() => new Date().getFullYear().toString(), []);

  const {
    students,
    grades,
    setCampoNota,
    loading,
    error,
    showErrors,
    setShowErrors
  } = useCargarEstudiantesYNotas({ classroomId, periodId, areaId });

  const {
    validarNotaNumerica,
    validarCantidadFallas
  } = useValidadores();

  const {
    calcularPromedio,
    validarTodoAntesDeEnviar,
    enviarLote
  } = useConstruirYEnviarLote({
    students,
    grades,
    contexto: { classroomId, periodId, areaId, anioActual },
    validarNotaNumerica,
    validarCantidadFallas,
    setShowErrors
  });

  if (loading) return <div className="loading">Cargando estudiantes...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (students.length === 0) return <div className="empty">No hay estudiantes en este salón</div>;

  return (
    <div className="grade-manager">
      <table className="grades-table">
        <thead>
          <tr>
            <th><h3>Estudiante</h3></th>
            <th><h3>L1</h3></th>
            <th><h3>L2</h3></th>
            <th><h3>L3</h3></th>
            <th><h3>Fallas</h3></th>
            <th><h3>Fallas injustificadas</h3></th>
            <th><h3>Promedio</h3></th>
            <th><h3>Informe</h3></th>
          </tr>
        </thead>
        <tbody>
          {students
            .sort((a, b) => a.lastName.localeCompare(b.lastName))
            .map((student: Student) => {
              const g = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '', fallasVerificadas: '' };

              return (
                <tr key={student.id}>
                  <td className="student-info">
                    <p>{`${student.lastName} ${student.name}`.toUpperCase()}</p>
                    <div className="student-details">
                      <span><p>{student.id}</p></span>
                    </div>
                  </td>

                  {(['l1', 'l2', 'l3'] as CampoCalificacion[]).map((campo) => (
                    <td key={campo}>
                      <InputField
                        type="number"
                        //@ts-ignore
                        value={g[campo]}
                        min={1}
                        max={5}
                        step={0.01}
                        onChange={(value) => setCampoNota(student.id, campo, value)}
                        //@ts-ignore
                        isValid={!showErrors || validarNotaNumerica(g[campo])}
                        errorMessage="1.00-5.00"
                      />
                    </td>
                  ))}

                  <td>
                    <InputField
                      type="number"
                      value={g.fallas}
                      min={0}
                      step={1}
                      onChange={(value) => setCampoNota(student.id, 'fallas', value)}
                      isValid={!showErrors || validarCantidadFallas(g.fallas)}
                      errorMessage="Máx. 99"
                    />
                  </td>

                  <td>
                    <InputField
                      type="number"
                      value={g.fallasVerificadas ?? ''}
                      min={0}
                      step={1}
                      onChange={(value) => setCampoNota(student.id, 'fallasVerificadas', value)}
                      isValid={!showErrors || validarCantidadFallas(g.fallasVerificadas ?? '')}
                      errorMessage="Máx. 99"
                    />
                  </td>

                  <td className="average-cell">
                    {calcularPromedio(g.l1, g.l2, g.l3)}
                  </td>

                  <td>
                    {
                      // @ts-ignore
                      student.classRoom === 'Primaria' ? (
                        <Tooltip text="Ver informe" position='bottom'>
                          <button className="nav-options">
                            <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/1/${periodId}/${classroom?.directorGrupo}/${student.id}/2025`}>
                              <img src={informe} alt="informe" />
                            </Link>
                          </button>
                        </Tooltip>
                      ) : (
                        <Tooltip text="Ver informe" position='bottom'>
                          <button className="nav-options">
                            <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/2/${periodId}/${classroom?.directorGrupo}/${student.id}/2025`}>
                              <img src={informe} alt="informe" />
                            </Link>
                          </button>
                        </Tooltip>
                      )
                    }
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <button
      //@ts-ignore
        onClick={() => validarTodoAntesDeEnviar().then((ok) => ok && enviarLote())}
        className="submit-button"
        disabled={loading}
      >
        Guardar Calificaciones
      </button>
    </div>
  );
};

export default GradeManager;
