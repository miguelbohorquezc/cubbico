/**
 * @fileoverview Lista de activos tecnológicos con DataTable
 * @module presentation/features/techAssets/TechAssetsList
 */

import { useEffect, useState } from 'react';
import DataTable from '../../components/datatable/DataTable';
import { TechAsset } from '../../../domain/entities/techAsset';
import {
  fetchTechAssets,
  deleteTechAsset
} from '../../../infrastructure/techAsset.service';
import Modal from '../../components/modal/Modal';
import TechAssetForm from './components/TechAssetForm';

/**
 * Componente de lista de activos tecnológicos
 */
const TechAssetsList = () => {
  const [assets, setAssets] = useState<TechAsset[]>([]);
  const [editingAsset, setEditingAsset] = useState<TechAsset | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para modales de confirmación y notificación
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    assetId: string;
    assetName: string;
  }>({
    isOpen: false,
    assetId: '',
    assetName: ''
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
   * Maneja el click en el botón de eliminar
   */
  const handleDeleteClick = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    setDeleteConfirm({
      isOpen: true,
      assetId,
      assetName: asset ? `${asset.tipo} ${asset.marca} ${asset.modelo}` : 'este activo'
    });
  };

  /**
   * Confirma y ejecuta la eliminación del activo
   */
  const handleDeleteConfirm = async () => {
    const { assetId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, assetId: '', assetName: '' });

    try {
      await deleteTechAsset(assetId);
      setAssets(assets.filter(a => a.id !== assetId));
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Activo eliminado con éxito'
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al eliminar activo. Por favor intente de nuevo.'
      });
    }
  };

  /**
   * Maneja el click en el botón de editar
   */
  const handleEdit = (asset: TechAsset) => {
    setEditingAsset(asset);
  };

  /**
   * Maneja el éxito al editar un activo
   */
  const handleEditSuccess = () => {
    setEditingAsset(null);
    // Recargar activos para obtener datos actualizados
    const reloadAssets = async () => {
      try {
        const assetsData = await fetchTechAssets();
        setAssets(assetsData);
      } catch (error) {
        console.error('Error reloading assets:', error);
      }
    };
    reloadAssets();
  };

  /**
   * Carga inicial de activos
   */
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetsData = await fetchTechAssets();
        setAssets(assetsData);
        console.log('Activos cargados:', assetsData);
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  /**
   * Definición de columnas para el DataTable
   */
  const columns = [
    {
      key: 'tipo',
      label: 'Tipo',
      render: (row: TechAsset) => (
        <span className="text-sm font-medium text-gray-900">
          {row.tipo}
        </span>
      )
    },
    {
      key: 'marca',
      label: 'Marca',
      render: (row: TechAsset) => (
        <span className="text-sm text-gray-700">
          {row.marca}
        </span>
      )
    },
    {
      key: 'modelo',
      label: 'Modelo',
      render: (row: TechAsset) => (
        <span className="text-sm text-gray-700">
          {row.modelo}
        </span>
      )
    },
    {
      key: 'serial',
      label: 'Serial',
      render: (row: TechAsset) => (
        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {row.serial}
        </span>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: TechAsset) => {
        const statusConfig = {
          disponible: {
            bg: 'bg-tosca-ds/10',
            text: 'text-tosca-cc',
            border: 'border-tosca-ds/30',
            label: 'Disponible',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )
          },
          asignado: {
            bg: 'bg-orchid-blue-10',
            text: 'text-orchid-blue-70',
            border: 'border-orchid-blue-30',
            label: 'Asignado',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )
          },
          mantenimiento: {
            bg: 'bg-yellow-ds/10',
            text: 'text-yellow-cc',
            border: 'border-yellow-ds/30',
            label: 'Mantenimiento',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )
          },
          dado_de_baja: {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
            label: 'Dado de Baja',
            icon: (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
      render: (asset: TechAsset) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(asset)}
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            title="Editar activo"
            aria-label="Editar activo"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(asset.id)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
            title="Eliminar activo"
            aria-label="Eliminar activo"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col w-full">
      <DataTable
        data={assets}
        columns={columns}
        isLoading={loading}
        exportFileName="activos-tecnologicos"
        initialItemsPerPage={10}
        enableExport={false}
        enablePagination={true}
        enableSearch={true}
        skeletonCount={10}
        tableSize={{
          width: '100%'
        }}
      />

      {/* Modal de Editar Activo */}
      <Modal
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        title="Editar Activo Tecnológico"
        size="lg"
      >
        {editingAsset && (
          <TechAssetForm
            mode="edit"
            initialData={{
              id: editingAsset.id,
              tipo: editingAsset.tipo,
              marca: editingAsset.marca,
              modelo: editingAsset.modelo,
              serial: editingAsset.serial,
              estado: editingAsset.estado,
              observaciones: editingAsset.observaciones,
            }}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingAsset(null)}
            showCancelButton={true}
          />
        )}
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-magenta-ds">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirmar Eliminación</h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar <strong>{deleteConfirm.assetName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, assetId: '', assetName: '' })}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-magenta-ds text-white rounded-lg hover:bg-magenta-cc transition-all duration-200 font-medium shadow-sm"
              >
                Eliminar
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

export default TechAssetsList;
