// src/pages/private/Dashboard/director/FinalReport.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../../infrastructure/firebase/firebase";

import "./AcademicReport.css";
import logo from    "../../../../../assets/logo/logotipo.jpg";
import firmOne from "../../../../../assets/firm/01.jpg";
import firmTwo from "../../../../../assets/firm/02.jpg";

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

type FinalReport = {
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
  return sum / parts.length; // sin redondear internamente
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

// Devuelve { name, directorName } desde classRooms/{classroomId}
async function fetchClassroomMeta(
  classroomId?: string
): Promise<{ name?: string; directorName?: string }> {
  if (!classroomId) return {};
  try {
    const cSnap = await getDoc(doc(db, "classRooms", classroomId));
    if (!cSnap.exists()) return {};
    const c = cSnap.data() as any;

    const name = c?.name || c?.className || c?.grado || c?.grade;

    // posibles campos para director de grupo
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

// ---------- Extraer classroomId y teacherId desde history ----------
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

// Busca nombre del docente en teachers/{id} o users/{id}
async function fetchTeacherName(teacherId?: string): Promise<string | undefined> {
  if (!teacherId) return undefined;

  const tryCollections = ["teachers", "teacher", "users"]; // por si varía el nombre
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
): Promise<{ report: FinalReport; historyPeriodsObj: any }> {
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

  const report: FinalReport = {
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

// ---------- Tabla de promedios ----------
function FinalReportTable({
  report,
  areaLabels,
  areaOrder,
  periods,
}: {
  report: FinalReport;
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
    <table className="table-header-info-report">
      <thead>
        <tr>
          <th className="table-header">ÁREA</th>
          {pKeys.map((p) => (
            <th className="table-header" key={p}>
              P{p}
            </th>
          ))}
          <th className="table-header">PROMEDIO ÁREA</th>
        </tr>
      </thead>
      <tbody className={"odd-row"}>
        {rows.map((row) => (
          <tr key={row.areaId}>
            <td className="table-cell">{areaLabels[row.areaId] ?? row.areaId}</td>
            {pKeys.map((p) => (
              <td className="table-cell" key={p}>
                {typeof row.periodAverages[p] === "number"
                  ? (row.periodAverages[p] as number).toFixed(2)
                  : "N/A"}
              </td>
            ))}
            <td className="table-cell" align="center">
              {typeof row.finalAverage === "number"
                ? row.finalAverage.toFixed(2)
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th
            className="table-header"
            colSpan={pKeys.length + 1}
            style={{ textAlign: "right" }}
          >
            Promedio general
          </th>
          <th className="table-cell">
            {typeof report.generalAverage === "number"
              ? report.generalAverage.toFixed(2)
              : "N/A"}
          </th>
          <th></th>
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

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<FinalReport | null>(null);
  const [areaLabels, setAreaLabels] = React.useState<Record<string, string>>({});
  const [areaOrder, setAreaOrder] = React.useState<Record<string, number>>({});
  const [directorName, setDirectorName] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 1) Informe + obtener periodsObj
        const { report, historyPeriodsObj } =
          await fetchStudentYearHistoryAsFinalReport(studentId, String(year), {
            periods: ["1", "2", "3", "4"],
          });

        // 2) Áreas
        const areasMeta = await fetchAreasMeta();

        // 3) Enriquecer con classroom y director
        //    Primero intentamos desde student (por si lo usas más adelante)
        const sInfo = await fetchStudentInfo(studentId);

        // Fallbacks desde history
        const classroomId =
          sInfo.classroomId || extractClassroomIdFromHistory(historyPeriodsObj);

        // Traer meta del salón (nombre + director si existiera)
        const classroomMeta = await fetchClassroomMeta(classroomId);

        // Si no vino director desde classRooms, intentamos con teacherId de history
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

  if (error)
    return (
      <div className="report-container">
        <p style={{ color: "#b00" }}>{error}</p>
      </div>
    );
  if (!data) return null;

  return (
    <div className="report-container">
      {/* Encabezado */}
      <table className="table-header-info-report">
        <thead className="thead-header-info">
          <tr className="tr-header">
            <td className="td-logo-school" rowSpan={2}>
              <img src={logo} alt="logotipo" />
            </td>
            <td align="center" className="td-header">
              <b>COLINA CAMPESTRE SCHOOL</b>
              <p>
                De Sincelejo, Sucre, <br />
                con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y
                Básica Secundaria por parte de Secretaría de Educación Municipal, <br />
                según resolución No 2747 del 12 de diciembre de 2023. Carrera 34 No 38-158,
                teléfonos: 2771068-3006781806
              </p>
              <p>NIT: 901731191-3</p>
            </td>
            <td align="center" className="td-dane">
              DANE 370001038852
            </td>
          </tr>
        </thead>
      </table>

      {/* Título */}
      <table className="table-student-info-report">
        <thead className="table-header-title">
          <tr>
            <td className="table-header-title">
              INFORME FINAL – {data.meta.year}
            </td>
          </tr>
        </thead>
      </table>

      {/* Datos del estudiante */}
      <table className="table-student-info-report">
        <thead className="thead-student-info">
          <tr>
            <td>ESTUDIANTE</td>
            <td>GRADO</td>
            <td>FECHA</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="student-name">
              {(data.meta.studentName || data.meta.studentId || "").toUpperCase()}
            </td>
            <td className="student-classroom">
              {(data.meta.classroom || "—").toUpperCase()}
            </td>
            <td>{formatDateShort(new Date())}</td>
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

      {/* Observaciones y firmas */}
      <table className="table-student-info-report">
        <thead className="thead-student-info">
          <tr>
            <td colSpan={2}>
              <p>
                ESCALA DE VALORACIÓN: Superior: 4.6 - 5.0; Alto: 4.0 - 4.5; Básico: 3.0 - 3.9; Bajo: 1.0 - 2.9
              </p>
            </td>
          </tr>
        </thead>
      </table>

      <table className="table-student-info-report">
        <thead className="thead-student-info">
          <tr>
            <td colSpan={3}>
              <p>OBSERVACIONES</p>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td height={"40px"} colSpan={3}></td>
          </tr>
          <tr>
            <td align="center">
              <div className="firma">
                <img src={firmTwo} alt="firma directora" width={"100px"} />
                <p>ANA KARINA GOMEZ BUSTAMANTE</p>
                <p>Directora</p>
              </div>
            </td>
            <td align="center">
              <div className="firma">
                <img src={firmOne} alt="firma coordinadora" width={"100px"} />
                <p>NURIA MILENA MONTES SALAS</p>
                <p>Coordinadora Académica</p>
              </div>
            </td>
            <td align="center">
              <div className="firma">
                <p>{directorName || "Director(a) de Grupo"}</p>
                <p>Director(a) de Grupo</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
