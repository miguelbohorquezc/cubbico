// src/pages/private/Dashboard/director/FinalReport.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../../infrastructure/firebase/firebase";

import logo from "../../../../../assets/logo/logotipo.jpg";
import firmOne from "../../../../../assets/firm/01.jpg";
import firmTwo from "../../../../../assets/firm/02.jpg";
import { usePrintSetup } from "../../../../components/PrintableReport";

// ---------- Tipos ----------
type AreaPeriodGrades = {
  l1?: number;
  l2?: number;
  l3?: number;
  fallas?: number;
  fallasVerificadas?: number;
};

type FinalAreaRow = {
  areaId: string;
  periodAverages: Record<string, number | null>;
  finalAverage: number | null;
  fallasTotal: number;
};

type FinalReportData = {
  meta: {
    studentId: string;
    studentName?: string;
    classroom?: string;
    classroomId?: string;
    year: string;
    generatedAt: string;
  };
  areas: FinalAreaRow[];
  generalAverage: number | null;
};

// ---------- Helpers ----------
function avgTriplet(g?: { l1?: number; l2?: number; l3?: number }) {
  const parts = [g?.l1, g?.l2, g?.l3].filter(
    (x): x is number => typeof x === "number"
  );
  if (parts.length === 0) return null;
  const sum = parts.reduce((a, b) => a + b, 0);
  return sum / parts.length;
}

function inferPeriodsFromRows(rows: FinalAreaRow[]): string[] {
  const first = rows[0];
  return first ? Object.keys(first.periodAverages) : ["1", "2", "3", "4"];
}

const formatDateShort = (d: Date) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);

// ---------- Fetch de metadatos de Áreas ----------
type AreasMeta = {
  labels: Record<string, string>;
  order: Record<string, number>;
};

async function fetchAreasMeta(): Promise<AreasMeta> {
  const snap = await getDocs(collection(db, "areas"));
  const labels: Record<string, string> = {};
  const order: Record<string, number> = {};

  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;
    const label =
      data?.asignatura || data?.area || data?.name || "Área sin nombre";
    labels[docSnap.id] = label;
    if (typeof data?.orden === "number") order[docSnap.id] = data.orden;
  });

  return { labels, order };
}

// ---------- Student + Classroom ----------
type StudentInfo = {
  name?: string;
  lastName?: string;
  classroomId?: string;
  classroomName?: string;
};

async function fetchStudentInfo(studentId: string): Promise<StudentInfo> {
  try {
    const sSnap = await getDoc(doc(db, "student", studentId));
    if (!sSnap.exists()) return {};
    const s = sSnap.data() as any;

    const name = s?.name || s?.firstName || s?.nombres;
    const lastName = s?.lastName || s?.apellido || s?.apellidos;
    const classroomId = s?.classroomId || s?.classRoomId || s?.class_id;
    const classroomName = s?.className || s?.classroomName || s?.grado;
    return { name, lastName, classroomId, classroomName };
  } catch {
    return {};
  }
}

async function fetchClassroomMeta(
  classroomId?: string
): Promise<{ name?: string; directorName?: string }> {
  if (!classroomId) return {};
  try {
    const cSnap = await getDoc(doc(db, "classRooms", classroomId));
    if (!cSnap.exists()) return {};
    const c = cSnap.data() as any;

    const name = c?.name || c?.className || c?.grado || c?.grade;
    const directorName =
      c?.directorGrupo ||
      c?.director ||
      c?.homeroomTeacher ||
      c?.tutor ||
      c?.dirGrupo ||
      c?.teacherName ||
      c?.docenteDirector ||
      undefined;

    return { name, directorName };
  } catch {
    return {};
  }
}

function extractClassroomIdFromHistory(periodsObj: any): string | undefined {
  const pKeys = Object.keys(periodsObj || {});
  for (const p of pKeys) {
    const areas = periodsObj[p]?.areas || {};
    for (const a of Object.keys(areas)) {
      const cid = areas[a]?.metadata?.classroomId;
      if (typeof cid === "string" && cid) return cid;
    }
  }
  return undefined;
}

