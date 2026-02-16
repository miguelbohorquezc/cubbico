/**
 * @fileoverview Página principal de gestión de activos tecnológicos
 * @module presentation/pages/private/Dashboard/components/TechAssetsPage
 */

import { useState, useEffect } from 'react';
import { SidebarV2 } from '../../../../components/sidebarV2';
import { HeaderV2 } from '../../../../components/headerV2';
import Modal from '../../../../components/modal/Modal';
import TechAssetsList from '../../../../features/techAssets/TechAssetsList';
import AssetAssignmentsList from '../../../../features/techAssets/AssetAssignmentsList';
import TechAssetForm from '../../../../features/techAssets/components/TechAssetForm';
import AssetAssignmentForm from '../../../../features/techAssets/components/AssetAssignmentForm';
import ExportAssetsCSV from '../../../../features/techAssets/components/ExportAssetsCSV';
import ExportAssignmentsCSV from '../../../../features/techAssets/components/ExportAssignmentsCSV';
import { IconDeviceLaptop, IconUsers, IconPlus, IconFileExport } from '@tabler/icons-react';
import { fetchTechAssets, fetchAvailableAssets } from '../../../../../infrastructure/techAsset.service';
import { fetchAssignments } from '../../../../../infrastructure/assetAssignment.service';
import { TechAsset } from '../../../../../domain/entities/techAsset';
import { AssetAssignment } from '../../../../../domain/entities/assetAssignment';

// Key del localStorage usada por useSidebarV2
const SIDEBAR_STORAGE_KEY = 'cubbico-sidebar-collapsed';

/**
 * Hook para sincronizar con el estado del sidebar en localStorage
 */
const useSidebarCollapsed = (): boolean => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleSidebarChange = () => {
      try {
        setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
      } catch {
        // Ignorar errores
      }
    };

    const interval = setInterval(handleSidebarChange, 100);
    return () => clearInterval(interval);
  }, []);

  return isCollapsed;
};

/**
 * Tipos de tabs disponibles
 */
type TabType = 'activos' | 'asignaciones';

/**
 * Página principal de gestión de activos tecnológicos
 */
function TechAssetsPage() {
  const isSidebarCollapsed = useSidebarCollapsed();

  // Estado de tabs
  const [activeTab, setActiveTab] = useState<TabType>('activos');

  // Estado de modales
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Estado de datos
  const [assets, setAssets] = useState<TechAsset[]>([]);
  const [availableAssets, setAvailableAssets] = useState<TechAsset[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga todos los datos necesarios
   */
  const loadData = async () => {
    await Promise.all([
      loadAssets(),
      loadAssignments()
    ]);
  };

  /**
   * Carga los activos
   */
  const loadAssets = async () => {
    try {
      setLoadingAssets(true);
      const [allAssets, available] = await Promise.all([
        fetchTechAssets(),
        fetchAvailableAssets()
      ]);
      console.log('📦 Total de activos:', allAssets.length);
      console.log('✅ Activos disponibles:', available.length);
      console.log('🔍 Detalles de disponibles:', available);
      setAssets(allAssets);
      setAvailableAssets(available);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  /**
   * Carga las asignaciones
   */
  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const assignmentsData = await fetchAssignments();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  /**
   * Maneja el éxito al crear un activo
   */
  const handleAssetSuccess = () => {
    console.log('✅ Activo creado exitosamente, recargando lista...');
    setIsAssetModalOpen(false);
    loadAssets();
  };

  /**
   * Maneja el éxito al crear una asignación
   */
  const handleAssignmentSuccess = () => {
    setIsAssignmentModalOpen(false);
    loadData(); // Recargar todo porque la asignación afecta el estado del activo
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Activos Tecnológicos"
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-orchid-blue-60 rounded-lg">
                <IconDeviceLaptop size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Activos Tecnológicos
                </h1>
                <p className="text-xs text-gray-500">
                  Administra los activos tecnológicos y sus asignaciones
                </p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('activos')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === 'activos'
                      ? 'border-orchid-blue-60 text-orchid-blue-60'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <IconDeviceLaptop size={18} />
                    <span>Activos</span>
                    {!loadingAssets && (
                      <span className={`
                        ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                        ${activeTab === 'activos'
                          ? 'bg-orchid-blue-10 text-orchid-blue-70'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {assets.length}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('asignaciones')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === 'asignaciones'
                      ? 'border-orchid-blue-60 text-orchid-blue-60'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <IconUsers size={18} />
                    <span>Asignaciones</span>
                    {!loadingAssignments && (
                      <span className={`
                        ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                        ${activeTab === 'asignaciones'
                          ? 'bg-orchid-blue-10 text-orchid-blue-70'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {assignments.length}
                      </span>
                    )}
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content: Activos */}
          {activeTab === 'activos' && (
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExportAssetsCSV assets={assets} />
                </div>
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2.5 text-sm font-medium
                    bg-orchid-blue-60
                    text-white rounded-lg
                    hover:bg-orchid-blue-70
                    transition-all duration-200
                  "
                >
                  <IconPlus size={18} />
                  <span>Registrar Activo</span>
                </button>
              </div>

              {/* Assets List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100/80 p-4 lg:p-6">
                <TechAssetsList />
              </div>
            </div>
          )}

          {/* Tab Content: Asignaciones */}
          {activeTab === 'asignaciones' && (
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExportAssignmentsCSV assignments={assignments} />
                </div>
                <button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  disabled={availableAssets.length === 0}
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2.5 text-sm font-medium
                    bg-orchid-blue-60
                    text-white rounded-lg
                    hover:bg-orchid-blue-70
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                  title={availableAssets.length === 0 ? 'No hay activos disponibles para asignar' : 'Asignar activo a usuario'}
                >
                  <IconPlus size={18} />
                  <span>Asignar Activo</span>
                </button>
              </div>

              {/* Assignments List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100/80 p-4 lg:p-6">
                <AssetAssignmentsList />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal para registrar activo */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title="Registrar Activo Tecnológico"
        size="lg"
      >
        <TechAssetForm
          mode="create"
          onSuccess={handleAssetSuccess}
          onCancel={() => setIsAssetModalOpen(false)}
          showCancelButton={true}
        />
      </Modal>

      {/* Modal para asignar activo */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Asignar Activo Tecnológico"
        size="lg"
      >
        <AssetAssignmentForm
          availableAssets={availableAssets}
          onSuccess={handleAssignmentSuccess}
          onCancel={() => setIsAssignmentModalOpen(false)}
          showCancelButton={true}
        />
      </Modal>
    </div>
  );
}

export default TechAssetsPage;
