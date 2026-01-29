import React, { useMemo, useState } from "react";
import {
  IconSearch,
  IconFileSpreadsheet,
  IconChevronUp,
  IconChevronDown,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconDatabaseOff
} from "@tabler/icons-react";
import { useDataTable } from "./useDataTable";
//@ts-ignore
import { CSVLink } from "react-csv";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  initialItemsPerPage?: number;
  exportFileName?: string;
  isLoading?: boolean;
  enableExport?: boolean;
  enablePagination?: boolean;
  enableSearch?: boolean;
  skeletonCount?: number;
  tableSize?: {
    width?: string | number;
    height?: string | number;
    maxHeight?: string | number;
  };
  tableClassName?: string;
  /** Función para aplicar clases CSS condicionales a cada fila */
  rowClassName?: (row: T) => string;
}

function DataTable<T>({
  data,
  columns,
  initialItemsPerPage = 5,
  exportFileName = "export",
  isLoading = false,
  enableExport = true,
  enablePagination = true,
  enableSearch = true,
  skeletonCount = 5,
  tableSize = { width: "100%", height: "auto" },
  tableClassName = "",
  rowClassName
}: DataTableProps<T>) {
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const {
    search,
    setSearch,
    sortColumn,
    sortOrder,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
    handleSort,
    sortedData,
  } = useDataTable<T>(data, itemsPerPage);

  // Preparar datos para CSV
  const { csvData, csvHeaders } = useMemo(() => {
    const csvData = sortedData.map((row) => {
      const csvRow: { [key: string]: string } = {};
      columns.forEach((col) => {
        csvRow[col.label] = String(row[col.key]);
      });
      return csvRow;
    });

    const csvHeaders = columns.map((col) => ({
      label: col.label,
      key: col.label,
    }));

    return { csvData, csvHeaders };
  }, [sortedData, columns]);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = parseInt(e.target.value);
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  return (
    <div
      className="relative bg-white rounded-xl animate-fade-in"
      style={{
        width: tableSize.width,
        height: tableSize.height,
        maxHeight: tableSize.maxHeight
      }}
    >
      {/* Controles superiores */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-gray-100">
        {/* Selector de items por página */}
        {enableSearch && (
          <div className="flex items-center gap-3">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="
                px-3 py-2
                text-sm font-medium text-gray-700
                bg-gray-50 border border-gray-200
                rounded-lg
                cursor-pointer
                transition-all duration-200
                hover:border-gray-300
                focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
              "
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Búsqueda y exportar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {enableSearch && (
            <div className="relative flex-1 sm:flex-none">
              <IconSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full sm:w-64
                  pl-10 pr-4 py-2
                  text-sm text-gray-700
                  bg-gray-50 border border-gray-200
                  rounded-lg
                  transition-all duration-200
                  placeholder:text-gray-400
                  hover:border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 focus:bg-white
                "
              />
            </div>
          )}

          {enableExport && (
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`}
              className="
                inline-flex items-center gap-2
                px-3 py-2
                text-sm font-medium text-white
                bg-gradient-to-r from-emerald-500 to-teal-600
                rounded-lg
                transition-all duration-200
                hover:from-emerald-600 hover:to-teal-700
                hover:shadow-md
                focus:outline-none focus:ring-2 focus:ring-emerald-300
              "
              title="Exportar a CSV"
            >
              <IconFileSpreadsheet size={18} />
              <span className="hidden sm:inline">Exportar</span>
            </CSVLink>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className={`w-full ${tableClassName}`}>
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(col.key)}
                  className="
                    px-4 py-3
                    text-left text-xs font-semibold text-gray-600 uppercase tracking-wider
                    cursor-pointer
                    transition-colors duration-200
                    hover:bg-gray-100
                    select-none
                  "
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {sortColumn === col.key && (
                      <span className="text-emerald-600">
                        {sortOrder === "asc" ? (
                          <IconChevronUp size={16} />
                        ) : (
                          <IconChevronDown size={16} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              // Skeleton loading
              Array.from({ length: enablePagination ? itemsPerPage : skeletonCount }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              // Sin datos
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <IconDatabaseOff size={48} stroke={1} />
                    <p className="text-sm font-medium">No hay información registrada</p>
                    <p className="text-xs">Los datos aparecerán aquí cuando estén disponibles</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Datos
              (enablePagination ? paginatedData : sortedData).map((row, index) => (
                <tr
                  key={index}
                  className={`
                    transition-colors duration-150
                    hover:bg-emerald-50/50
                    ${rowClassName ? rowClassName(row) : ''}
                  `}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-sm text-gray-700"
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof typeof row])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!isLoading && enablePagination && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100">
          {/* Info de registros */}
          <p className="text-sm text-gray-500">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length} registros
          </p>

          {/* Botones de paginación */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="
                p-2 rounded-md
                text-gray-600
                transition-all duration-200
                hover:bg-white hover:text-emerald-600 hover:shadow-sm
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:shadow-none
              "
              title="Primera página"
            >
              <IconChevronsLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="
                p-2 rounded-md
                text-gray-600
                transition-all duration-200
                hover:bg-white hover:text-emerald-600 hover:shadow-sm
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:shadow-none
              "
              title="Página anterior"
            >
              <IconChevronLeft size={18} />
            </button>

            <span className="px-4 py-1 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="
                p-2 rounded-md
                text-gray-600
                transition-all duration-200
                hover:bg-white hover:text-emerald-600 hover:shadow-sm
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:shadow-none
              "
              title="Página siguiente"
            >
              <IconChevronRight size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="
                p-2 rounded-md
                text-gray-600
                transition-all duration-200
                hover:bg-white hover:text-emerald-600 hover:shadow-sm
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:shadow-none
              "
              title="Última página"
            >
              <IconChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
