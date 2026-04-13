import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrivateRoutes } from '../../../app/routes/routes';
import { useAppSelector } from '../../../app/store/store';
import InputField from './InputField';
import Portal from '../../components/common/Portal';
import {
  IconFileDescription, IconLoader2, IconAlertCircle,
  IconUsersGroup, IconCheck, IconX, IconLock,
  IconCircleCheck, IconAlertTriangle,
} from '@tabler/icons-react';
import { usePermissions } from '../../hooks/usePermissions';

import { useValidadores } from './useValidadores';
import { useCargarEstudiantesYNotas } from './useCargarEstudiantesYNotas';
import { useConstruirYEnviarLote } from './useConstruirYEnviarLote';
import { Student, CampoCalificacion } from './types';

// ── Estado del modal ───────────────────────────────────────
type ModalPhase =
  | { phase: 'confirm' }
  | { phase: 'saving' }
  | { phase: 'success' }
  | { phase: 'error'; message: string };

/**
 * Obtiene el color del promedio según el rango
 * 0-2.9: Magenta DS, 3-4: Yellow DS, 4.1+: Tosca DS
 */
const getPromedioColor = (promedio: string): { bg: string; text: string } => {
  const num = parseFloat(promedio);
  if (isNaN(num) || promedio === '0.00') {
    return { bg: 'bg-gray-100', text: 'text-gray-500' };
  }
  if (num < 3) {
    return { bg: 'bg-magenta-ds/10', text: 'text-magenta-cc' };
  }
  if (num <= 4) {
    return { bg: 'bg-yellow-ds/10', text: 'text-yellow-cc' };
  }
  return { bg: 'bg-tosca-ds/10', text: 'text-tosca-cc' };
};

