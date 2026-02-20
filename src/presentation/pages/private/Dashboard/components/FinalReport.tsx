// src/pages/private/Dashboard/director/FinalReport.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../../infrastructure/firebase/firebase";

import logo from "../../../../../assets/logo/logotipo.jpg";
import firmOne from "../../../../../assets/firm/01.jpg";
import firmTwo from "../../../../../assets/firm/02.jpg";
import { usePrintSetup, PrintControls } from "../../../../components/PrintableReport";
import { fetchPeriodConfig, formatFechaEntrega } from "../../../../../infrastructure/periodConfig.service";

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
    const rawDirector: string | undefined =
      c?.directorGrupo ||
      c?.director ||
      c?.homeroomTeacher ||
      c?.tutor ||
      c?.dirGrupo ||
      c?.teacherName ||
      c?.docenteDirector ||
      undefined;

    // rawDirector puede ser un UID — intentar resolver a nombre desde users
    let directorName = rawDirector;
    if (rawDirector) {
      try {
        const userSnap = await getDoc(doc(db, "users", rawDirector));
        if (userSnap.exists()) {
          const u = userSnap.data() as any;
          const resolved =
            u?.displayName ||
            [u?.name, u?.lastName].filter(Boolean).join(" ") ||
            u?.email;
          if (resolved) directorName = resolved;
        }
      } catch {
        // si falla la búsqueda, usar el valor raw como fallback
      }
    }

    return { name, directorName };
  } catch {
    return {};
  }
}

