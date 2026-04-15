import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import type {
  CatedraSocioemocional,
  ProyectosTransversales,
} from '../../../domain/entities/catedraSocioemocional';
import {
  getCatedraBySalonYear,
  getProyectosTransversales,
} from '../../../infrastructure/catedraSocioemocional.service';

interface ReportExtraContentProps {
  classroomId: string | undefined;
  year: string | undefined;
  periodId: string | undefined;
  /** false en preescolar, true en primaria y secundaria */
  showCatedra: boolean;
}

type PeriodData = CatedraSocioemocional | ProyectosTransversales | null;

const getPeriodContent = (data: PeriodData, periodId: string | undefined): string => {
  if (!data || !periodId) return '';
  const key = `periodo${periodId}` as keyof PeriodData;
  const value = data[key];
  return typeof value === 'string' ? value : '';
};

const sanitize = (html: string): string =>
  html.replace(/<script[\s\S]*?<\/script>/gi, '');

const PendingAlert = () => (
  <div className="bg-amber-50 border border-amber-300 text-amber-700 px-3 py-2 rounded text-sm print:border print:border-amber-300">
    ⚠ Pendiente por diligenciar
  </div>
);

const SectionTable = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <table className="w-full border-collapse border border-indigo-200 mb-4">
    <thead className="bg-gray-100 print:bg-white">
      <tr>
        <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-100">
          <p>{title}</p>
        </td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="px-4 py-3 border border-gray-100 text-sm text-gray-800">
          {content ? (
            <div
              className="[&_ul]:list-disc [&_ul]:ml-4 [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: sanitize(content) }}
            />
          ) : (
            <PendingAlert />
          )}
        </td>
      </tr>
    </tbody>
  </table>
);

/**
 * Carga y muestra la cátedra socio emocional y proyectos transversales.
 * Autogestiona su propia carga desde Firestore usando classroomId + year.
 */
const ReportExtraContent = ({
  classroomId,
  year,
  periodId,
  showCatedra,
}: ReportExtraContentProps) => {
  const [catedra, setCatedra] = useState<CatedraSocioemocional | null>(null);
  const [proyectos, setProyectos] = useState<ProyectosTransversales | null>(null);

  useEffect(() => {
    if (!classroomId || !year) return;

    const load = async () => {
      try {
        // Obtener nivel y nombreSalon desde el documento del salón
        const classroomSnap = await getDoc(doc(db, 'classRooms', classroomId));
        if (!classroomSnap.exists()) return;

        const { nivel, nombreSalon } = classroomSnap.data() as {
          nivel: string;
          nombreSalon: string;
        };

        const [catedraResult, proyectosResult] = await Promise.all([
          nivel && nombreSalon
            ? getCatedraBySalonYear(nivel, nombreSalon, year)
            : Promise.resolve(null),
          getProyectosTransversales(year),
        ]);

        setCatedra(catedraResult);
        setProyectos(proyectosResult);
      } catch (err) {
        console.error('Error cargando cátedra / proyectos:', err);
      }
    };

    load();
  }, [classroomId, year]);

  const catedraContent = getPeriodContent(catedra, periodId);
  const proyectosContent = getPeriodContent(proyectos, periodId);

  return (
    <>
      {showCatedra && (
        <SectionTable
          title="CÁTEDRA SOCIO EMOCIONAL"
          content={catedraContent}
        />
      )}
      <SectionTable
        title="PROYECTOS TRANSVERSALES"
        content={proyectosContent}
      />
    </>
  );
};

export default ReportExtraContent;