function extractTeacherIdFromHistory(periodsObj: any): string | undefined {
  const pKeys = Object.keys(periodsObj || {});
  for (const p of pKeys) {
    const areas = periodsObj[p]?.areas || {};
    for (const a of Object.keys(areas)) {
      const tid = areas[a]?.metadata?.teacherId;
      if (typeof tid === "string" && tid) return tid;
    }
  }
  return undefined;
}

async function fetchTeacherName(teacherId?: string): Promise<string | undefined> {
  if (!teacherId) return undefined;

  const tryCollections = ["teachers", "teacher", "users"];
  for (const col of tryCollections) {
    try {
      const tSnap = await getDoc(doc(db, col, teacherId));
      if (tSnap.exists()) {
        const t = tSnap.data() as any;
        const name =
          t?.name ||
          t?.fullName ||
          [t?.firstName, t?.lastName].filter(Boolean).join(" ") ||
          t?.nombres ||
          t?.displayName;
        if (name) return name;
      }
    } catch {
      // continuar con la siguiente colección
    }
  }
  return undefined;
}

// ---------- Fetch del informe desde history ----------
async function fetchStudentYearHistoryAsFinalReport(
  studentId: string,
  year: string,
  opts?: { periods?: string[] }
): Promise<{ report: FinalReportData; historyPeriodsObj: any }> {
  const ref = doc(db as any, "history", studentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("No existe historial para este estudiante.");

  const years = (snap.data() as any)?.years ?? {};
  const periodsObj = years?.[year]?.periods ?? {};
  const periodKeys =
    opts?.periods ??
    (Object.keys(periodsObj).sort((a, b) => Number(a) - Number(b)) || [
      "1",
      "2",
      "3",
      "4",
    ]);

  const areaMap: Record<
    string,
    { areaId: string; periods: Record<string, AreaPeriodGrades> }
  > = {};

  for (const pKey of periodKeys) {
    const pVal = periodsObj?.[pKey];
    const pAreas = pVal?.areas ?? {};
    for (const [areaId, payload] of Object.entries<any>(pAreas)) {
      if (!areaMap[areaId]) areaMap[areaId] = { areaId, periods: {} };
      areaMap[areaId].periods[pKey] = (payload?.grades ?? {}) as AreaPeriodGrades;
    }
  }

  const rows: FinalAreaRow[] = Object.values(areaMap).map((ar) => {
    const periodAverages: Record<string, number | null> = {};
    let fallasTotal = 0;

    for (const pKey of periodKeys) {
      const g = ar.periods[pKey];
      if (typeof g?.fallas === "number") fallasTotal += g.fallas;
      periodAverages[pKey] = avgTriplet(g);
    }

    const valid = Object.values(periodAverages).filter(
      (v): v is number => typeof v === "number"
    );
    const finalAverage =
      valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;

    return { areaId: ar.areaId, periodAverages, finalAverage, fallasTotal };
  });

  const finals = rows
    .map((r) => r.finalAverage)
    .filter((v): v is number => v !== null);
  const generalAverage =
    finals.length > 0 ? finals.reduce((a, b) => a + b, 0) / finals.length : null;

  const report: FinalReportData = {
    meta: {
      studentId,
      year,
      generatedAt: new Date().toISOString(),
    },
    areas: rows,
    generalAverage,
  };

  return { report, historyPeriodsObj: periodsObj };
}

// ---------- Helper para categoría de nota ----------
function getGradeCategory(average: number | null) {
  if (average === null) return { text: 'N/A', bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
  if (average >= 4.6) return { text: 'Superior', bgClass: 'bg-blue-100', textClass: 'text-blue-700' };
  if (average >= 4.0) return { text: 'Alto', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' };
  if (average >= 3.0) return { text: 'Básico', bgClass: 'bg-amber-100', textClass: 'text-amber-700' };
  return { text: 'Bajo', bgClass: 'bg-red-100', textClass: 'text-red-700' };
}

// ---------- Tabla de promedios ----------
function FinalReportTable({
  report,
  areaLabels,
  areaOrder,
  periods,
}: {
  report: FinalReportData;
  areaLabels: Record<string, string>;
  areaOrder?: Record<string, number>;
  periods?: string[];
}) {
  const pKeys = periods ?? inferPeriodsFromRows(report.areas);

  const rows = [...report.areas].sort((a, b) => {
    const oa = areaOrder?.[a.areaId] ?? 9999;
    const ob = areaOrder?.[b.areaId] ?? 9999;
    if (oa !== ob) return oa - ob;
    const la = areaLabels[a.areaId] ?? a.areaId;
    const lb = areaLabels[b.areaId] ?? b.areaId;
    return la.localeCompare(lb, "es");
  });

  return (
    <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
      <thead>
        <tr className="bg-gradient-to-r from-gray-100 to-gray-50 print:bg-white">
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
            ÁREA
          </th>
          {pKeys.map((p) => (
            <th
              key={p}
              className="px-3 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-20"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                P{p}
              </span>
            </th>
          ))}
          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-32">
            PROMEDIO
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => {
          const cat = getGradeCategory(row.finalAverage);
          return (
            <tr
              key={row.areaId}
              className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50/30 transition-colors print:bg-white`}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-100">
                {areaLabels[row.areaId] ?? row.areaId}
              </td>
              {pKeys.map((p) => {
                const val = row.periodAverages[p];
                const pCat = getGradeCategory(val);
                return (
                  <td key={p} className="px-3 py-3 text-center border-b border-gray-100">
                    {typeof val === "number" ? (
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${pCat.bgClass} ${pCat.textClass}`}>
                        {val.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-center border-b border-gray-100">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold text-gray-900">
                    {typeof row.finalAverage === "number" ? row.finalAverage.toFixed(2) : "N/A"}
                  </span>
                  {row.finalAverage !== null && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.bgClass} ${cat.textClass}`}>
                      {cat.text}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr className="bg-gradient-to-r from-gray-100 to-gray-50 print:bg-white">
          <th
            colSpan={pKeys.length + 1}
            className="px-4 py-4 text-right text-sm font-bold text-gray-700 border-t-2 border-gray-300"
          >
            Promedio General Anual
          </th>
          <th className="px-4 py-4 text-center border-t-2 border-gray-300">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {typeof report.generalAverage === "number"
                  ? report.generalAverage.toFixed(2)
                  : "N/A"}
              </span>
              {report.generalAverage !== null && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getGradeCategory(report.generalAverage).bgClass} ${getGradeCategory(report.generalAverage).textClass}`}>
                  {getGradeCategory(report.generalAverage).text}
                </span>
              )}
            </div>
          </th>
        </tr>
      </tfoot>
    </table>
  );
}

// ---------- Página ----------
export default function FinalReport() {
  const params = useParams();
  const studentId =
    (params as any).studentId || (params as any).id || (params as any).uid;
  const year = (params as any).year || String(new Date().getFullYear());

  usePrintSetup();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<FinalReportData | null>(null);
  const [areaLabels, setAreaLabels] = React.useState<Record<string, string>>({});
  const [areaOrder, setAreaOrder] = React.useState<Record<string, number>>({});
  const [directorName, setDirectorName] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const { report, historyPeriodsObj } =
          await fetchStudentYearHistoryAsFinalReport(studentId, String(year), {
            periods: ["1", "2", "3", "4"],
          });

        const areasMeta = await fetchAreasMeta();
        const sInfo = await fetchStudentInfo(studentId);

        const classroomId =
          sInfo.classroomId || extractClassroomIdFromHistory(historyPeriodsObj);

        const classroomMeta = await fetchClassroomMeta(classroomId);

        let director = classroomMeta.directorName;
        if (!director) {
          const teacherId = extractTeacherIdFromHistory(historyPeriodsObj);
          director = await fetchTeacherName(teacherId);
        }

        if (!alive) return;

        const fullName = [sInfo.name, sInfo.lastName].filter(Boolean).join(" ").trim();
        setData({
          ...report,
          meta: {
            ...report.meta,
            studentName: fullName || report.meta.studentId,
            classroom: classroomMeta.name || sInfo.classroomName,
            classroomId,
          },
        });

        setAreaLabels(areasMeta.labels);
        setAreaOrder(areasMeta.order);
        setDirectorName(director);
        setError(null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error cargando el informe");
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [studentId, year]);

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando informe final...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full max-w-5xl mx-auto p-5 flex flex-col gap-3 font-['Nunito',sans-serif] bg-white">
      {/* Header institucional */}
      <table className="w-full border-collapse">
        <tbody>
          <tr className="h-28">
            <td className="w-24 p-2 border border-gray-200 align-middle">
              <img src={logo} alt="logotipo" className="w-20 mx-auto" />
            </td>
            <td className="px-6 py-3 border border-gray-200 text-center">
              <b className="text-lg font-bold text-gray-900">COLINA CAMPESTRE SCHOOL</b>
              <p className="text-[10pt] text-gray-600 mt-1 leading-relaxed">
                De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y
                Básica Secundaria por parte de Secretaría de Educación Municipal,
                según resolución No 2747 del 12 de diciembre de 2023. Carrera 34 No 38-158,
                teléfonos: 2771068-3006781806
              </p>
              <p className="text-[10pt] text-gray-700 font-semibold">NIT: 901731191-3</p>
            </td>
            <td className="w-28 px-3 py-2 border border-gray-200 text-center text-xs text-gray-600 align-middle">
              DANE 370001038852
            </td>
          </tr>
        </tbody>
      </table>

      {/* Título del informe */}
      <h2 className="text-center my-4">
        <span className="text-lg font-bold text-gray-800">
          INFORME FINAL – {data.meta.year}
        </span>
      </h2>

      {/* Información del estudiante */}
      <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 print:bg-white">
          <tr>
            <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-200">ESTUDIANTE</td>
            <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-200">GRADO</td>
            <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-200">FECHA</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 text-[11pt] font-bold text-gray-900 border border-gray-200">
              {(data.meta.studentName || data.meta.studentId || "").toUpperCase()}
            </td>
            <td className="px-4 py-3 text-[11pt] font-bold text-gray-900 border border-gray-200">
              {(data.meta.classroom || "—").toUpperCase()}
            </td>
            <td className="px-4 py-3 text-[11pt] font-bold text-gray-900 border border-gray-200">
              {formatDateShort(new Date())}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tabla de promedios */}
      <FinalReportTable
        report={data}
        areaLabels={areaLabels}
        areaOrder={areaOrder}
        periods={["1", "2", "3", "4"]}
      />

      {/* Escala de valoración */}
      <div className="bg-gray-50 print:bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">ESCALA DE VALORACIÓN</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-gray-700">Superior: 4.6 - 5.0</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-gray-700">Alto: 4.0 - 4.5</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-gray-700">Básico: 3.0 - 3.9</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-700">Bajo: 1.0 - 2.9</span>
          </span>
        </div>
      </div>

      {/* Observaciones */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 print:bg-white px-4 py-2">
          <p className="text-sm font-bold text-gray-700">OBSERVACIONES</p>
        </div>
        <div className="h-16 bg-white"></div>
      </div>

      {/* Firmas */}
      <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
        <tbody>
          <tr>
            <td className="text-center py-4 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-8">
                <img src={firmTwo} alt="firma directora" className="w-28 h-auto" />
                <p className="text-[10pt] font-medium text-gray-900 mt-2">ANA KARINA GOMEZ BUSTAMANTE</p>
                <p className="text-[10pt] text-gray-600">Directora</p>
              </div>
            </td>
            <td className="text-center py-4 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-8">
                <img src={firmOne} alt="firma coordinadora" className="w-28 h-auto" />
                <p className="text-[10pt] font-medium text-gray-900 mt-2">NURIA MILENA MONTES SALAS</p>
                <p className="text-[10pt] text-gray-600">Coordinadora Académica</p>
              </div>
            </td>
            <td className="text-center py-4 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-8">
                <div className="w-28 h-10 border-b border-gray-400"></div>
                <p className="text-[10pt] font-medium text-gray-900 mt-2">{directorName || "Director(a) de Grupo"}</p>
                <p className="text-[10pt] text-gray-600">Director(a) de Grupo</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