// Extrae metadata.nombreDirector guardado en el historial (ya es un nombre, no un UID)
function extractDirectorFromHistory(periodsObj: any): string | undefined {
  const pKeys = Object.keys(periodsObj || {});
  for (const p of pKeys) {
    const areas = periodsObj[p]?.areas || {};
    for (const a of Object.keys(areas)) {
      const nd = areas[a]?.metadata?.nombreDirector;
      if (typeof nd === "string" && nd) return nd;
    }
  }
  return undefined;
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
): Promise<{ report: FinalReportData; historyPeriodsObj: any; historicCurso: string }> {
  const ref = doc(db as any, "history", studentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("No existe historial para este estudiante.");

  const years = (snap.data() as any)?.years ?? {};
  const yearObj = years?.[year] ?? {};
  const periodsObj = yearObj?.periods ?? {};

  // Extraer el grado histórico desde metadata del año.
  let historicCurso = '';
  let historicClassroomId = '';

  for (const pKey of Object.keys(periodsObj)) {
    const areas = periodsObj[pKey]?.areas ?? {};
    for (const aKey of Object.keys(areas)) {
      const nombreGrado = areas[aKey]?.metadata?.nombreGrado;
      const cid = areas[aKey]?.metadata?.classroomId;
      if (typeof nombreGrado === 'string' && nombreGrado) {
        historicCurso = nombreGrado;
        break;
      }
      if (typeof cid === 'string' && cid && !historicClassroomId) {
        historicClassroomId = cid;
      }
    }
    if (historicCurso) break;
  }

  // Fallback: leer nombre del salón histórico desde Firestore
  if (!historicCurso && historicClassroomId) {
    try {
      const crSnap = await getDoc(doc(db, 'classRooms', historicClassroomId));
      if (crSnap.exists()) {
        historicCurso = crSnap.data()?.nombreSalon || '';
      }
    } catch {
      // Si falla, se usará el nombre del salón actual más adelante
    }
  }

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

  return { report, historyPeriodsObj: periodsObj, historicCurso };
}

// ---------- Helper para categoría de nota ----------
function getGradeCategory(average: number | null) {
  if (average === null) return { text: 'N/A', bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
  if (average >= 4.6) return { text: 'Superior', bgClass: 'bg-blue-100', textClass: 'text-blue-700' };
  if (average >= 4.0) return { text: 'Alto', bgClass: 'bg-tosca/20', textClass: 'text-tosca-700' };
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
          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-200">
            ÁREA
          </th>
          {pKeys.map((p) => (
            <th
              key={p}
              className="px-2 py-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 w-16"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-200 text-gray-700 rounded-full text-[10px] font-bold">
                P{p}
              </span>
            </th>
          ))}
          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 w-24">
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
              <td className="px-3 py-2 text-xs font-medium text-gray-900 border-b border-gray-100">
                {areaLabels[row.areaId] ?? row.areaId}
              </td>
              {pKeys.map((p) => {
                const val = row.periodAverages[p];
                const pCat = getGradeCategory(val);
                return (
                  <td key={p} className="px-2 py-2 text-center border-b border-gray-100">
                    {typeof val === "number" ? (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${pCat.bgClass} ${pCat.textClass}`}>
                        {val.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                );
              })}
              <td className="px-3 py-2 text-center border-b border-gray-100">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-bold text-gray-900">
                    {typeof row.finalAverage === "number" ? row.finalAverage.toFixed(2) : "N/A"}
                  </span>
                  {row.finalAverage !== null && (
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${cat.bgClass} ${cat.textClass}`}>
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
            className="px-3 py-3 text-right text-xs font-bold text-gray-700 border-t-2 border-gray-300"
          >
            Promedio General Anual
          </th>
          <th className="px-3 py-3 text-center border-t-2 border-gray-300">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-bold text-gray-900">
                {typeof report.generalAverage === "number"
                  ? report.generalAverage.toFixed(2)
                  : "N/A"}
              </span>
              {report.generalAverage !== null && (
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${getGradeCategory(report.generalAverage).bgClass} ${getGradeCategory(report.generalAverage).textClass}`}>
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

// ---------- Contenido del informe (reutilizable) ----------
export function FinalReportContent({ studentId, year }: { studentId: string; year: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<FinalReportData | null>(null);
  const [areaLabels, setAreaLabels] = React.useState<Record<string, string>>({});
  const [areaOrder, setAreaOrder] = React.useState<Record<string, number>>({});
  const [directorName, setDirectorName] = React.useState<string | undefined>(undefined);
  const [fechaEntrega, setFechaEntrega] = React.useState<string>('');

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const { report, historyPeriodsObj, historicCurso } =
          await fetchStudentYearHistoryAsFinalReport(studentId, String(year), {
            periods: ["1", "2", "3", "4"],
          });

        const areasMeta = await fetchAreasMeta();
        const sInfo = await fetchStudentInfo(studentId);

        const classroomId =
          sInfo.classroomId || extractClassroomIdFromHistory(historyPeriodsObj);

        const classroomMeta = await fetchClassroomMeta(classroomId);

        // Prioridad: nombre guardado en metadata > nombre del classroom (resuelto) > fallback por teacherId
        let director =
          extractDirectorFromHistory(historyPeriodsObj) ||
          classroomMeta.directorName;
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
            classroom: historicCurso || classroomMeta.name || sInfo.classroomName,
            classroomId,
          },
        });

        // Fecha del informe final = fechaEntrega del periodo 4 del año
        try {
          const period4Config = await fetchPeriodConfig('4', String(year));
          if (period4Config?.fechaEntrega) {
            setFechaEntrega(formatFechaEntrega(period4Config.fechaEntrega));
          }
        } catch {
          // Si no hay config, usar fallback
        }

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
    return () => { alive = false; };
  }, [studentId, year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-tosca-ds border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Cargando informe final...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center bg-white p-6 rounded-lg shadow-sm max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-2.5 font-['Nunito',sans-serif] bg-white">
      {/* Header institucional */}
      <table className="w-full border-collapse">
        <tbody>
          <tr className="h-20">
            <td className="w-20 p-2 border border-gray-200 align-middle">
              <img src={logo} alt="logotipo" className="w-16 mx-auto" />
            </td>
            <td className="px-5 py-2 border border-gray-200 text-center">
              <b className="text-sm font-bold text-gray-900">COLINA CAMPESTRE SCHOOL</b>
              <p className="text-[8pt] text-gray-600 mt-0.5 leading-snug">
                De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y
                Básica Secundaria por parte de Secretaría de Educación Municipal,
                según resolución No 2747 del 12 de diciembre de 2023. Carrera 34 No 38-158,
                teléfonos: 2771068-3006781806
              </p>
              <p className="text-[8pt] text-gray-700 font-semibold mt-0.5">NIT: 901731191-3</p>
            </td>
            <td className="w-24 px-2 py-2 border border-gray-200 text-center text-[8pt] text-gray-600 align-middle">
              DANE 370001038852
            </td>
          </tr>
        </tbody>
      </table>

      {/* Título del informe */}
      <h2 className="text-center my-2">
        <span className="text-sm font-bold text-gray-800">
          INFORME FINAL – {data.meta.year}
        </span>
      </h2>

      {/* Información del estudiante */}
      <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 print:bg-white">
          <tr>
            <td className="px-3 py-1.5 text-[9pt] font-bold text-gray-700 border border-gray-200">ESTUDIANTE</td>
            <td className="px-3 py-1.5 text-[9pt] font-bold text-gray-700 border border-gray-200">GRADO</td>
            <td className="px-3 py-1.5 text-[9pt] font-bold text-gray-700 border border-gray-200">FECHA</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-3 py-2 text-[9pt] font-bold text-gray-900 border border-gray-200">
              {(data.meta.studentName || data.meta.studentId || "").toUpperCase()}
            </td>
            <td className="px-3 py-2 text-[9pt] font-bold text-gray-900 border border-gray-200">
              {(data.meta.classroom || "—").toUpperCase()}
            </td>
            <td className="px-3 py-2 text-[9pt] font-bold text-gray-900 border border-gray-200">
              {fechaEntrega || formatDateShort(new Date(parseInt(year), 11, 31))}
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
      <div className="bg-gray-50 print:bg-white border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">ESCALA DE VALORACIÓN</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span className="text-gray-700">Superior: 4.6 – 5.0</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-tosca-ds flex-shrink-0"></span>
            <span className="text-gray-700">Alto: 4.0 – 4.5</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></span>
            <span className="text-gray-700">Básico: 3.0 – 3.9</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"></span>
            <span className="text-gray-700">Bajo: 1.0 – 2.9</span>
          </span>
        </div>
      </div>

      {/* Observaciones */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 print:bg-white px-3 py-1.5">
          <p className="text-xs font-bold text-gray-700">OBSERVACIONES</p>
        </div>
        <div className="h-12 bg-white"></div>
      </div>

      {/* Firmas */}
      <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
        <tbody>
          <tr>
            <td className="text-center py-3 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-6">
                <img src={firmTwo} alt="firma directora" className="w-20 h-auto" />
                <p className="text-[8pt] font-medium text-gray-900 mt-1">ANA KARINA GOMEZ BUSTAMANTE</p>
                <p className="text-[8pt] text-gray-600">Directora</p>
              </div>
            </td>
            <td className="text-center py-3 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-6">
                <img src={firmOne} alt="firma coordinadora" className="w-20 h-auto" />
                <p className="text-[8pt] font-medium text-gray-900 mt-1">NURIA MILENA MONTES SALAS</p>
                <p className="text-[8pt] text-gray-600">Coordinadora Académica</p>
              </div>
            </td>
            <td className="text-center py-3 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-6">
                <div className="w-24 h-8 border-b border-gray-400"></div>
                <p className="text-[8pt] font-medium text-gray-900 mt-1">{directorName || "Director(a) de Grupo"}</p>
                <p className="text-[8pt] text-gray-600">Director(a) de Grupo</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------- Página standalone ----------
export default function FinalReport() {
  const params = useParams();
  const studentId =
    (params as any).studentId || (params as any).id || (params as any).uid;
  const year = (params as any).year || String(new Date().getFullYear());

  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de controles de impresión */}
      <div className="print:hidden sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-end gap-3">
        <PrintControls
          paperSize={paperSize}
          onPaperSizeChange={setPaperSize}
          onPrint={handlePrint}
        />
      </div>

      {/* Contenido del informe */}
      <div className="py-6">
        <FinalReportContent studentId={studentId} year={String(year)} />
      </div>
    </div>
  );
}
