/**
 * @fileoverview Lista de asignaciones de activos tecnológicos con DataTable
 * @module presentation/features/techAssets/AssetAssignmentsList
 */

import { useEffect, useState } from 'react';
import DataTable from '../../components/datatable/DataTable';
import { AssetAssignment } from '../../../domain/entities/assetAssignment';
import {
  fetchAssignments,
  updateAssignment
} from '../../../infrastructure/assetAssignment.service';
import { updateTechAsset } from '../../../infrastructure/techAsset.service';

/**
 * Componente de lista de asignaciones de activos tecnológicos
 */
const AssetAssignmentsList = () => {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [returnConfirm, setReturnConfirm] = useState<{
    isOpen: boolean;
    assignmentId: string;
    assetName: string;
  }>({
    isOpen: false,
    assignmentId: '',
    assetName: ''
  });

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    assignment: AssetAssignment | null;
  }>({
    isOpen: false,
    assignment: null
  });

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  /**
   * Maneja el click en el botón de devolver
   */
  const handleReturnClick = (assignment: AssetAssignment) => {
    setReturnConfirm({
      isOpen: true,
      assignmentId: assignment.id,
      assetName: `${assignment.assetTipo} ${assignment.assetMarca} ${assignment.assetModelo}`
    });
  };

  /**
   * Confirma y ejecuta la devolución del activo
   */
  const handleReturnConfirm = async () => {
    const { assignmentId } = returnConfirm;
    const assignment = assignments.find(a => a.id === assignmentId);

    setReturnConfirm({ isOpen: false, assignmentId: '', assetName: '' });

    if (!assignment) return;

    try {
      // Actualizar el estado de la asignación a devuelta
      await updateAssignment(assignmentId, {
        estado: 'devuelta',
        fechaDevolucion: new Date()
      });

      // Actualizar el estado del activo a disponible
      await updateTechAsset(assignment.assetId, {
        estado: 'disponible'
      });

      // Actualizar la lista local
      setAssignments(prevAssignments =>
        prevAssignments.map(a =>
          a.id === assignmentId
            ? { ...a, estado: 'devuelta', fechaDevolucion: new Date() }
            : a
        )
      );

      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Activo marcado como devuelto exitosamente'
      });
    } catch (error) {
      console.error('Error al devolver activo:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al marcar como devuelto. Por favor intente de nuevo.'
      });
    }
  };

  /**
   * Maneja el click en el botón de ver detalles
   */
  const handleDetailsClick = (assignment: AssetAssignment) => {
    setDetailsModal({
      isOpen: true,
      assignment
    });
  };

  /**
   * Carga inicial de asignaciones
   */
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const assignmentsData = await fetchAssignments();
        setAssignments(assignmentsData);
        console.log('📋 Asignaciones cargadas:', assignmentsData.length);
        assignmentsData.forEach((a, index) => {
          console.log(`📌 Asignación ${index + 1}:`, {
            userName: a.userName,
            userType: a.userType,
            fechaDevolucion: a.fechaDevolucion,
            estado: a.estado
          });
        });
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  /**
   * Formatea una fecha para mostrar
   */
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Definición de columnas para el DataTable
   */
  const columns = [
    {
      key: 'activo',
      label: 'Activo',
      render: (row: AssetAssignment) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {row.assetTipo}
          </span>
          <span className="text-xs text-gray-500">
            {row.assetMarca} {row.assetModelo}
          </span>
        </div>
      )
    },
    {
      key: 'serial',
      label: 'Serial',
      render: (row: AssetAssignment) => (
        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {row.assetSerial}
        </span>
      )
    },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (row: AssetAssignment) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {row.userName}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {row.userType}
          </span>
        </div>
      )
    },
    {
      key: 'fechaEntrega',
      label: 'Fecha Entrega',
      render: (row: AssetAssignment) => (
        <span className="text-sm text-gray-700">
          {formatDate(row.fechaEntrega)}
        </span>
      )
    },
    {
      key: 'fechaDevolucion',
      label: 'Fecha Devolución',
      render: (row: AssetAssignment) => (
        <span className="text-sm text-gray-700">
          {formatDate(row.fechaDevolucion)}
        </span>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: AssetAssignment) => {
        const statusConfig = {
          activa: {
            bg: 'bg-tosca-ds/10',
            text: 'text-tosca-cc',
            border: 'border-tosca-ds/30',
            label: 'Activa',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          devuelta: {
            bg: 'bg-orchid-blue-10',
            text: 'text-orchid-blue-70',
            border: 'border-orchid-blue-30',
            label: 'Devuelta',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )
          },
          perdida: {
            bg: 'bg-magenta-ds/10',
            text: 'text-magenta-cc',
            border: 'border-magenta-ds/30',
            label: 'Perdida',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )
          },
          dañada: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            label: 'Dañada',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          }
        };

        const config = statusConfig[row.estado];

        return (
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1
            text-xs font-semibold rounded-lg border
            ${config.bg} ${config.text} ${config.border}
          `}>
            {config.icon}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (assignment: AssetAssignment) => (
        <div className="flex items-center gap-1">
          {assignment.estado === 'activa' && (
            <button
              onClick={() => handleReturnClick(assignment)}
              className="p-2 rounded-lg text-gray-500 hover:text-tosca-cc hover:bg-tosca-ds/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tosca-ds/30"
              title="Marcar como devuelta"
              aria-label="Marcar como devuelta"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>
          )}
          <button
            onClick={() => handleDetailsClick(assignment)}
            className="p-2 rounded-lg text-gray-500 hover:text-orchid-blue-70 hover:bg-orchid-blue-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orchid-blue-30"
            title="Ver detalles"
            aria-label="Ver detalles"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )
    }
  ] as any;

  return (
    <div className="flex flex-col w-full">
      <DataTable
        data={assignments}
        columns={columns}
        isLoading={loading}
        exportFileName="asignaciones-activos"
        initialItemsPerPage={10}
        enableExport={false}
        enablePagination={true}
        enableSearch={true}
        skeletonCount={10}
        tableSize={{
          width: '100%'
        }}
      />

      {/* Modal de Confirmación de Devolución */}
      {returnConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-tosca-ds">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirmar Devolución</h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas marcar como devuelto <strong>{returnConfirm.assetName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                El activo quedará disponible para nuevas asignaciones.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setReturnConfirm({ isOpen: false, assignmentId: '', assetName: '' })}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleReturnConfirm}
                className="px-5 py-2.5 bg-tosca-ds text-white rounded-lg hover:bg-tosca-cc transition-all duration-200 font-medium shadow-sm"
              >
                Marcar como Devuelta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {detailsModal.isOpen && detailsModal.assignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-orchid-blue-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Detalles de la Asignación</h3>
                  </div>
                </div>
                <button
                  onClick={() => setDetailsModal({ isOpen: false, assignment: null })}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información del Activo */}
                <div className="col-span-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    Información del Activo
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Tipo:</span>
                      <p className="text-sm font-medium text-gray-900">{detailsModal.assignment.assetTipo}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Marca:</span>
                      <p className="text-sm font-medium text-gray-900">{detailsModal.assignment.assetMarca}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Modelo:</span>
                      <p className="text-sm font-medium text-gray-900">{detailsModal.assignment.assetModelo}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Serial:</span>
                      <p className="text-sm font-mono font-medium text-gray-900">{detailsModal.assignment.assetSerial}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Usuario */}
                <div className="col-span-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    Información del Usuario
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Nombre:</span>
                      <p className="text-sm font-medium text-gray-900">{detailsModal.assignment.userName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Tipo:</span>
                      <p className="text-sm font-medium text-gray-900 capitalize">{detailsModal.assignment.userType}</p>
                    </div>
                  </div>
                </div>

                {/* Información de la Asignación */}
                <div className="col-span-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    Información de la Asignación
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Fecha de Entrega:</span>
                      <p className="text-sm font-medium text-gray-900">{formatDate(detailsModal.assignment.fechaEntrega)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Fecha de Devolución:</span>
                      <p className="text-sm font-medium text-gray-900">{formatDate(detailsModal.assignment.fechaDevolucion)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Quien Entrega:</span>
                      <p className="text-sm font-medium text-gray-900">{detailsModal.assignment.quienEntrega}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Estado:</span>
                      <p className="text-sm font-medium text-gray-900 capitalize">{detailsModal.assignment.estado}</p>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {detailsModal.assignment.observaciones && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Observaciones</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {detailsModal.assignment.observaciones}
                    </p>
                  </div>
                )}

                {/* Descripción de Daños */}
                {detailsModal.assignment.descripcionDanios && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Descripción de Daños</h4>
                    <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                      {detailsModal.assignment.descripcionDanios}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setDetailsModal({ isOpen: false, assignment: null })}
                className="px-5 py-2.5 bg-orchid-blue-60 text-white rounded-lg hover:bg-orchid-blue-70 transition-all duration-200 font-medium shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificación */}
      {notification.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`px-6 py-4 ${notification.type === 'success' ? 'bg-tosca-ds' : 'bg-magenta-ds'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  {notification.type === 'success' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {notification.type === 'success' ? 'Éxito' : 'Error'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700">{notification.message}</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setNotification({ isOpen: false, type: 'success', message: '' })}
                className={`px-5 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-sm ${
                  notification.type === 'success' ? 'bg-tosca-ds hover:bg-tosca-cc' : 'bg-orchid-blue-60 hover:bg-orchid-blue-70'
                }`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetAssignmentsList;
