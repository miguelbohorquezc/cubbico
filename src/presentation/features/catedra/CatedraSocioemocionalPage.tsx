import { useState, useEffect, useCallback } from 'react';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import type { ClassRoom } from '../../../domain/entities/classRoom';
import type {
  CatedraSocioemocional,
  ProyectosTransversales,
} from '../../../domain/entities/catedraSocioemocional';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import {
  getCatedraByNivelYear,
  saveCatedra,
  getProyectosTransversales,
  saveProyectosTransversales,
} from '../../../infrastructure/catedraSocioemocional.service';
import MinimalRichEditor from './MinimalRichEditor';

// ── Sidebar sync ────────────────────────────────────────────────
const SIDEBAR_STORAGE_KEY = 'cubbico-sidebar-collapsed';

const useSidebarCollapsed = (): boolean => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'; } catch { return false; }
  });
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SIDEBAR_STORAGE_KEY) setIsCollapsed(e.newValue === 'true');
    };
    const poll = setInterval(() => {
      try { setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'); } catch { /* noop */ }
    }, 100);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(poll); };
  }, []);
  return isCollapsed;
};

// ── Constantes ──────────────────────────────────────────────────
type TabId = 'primaria' | 'secundaria' | 'proyectos';
type NivelKey = 'Primaria' | 'Secundaria'; // valores reales en Firestore

const PERIODS = ['1', '2', '3', '4'] as const;
type PeriodKey = 'periodo1' | 'periodo2' | 'periodo3' | 'periodo4';
const periodKey = (p: string): PeriodKey => `periodo${p}` as PeriodKey;

const YEAR = new Date().getFullYear().toString();

const defaultCatedra = (nivel: string, grado: string): CatedraSocioemocional => ({
  id: `${nivel}_${grado}_${YEAR}`,
  nivel,
  grado,
  year: YEAR,
  periodo1: '',
  periodo2: '',
  periodo3: '',
  periodo4: '',
});

const defaultProyectos = (): ProyectosTransversales => ({
  id: YEAR,
  year: YEAR,
  periodo1: '',
  periodo2: '',
  periodo3: '',
  periodo4: '',
});

// ── Componente ──────────────────────────────────────────────────
const CatedraSocioemocionalPage = () => {
  const isSidebarCollapsed = useSidebarCollapsed();
  const [activeTab, setActiveTab] = useState<TabId>('primaria');
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [catedraData, setCatedraData] = useState<Record<NivelKey, Record<string, CatedraSocioemocional>>>({
    Primaria: {},
    Secundaria: {},
  });
  const [proyectos, setProyectos] = useState<ProyectosTransversales>(defaultProyectos());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rooms = await fetchClassrooms();
      setClassrooms(rooms);

      const gradosPrimaria = [
        ...new Set(rooms.filter((r) => r.nivel === 'Primaria').map((r) => r.nombreSalon)),
      ];
      const gradosSecundaria = [
        ...new Set(rooms.filter((r) => r.nivel === 'Secundaria').map((r) => r.nombreSalon)),
      ];

      const [dataPrimaria, dataSecundaria, dataProyectos] = await Promise.all([
        getCatedraByNivelYear('Primaria', gradosPrimaria, YEAR),
        getCatedraByNivelYear('Secundaria', gradosSecundaria, YEAR),
        getProyectosTransversales(YEAR),
      ]);

      setCatedraData({ Primaria: dataPrimaria, Secundaria: dataSecundaria });
      setProyectos(dataProyectos ?? defaultProyectos());
    } catch (err) {
      console.error('Error cargando datos de cátedra:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateCatedraField = (nivel: NivelKey, grado: string, period: string, html: string) => {
    setCatedraData((prev) => ({
      ...prev,
      [nivel]: {
        ...prev[nivel],
        [grado]: {
          ...(prev[nivel][grado] ?? defaultCatedra(nivel, grado)),
          [periodKey(period)]: html,
        },
      },
    }));
  };

  const updateProyectosField = (period: string, html: string) => {
    setProyectos((prev) => ({ ...prev, [periodKey(period)]: html }));
  };

  const handleSaveCatedra = async (nivel: NivelKey) => {
    setSaving(true);
    try {
      await Promise.all(Object.values(catedraData[nivel]).map((e) => saveCatedra(e)));
      showToast('Guardado correctamente');
    } catch (err) {
      console.error('Error guardando cátedra:', err);
      showToast('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProyectos = async () => {
    setSaving(true);
    try {
      await saveProyectosTransversales(proyectos);
      showToast('Guardado correctamente');
    } catch (err) {
      console.error('Error guardando proyectos:', err);
      showToast('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const gradosForLevel = (nivel: NivelKey) =>
    [...new Set(classrooms.filter((r) => r.nivel === nivel).map((r) => r.nombreSalon))].sort();

  const tabs: { id: TabId; label: string }[] = [
    { id: 'primaria', label: 'Cátedra — Primaria' },
    { id: 'secundaria', label: 'Cátedra — Secundaria' },
    { id: 'proyectos', label: 'Proyectos Transversales' },
  ];

  const nivelKey = (tab: TabId): NivelKey =>
    tab === 'primaria' ? 'Primaria' : 'Secundaria';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title="Cátedra Socio Emocional"
          showDate
          showSearch={false}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto p-4 lg:p-6 min-h-0">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-gray-500 mb-6">
              Año académico <span className="font-medium">{YEAR}</span>
            </p>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Tab Cátedra Primaria / Secundaria */}
                {(activeTab === 'primaria' || activeTab === 'secundaria') && (
                  <div>
                    {gradosForLevel(nivelKey(activeTab)).length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay salones registrados para este nivel.</p>
                    ) : (
                      gradosForLevel(nivelKey(activeTab)).map((grado) => {
                        const nivel = nivelKey(activeTab);
                        const data = catedraData[nivel][grado] ?? defaultCatedra(nivel, grado);
                        return (
                          <div key={grado} className="mb-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                            <h2 className="text-base font-semibold text-gray-700 mb-4">
                              Grado: <span className="text-indigo-700">{grado}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {PERIODS.map((p) => (
                                <div key={p}>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Período {p}
                                  </label>
                                  <MinimalRichEditor
                                    value={data[periodKey(p)]}
                                    onChange={(html) => updateCatedraField(nivel, grado, p, html)}
                                    placeholder={`Redacta el contenido del período ${p}...`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {gradosForLevel(nivelKey(activeTab)).length > 0 && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleSaveCatedra(nivelKey(activeTab))}
                          disabled={saving}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Proyectos Transversales */}
                {activeTab === 'proyectos' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      Este contenido aparecerá en todos los informes (primaria, secundaria y preescolar).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PERIODS.map((p) => (
                        <div key={p}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Período {p}
                          </label>
                          <MinimalRichEditor
                            value={proyectos[periodKey(p)]}
                            onChange={(html) => updateProyectosField(p, html)}
                            placeholder={`Redacta los proyectos transversales del período ${p}...`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleSaveProyectos}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CatedraSocioemocionalPage;
