import React from "react";
import { Student } from "../../../components/notes/types";

/**
 * Escapa valores para CSV y maneja caracteres especiales
 */
function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Construye el CSV con los campos oficiales del listado
 */
function buildOfficialCSV(students: Student[]): string {
  // Headers en español latino con tildes
  const header = [
    "TIPO DE ID",
    "ID",
    "NOMBRES",
    "APELLIDOS",
    "ESTADO",
    "AÑO",
    "NIVEL",
    "GRADO",
    "MATRICULADO",
    "ULTIMO GRADO CURSADO",
  ];

  const lines = students.map((student) => {
    return [
      student.document || "",
      student.id || "",
      student.name || "",
      student.lastName || "",
      (student as any).status || "activo",
      (student as any).enrollmentYear || new Date().getFullYear().toString(),
      student.classRoom || "",
      student.className || "",
      (student as any).enrollmentYear || new Date().getFullYear().toString(),
      (student as any).lastPromotionYear || student.className || "",
    ].map(csvEscape).join(",");
  });

  // BOM para que Excel reconozca UTF-8 con tildes
  const bom = "\uFEFF";
  return bom + [header.join(","), ...lines].join("\n");
}

/**
 * Descarga el archivo CSV
 */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface ExportStudentsOfficialCSVProps {
  students: Student[];
  className?: string;
}

/**
 * Botón de exportación CSV del listado oficial de estudiantes
 */
export default function ExportStudentsOfficialCSV({
  students,
  className = ""
}: ExportStudentsOfficialCSVProps) {
  const handleExport = () => {
    if (!students || students.length === 0) {
      alert("No hay estudiantes para exportar");
      return;
    }

    // Filtrar solo estudiantes activos para el listado oficial
    const activeStudents = students.filter(s => (s.status || 'activo') === 'activo');

    if (activeStudents.length === 0) {
      alert("No hay estudiantes activos para exportar");
      return;
    }

    const csv = buildOfficialCSV(activeStudents);
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
    const filename = `listado_oficial_estudiantes_${timestamp}.csv`;

    downloadCSV(csv, filename);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!students || students.length === 0}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5
        text-sm font-medium rounded-lg
        bg-orchid-blue-60
        text-white
        hover:bg-orchid-blue-70
        focus:outline-none focus:ring-2 focus:ring-orchid-blue-20 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      title="Exportar listado oficial de estudiantes a CSV"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Exportar Listado Oficial (.CSV)
      {students && students.length > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-orchid-blue-5 text-orchid-blue-70 rounded-full text-xs font-semibold">
          {students.length}
        </span>
      )}
    </button>
  );
}
