/**
 * @fileoverview Página contenedora del Creador Rápido de Horario (solo Coordinador)
 * @module presentation/features/schedule/QuickScheduleCreatorPage
 *
 * Envuelve QuickScheduleCreator con el layout estándar (sidebar + header).
 * Ruta: /private/dashboard/horario-rapido
 */

import { useState, useEffect } from 'react';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import QuickScheduleCreator from './QuickScheduleCreator';
import { IconBolt } from '@tabler/icons-react';

const SIDEBAR_KEY = 'cubbico-sidebar-collapsed';

function useSidebarCollapsed(): boolean {
  const [c, setC] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  useEffect(() => {
    const t = setInterval(() => {
      try { setC(localStorage.getItem(SIDEBAR_KEY) === 'true'); } catch { /* noop */ }
    }, 100);
    return () => clearInterval(t);
  }, []);
  return c;
}

export default function QuickScheduleCreatorPage() {
  const isSidebarCollapsed = useSidebarCollapsed();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title="Creador Rápido de Horario"
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="h-16 flex-shrink-0" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          {/* Page header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orchid-blue-60 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconBolt size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Asignación Rápida de Horario</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Selecciona el docente y sus datos se cargan automáticamente.
                Asigna día, hora y duración en segundos.
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <QuickScheduleCreator />
          </div>
        </main>
      </div>
    </div>
  );
}
