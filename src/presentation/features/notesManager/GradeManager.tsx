import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PrivateRoutes } from '../../../app/routes/routes';
import { useAppSelector } from '../../../app/store/store';
import InputField from './InputField';
import { IconFileDescription, IconLoader2, IconAlertCircle, IconUsersGroup, IconCheck, IconX, IconLock } from '@tabler/icons-react';
import { usePermissions } from '../../hooks/usePermissions';

import { useValidadores } from './useValidadores';
import { useCargarEstudiantesYNotas } from './useCargarEstudiantesYNotas';
import { useConstruirYEnviarLote } from './useConstruirYEnviarLote';
import { Student, CampoCalificacion } from './types';

const GradeManager: React.FC = () => {
  const { periodId, classroomId, areaId } = useParams<{
    periodId: string;
    classroomId: string;
    areaId: string;
  }>();

  // Estado para modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Permisos del usuario
  const { isCoordinator, permissions } = usePermissions();

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
        <IconLoader2 size={32} className="text-blue-500 animate-spin mb-3" />
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
              <th className="px-2 py-3 text-center text-xs font-semibold text-blue-600 uppercase tracking-wider w-20">
                L1
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-blue-600 uppercase tracking-wider w-20">
                L2
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-blue-600 uppercase tracking-wider w-20">
                L3
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-amber-600 uppercase tracking-wider w-20">
                Fallas
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-red-600 uppercase tracking-wider w-20">
                F. Injust.
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-emerald-600 uppercase tracking-wider w-20">
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

                    {/* Fallas */}
                    <td className="px-1 py-4 text-center">
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

                    {/* Fallas injustificadas */}
                    <td className="px-1 py-4 text-center">
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

                    {/* Promedio */}
                    <td className="px-2 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-lg">
                        {calcularPromedio(g.l1, g.l2, g.l3)}
                      </span>
                    </td>

                    {/* Informe de período */}
                    <td className="px-1 py-4 text-center">
                      {permissions.canViewAllReports ? (
                        <Link
                          to={`/private/dashboard/${PrivateRoutes.REPORT}/${classroom?.nivel}/${periodId}/${classroom?.directorGrupo}/${student.id}/2025`}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                          to={`/private/dashboard/${PrivateRoutes.FINALREPORT}/${student.id}/2025`}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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

      {/* Botón de guardar */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={async () => {
            const isValid = await validarTodoAntesDeEnviar();
            if (isValid) {
              setShowConfirmModal(true);
            }
          }}
          disabled={loading || isSaving}
          className="
            inline-flex items-center gap-2 px-6 py-2.5
            text-sm font-semibold text-white
            bg-gradient-to-r from-emerald-500 to-teal-600
            rounded-lg shadow-sm
            transition-all duration-200
            hover:from-emerald-600 hover:to-teal-700 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-emerald-300
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {(loading || isSaving) && <IconLoader2 size={16} className="animate-spin" />}
          Guardar Calificaciones
        </button>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <IconCheck size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar guardado</h3>
                <p className="text-sm text-gray-500">Revisa antes de continuar</p>
              </div>
            </div>

            {/* Contenido */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Asignatura:</span>
                  <span className="font-medium text-gray-900">{area?.asignatura || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salón:</span>
                  <span className="font-medium text-gray-900">{classroom?.nombreSalon || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-medium text-gray-900">{periodId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estudiantes:</span>
                  <span className="font-medium text-gray-900">{students.length}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de guardar las calificaciones? Esta acción registrará las notas de todos los estudiantes.
            </p>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSaving}
                className="
                  flex-1 px-4 py-2.5
                  text-sm font-medium text-gray-700
                  bg-gray-100 rounded-lg
                  transition-colors
                  hover:bg-gray-200
                  disabled:opacity-50
                "
              >
                <span className="flex items-center justify-center gap-2">
                  <IconX size={16} />
                  Cancelar
                </span>
              </button>
              <button
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    await enviarLote();
                    setShowConfirmModal(false);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="
                  flex-1 px-4 py-2.5
                  text-sm font-semibold text-white
                  bg-gradient-to-r from-emerald-500 to-teal-600
                  rounded-lg
                  transition-all duration-200
                  hover:from-emerald-600 hover:to-teal-700
                  disabled:opacity-60
                "
              >
                <span className="flex items-center justify-center gap-2">
                  {isSaving ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <IconCheck size={16} />
                      Confirmar
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeManager;
