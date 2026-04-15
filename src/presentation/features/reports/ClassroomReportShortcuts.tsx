import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import type { ClassRoom } from '../../../domain/entities/classRoom';

const YEAR = new Date().getFullYear().toString();
const PERIODS = ['1', '2', '3', '4'] as const;

const NIVEL_ORDER: Record<string, number> = { Primaria: 1, Secundaria: 2, Preescolar: 3 };

const NIVEL_COLORS: Record<string, { bg: string; badge: string; text: string; btn: string; btnHover: string }> = {
  Primaria: {
    bg: 'bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    text: 'text-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    btnHover: '',
  },
  Secundaria: {
    bg: 'bg-violet-50 border-violet-100',
    badge: 'bg-violet-100 text-violet-700',
    text: 'text-violet-800',
    btn: 'bg-violet-600 hover:bg-violet-700 text-white',
    btnHover: '',
  },
  Preescolar: {
    bg: 'bg-emerald-50 border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-800',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    btnHover: '',
  },
};

const fallback = {
  bg: 'bg-gray-50 border-gray-100',
  badge: 'bg-gray-100 text-gray-600',
  text: 'text-gray-800',
  btn: 'bg-gray-600 hover:bg-gray-700 text-white',
  btnHover: '',
};

export default function ClassroomReportShortcuts() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassrooms()
      .then((rooms) => {
        const sorted = [...rooms].sort((a, b) => {
          const orderA = NIVEL_ORDER[a.nivel] ?? 9;
          const orderB = NIVEL_ORDER[b.nivel] ?? 9;
          if (orderA !== orderB) return orderA - orderB;
          return a.nombreSalon.localeCompare(b.nombreSalon);
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
      <div className="flex gap-3 mt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 flex-1 rounded-xl bg-gray-100 animate-pulse" />
        ))}
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
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">
        Acceso rápido — Informes por salón <span className="font-normal text-gray-400">{YEAR}</span>
      </h2>

      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => (NIVEL_ORDER[a] ?? 9) - (NIVEL_ORDER[b] ?? 9))
          .map(([nivel, rooms]) => {
            const colors = NIVEL_COLORS[nivel] ?? fallback;
            return (
              <div key={nivel}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {nivel}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {rooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className={`rounded-xl border p-3 ${colors.bg} flex flex-col gap-2`}
                    >
                      {/* Nombre del salón */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {nivel}
                        </span>
                        <span className={`text-sm font-semibold capitalize truncate ${colors.text}`}>
                          {classroom.nombreSalon}
                        </span>
                      </div>

                      {/* Botones de período */}
                      <div className="grid grid-cols-4 gap-1">
                        {PERIODS.map((p) => (
                          <button
                            key={p}
                            onClick={() => goToReport(classroom, p)}
                            className={`text-xs font-semibold py-1 rounded-lg transition-colors ${colors.btn}`}
                            title={`Ver informes período ${p}`}
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
