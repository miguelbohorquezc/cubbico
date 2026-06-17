import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBook2, IconSchool, IconStar, IconFileReport } from '@tabler/icons-react';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import type { ClassRoom } from '../../../domain/entities/classRoom';

const YEAR = new Date().getFullYear().toString();
const PERIODS = ['1', '2', '3', '4'] as const;

const NIVEL_ORDER: Record<string, number> = { Primaria: 1, Secundaria: 2, Preescolar: 3 };

interface NivelStyle {
  section: string;
  card: string;
  header: string;
  icon: string;
  badge: string;
  label: string;
  btn: string;
  btnText: string;
  Icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const NIVEL_STYLES: Record<string, NivelStyle> = {
  Primaria: {
    section: 'text-orchid-bg-white',
    card: 'bg-white border border-gray-20 hover:border-orchid-blue-30 hover:shadow-md',
    header: 'bg-white border-b border-gray-20',
    icon: 'text-orchid-blue-60',
    badge: 'bg-tosca-ds/10 text-orchid-blue-70 border border-orchid-blue-30',
    label: 'text-gray-80',
    btn: 'bg-orchid-blue-60 hover:bg-orchid-blue-70',
    btnText: 'text-white',
    Icon: IconBook2,
  },
  Secundaria: {
    section: 'text-tosca-cc',
    card: 'bg-white border border-gray-20 hover:border-tosca-ds/40 hover:shadow-md',
    header: 'bg-tosca-ds/10 border-b border-gray-20',
    icon: 'text-tosca-cc',
    badge: 'bg-tosca-ds/10 text-tosca-cc border border-tosca-ds/30',
    label: 'text-gray-80',
    btn: 'bg-tosca-cc hover:bg-tosca-ds',
    btnText: 'text-white',
    Icon: IconSchool,
  },
  Preescolar: {
    section: 'text-yellow-cc',
    card: 'bg-white border border-gray-20 hover:border-yellow-ds/40 hover:shadow-md',
    header: 'bg-yellow-ds/10 border-b border-gray-20',
    icon: 'text-yellow-cc',
    badge: 'bg-yellow-ds/10 text-yellow-cc border border-yellow-ds/30',
    label: 'text-gray-80',
    btn: 'bg-yellow-cc hover:bg-yellow-ds',
    btnText: 'text-white',
    Icon: IconStar,
  },
};

const FALLBACK_STYLE: NivelStyle = {
  section: 'text-gray-70',
  card: 'bg-white border border-gray-20 hover:shadow-md',
  header: 'bg-gray-5 border-b border-gray-20',
  icon: 'text-gray-60',
  badge: 'bg-gray-10 text-gray-70 border border-gray-30',
  label: 'text-gray-80',
  btn: 'bg-orchid-blue-60 hover:bg-orchid-blue-70',
  btnText: 'text-white',
  Icon: IconFileReport,
};

export default function ClassroomReportShortcuts() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassrooms()
      .then((rooms) => {
        const sorted = [...rooms].sort((a, b) => {
          const oa = NIVEL_ORDER[a.nivel] ?? 9;
          const ob = NIVEL_ORDER[b.nivel] ?? 9;
          return oa !== ob ? oa - ob : a.nombreSalon.localeCompare(b.nombreSalon);
        });
        setClassrooms(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const goToReport = (classroom: ClassRoom, period: string) => {
    const nivel = classroom.nivel.toLowerCase();
    navigate(`/private/dashboard/informe/salon/${nivel}/${period}/${classroom.id}/${YEAR}`);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="h-4 w-48 bg-gray-10 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!classrooms.length) return null;

  // Agrupar por nivel
  const grouped: Record<string, ClassRoom[]> = {};
  classrooms.forEach((c) => {
    if (!grouped[c.nivel]) grouped[c.nivel] = [];
    grouped[c.nivel].push(c);
  });

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <IconFileReport size={18} className="text-gray-60" />
        <h2 className="text-m font-semibold text-gray-80">
          Informes por salón
        </h2>
        <span className="text-xs text-gray-50 font-normal">· {YEAR}</span>
      </div>

      <div className="space-y-5">
        {Object.entries(grouped)
          .sort(([a], [b]) => (NIVEL_ORDER[a] ?? 9) - (NIVEL_ORDER[b] ?? 9))
          .map(([nivel, rooms]) => {
            const s = NIVEL_STYLES[nivel] ?? FALLBACK_STYLE;
            const { Icon } = s;
            return (
              <div key={nivel}>
                {/* Etiqueta de nivel */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={14} className={s.section} />
                  <p className={`text-xs font-bold uppercase tracking-wider ${s.section}`}>
                    {nivel}
                  </p>
                </div>

                {/* Grid de tarjetas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {rooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className={`rounded-xl overflow-hidden transition-all duration-200 ${s.card}`}
                    >
                      {/* Header de la tarjeta */}
                      <div className={`flex items-center gap-2 px-3 py-2.5 ${s.header}`}>
                        <Icon size={15} className={s.icon} />
                        <span className={`text-sm font-semibold capitalize truncate ${s.label}`}>
                          {classroom.nombreSalon}
                        </span>
                        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${s.badge}`}>
                          {nivel.slice(0, 3).toUpperCase()}
                        </span>
                      </div>

                      {/* Botones de período */}
                      <div className="grid grid-cols-4 gap-1 p-2">
                        {PERIODS.map((p) => (
                          <button
                            key={p}
                            onClick={() => goToReport(classroom, p)}
                            className={`text-xs font-bold py-1.5 rounded-lg transition-colors ${s.btn} ${s.btnText}`}
                            title={`Informes período ${p} · ${classroom.nombreSalon}`}
                          >
                            P{p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