const GradeManager: React.FC = () => {
  const { periodId, classroomId, areaId } = useParams<{
    periodId: string;
    classroomId: string;
    areaId: string;
  }>();

  // Estado del modal y errores de validación inline
  const [modalPhase, setModalPhase] = useState<ModalPhase | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Permisos del usuario
  const { isCoordinator: _isCoordinator, permissions } = usePermissions();

  // classroom para el link de informe (idéntico a tu código)
  // @ts-ignore
  const classroom = useAppSelector(state =>
    state.teacherData.classrooms.find((c: { id: string | undefined }) => c.id === classroomId)
  );

  const area = useAppSelector(state =>
    state.teacherData.areas.find((a: { id: string | undefined }) => a.id === areaId)
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

  // Estados de carga, error y vacío
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <IconLoader2 size={32} className="text-orchid-blue-60 animate-spin mb-3" />
        <p className="text-sm text-gray-600">Cargando estudiantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 mb-3 bg-red-50 rounded-full flex items-center justify-center">
          <IconAlertCircle size={24} className="text-red-500" />
        </div>
        <p className="text-sm font-medium text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
          <IconUsersGroup size={24} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">No hay estudiantes en este salón</p>
        <p className="text-xs text-gray-500">Asigna estudiantes al salón para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabla de calificaciones */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                Estudiante
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-orchid-blue-60 uppercase tracking-wider w-20">
                L1
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-orchid-blue-60 uppercase tracking-wider w-20">
                L2
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-orchid-blue-60 uppercase tracking-wider w-20">
                L3
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                Fallas
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-red-500 uppercase tracking-wider w-20">
                F. Injust.
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-orchid-blue-60 uppercase tracking-wider w-20">
                Prom.
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" colSpan={2}>
                Informes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students
              .sort((a, b) => a.lastName.localeCompare(b.lastName))
              .map((student: Student) => {
                const g = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '', fallasVerificadas: '' };

                return (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Info del estudiante */}
                    <td className="px-3 py-4">
                      <p className="font-medium text-gray-900 text-xs">
                        {`${student.lastName} ${student.name}`.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">{student.id}</p>
                    </td>

                    {/* Notas L1, L2, L3 */}
                    {(['l1', 'l2', 'l3'] as CampoCalificacion[]).map((campo) => (
                      <td key={campo} className="px-1 py-4 text-center">
                        <InputField
                          type="number"
                          // @ts-ignore
                          value={g[campo]}
                          min={1}
                          max={5}
                          step={0.01}
                          onChange={(value) => setCampoNota(student.id, campo, value)}
                          // @ts-ignore
                          isValid={!showErrors || validarNotaNumerica(g[campo])}
                          errorMessage="1.00-5.00"
                        />
                      </td>
                    ))}


                    {/* Fallas totales */}
                    <td className="px-1 py-4 text-center">
                      <InputField
                        type="text"
                        value={g.fallas}
                        onChange={(value) => setCampoNota(student.id, 'fallas', value)}
                        isValid={!showErrors || validarCantidadFallas(g.fallas)}
                        errorMessage="0-99"
                      />
                    </td>

                    {/* Fallas injustificadas */}
                    <td className="px-1 py-4 text-center">
                      <InputField
                        type="text"
                        value={g.fallasVerificadas || ''}
                        onChange={(value) => setCampoNota(student.id, 'fallasVerificadas', value)}
                        isValid={!showErrors || validarCantidadFallas(g.fallasVerificadas || '')}
                        errorMessage="0-99"
                      />
                    </td>

                    {/* Promedio */}
                    <td className="px-2 py-4 text-center">
                      {(() => {
                        const promedio = calcularPromedio(g.l1, g.l2, g.l3);
                        const colors = getPromedioColor(promedio);
                        return (
                          <span className={`inline-flex items-center justify-center w-12 h-8 text-sm font-bold ${colors.text} ${colors.bg} rounded-lg`}>
                            {promedio}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Informe de período */}
                    <td className="px-1 py-4 text-center">
                      {permissions.canViewAllReports ? (
                        <Link
                          to={`/private/dashboard/${PrivateRoutes.REPORT}/${classroom?.nivel}/${periodId}/${classroom?.directorGrupo}/${student.id}/${anioActual}`}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-orchid-blue-60 hover:bg-orchid-blue-10 rounded-lg transition-colors"
                          title="Ver informe de período"
                        >
                          <IconFileDescription size={18} />
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-300 cursor-not-allowed"
                          title="Solo coordinadores pueden ver informes"
                        >
                          <IconLock size={16} />
                        </span>
                      )}
                    </td>

                    {/* Informe final */}
                    <td className="px-1 py-4 text-center">
                      {permissions.canViewAllReports ? (
                        <Link
                          to={`/private/dashboard/${PrivateRoutes.FINALREPORT}/${student.id}/${anioActual}`}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-tosca-600 hover:bg-tosca/10 rounded-lg transition-colors"
                          title="Ver informe final"
                        >
                          <IconFileDescription size={18} />
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-300 cursor-not-allowed"
                          title="Solo coordinadores pueden ver informes"
                        >
                          <IconLock size={16} />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Botón de guardar + errores de validación inline */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <IconAlertTriangle size={15} className="text-red-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-red-700">
                Corrige {validationErrors.length} {validationErrors.length === 1 ? 'error' : 'errores'} antes de guardar
              </span>
            </div>
            <ul className="space-y-0.5 pl-5 list-disc">
              {validationErrors.slice(0, 6).map((e, i) => (
                <li key={i} className="text-xs text-red-600">{e}</li>
              ))}
              {validationErrors.length > 6 && (
                <li className="text-xs text-red-500 font-medium">…y {validationErrors.length - 6} más</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={async () => {
              setValidationErrors([]);
              const result = await validarTodoAntesDeEnviar();
              if (!result.ok) {
                setValidationErrors(result.errores);
                return;
              }
              setModalPhase({ phase: 'confirm' });
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orchid-blue-60 rounded-lg shadow-sm transition-all duration-200 hover:bg-orchid-blue-70 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <IconLoader2 size={16} className="animate-spin" />}
            Guardar Calificaciones
          </button>
        </div>
      </div>

      {/* Modal con máquina de estados */}
      {modalPhase && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">

              {/* ── CONFIRMAR ── */}
              {modalPhase.phase === 'confirm' && (
                <>
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-orchid-blue-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconCheck size={20} className="text-orchid-blue-60" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Confirmar guardado</h3>
                        <p className="text-xs text-gray-500">Revisa el resumen antes de continuar</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg divide-y divide-gray-100 mb-5 text-sm">
                      {[
                        ['Asignatura', area?.asignatura || '—'],
                        ['Salón', classroom?.nombreSalon || '—'],
                        ['Período', periodId || '—'],
                        ['Estudiantes', String(students.length)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between px-4 py-2.5">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500">
                      Esta acción guardará las notas de <strong>{students.length}</strong> estudiante{students.length !== 1 ? 's' : ''}. Podrás editarlas después.
                    </p>
                  </div>

                  <div className="flex gap-3 px-6 pb-6">
                    <button
                      onClick={() => setModalPhase(null)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <IconX size={15} /> Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        setModalPhase({ phase: 'saving' });
                        try {
                          await enviarLote();
                          setModalPhase({ phase: 'success' });
                        } catch (err) {
                          setModalPhase({
                            phase: 'error',
                            message: err instanceof Error ? err.message : 'Error desconocido al guardar.',
                          });
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orchid-blue-60 rounded-lg hover:bg-orchid-blue-70 transition-all"
                    >
                      <IconCheck size={15} /> Confirmar
                    </button>
                  </div>
                </>
              )}

              {/* ── GUARDANDO ── */}
              {modalPhase.phase === 'saving' && (
                <div className="flex flex-col items-center justify-center px-6 py-12 gap-4">
                  <div className="w-14 h-14 bg-orchid-blue-10 rounded-full flex items-center justify-center">
                    <IconLoader2 size={28} className="text-orchid-blue-60 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800">Guardando calificaciones…</p>
                    <p className="text-xs text-gray-500 mt-1">Por favor espera, no cierres esta ventana.</p>
                  </div>
                </div>
              )}

              {/* ── ÉXITO ── */}
              {modalPhase.phase === 'success' && (
                <>
                  <div className="flex flex-col items-center justify-center px-6 pt-10 pb-6 gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
                      <IconCircleCheck size={32} className="text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-900">¡Calificaciones guardadas!</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Las notas de <strong>{students.length}</strong> estudiante{students.length !== 1 ? 's' : ''} fueron registradas correctamente.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => setModalPhase(null)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <IconCheck size={15} /> Cerrar
                    </button>
                  </div>
                </>
              )}

              {/* ── ERROR ── */}
              {modalPhase.phase === 'error' && (
                <>
                  <div className="flex flex-col items-center justify-center px-6 pt-10 pb-6 gap-4">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                      <IconAlertCircle size={30} className="text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-semibold text-gray-900">Error al guardar</p>
                      <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {modalPhase.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 px-6 pb-6">
                    <button
                      onClick={() => setModalPhase(null)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <IconX size={15} /> Cerrar
                    </button>
                    <button
                      onClick={() => setModalPhase({ phase: 'confirm' })}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orchid-blue-60 rounded-lg hover:bg-orchid-blue-70 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default GradeManager;
