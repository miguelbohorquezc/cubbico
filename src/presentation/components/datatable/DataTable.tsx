import React, { useMemo, useState } from "react";
import { useDataTable } from "./useDataTable";
//@ts-ignore
import { CSVLink } from "react-csv";
import "./DataTable.css";

interface Column<T> {
  key: keyof T;
  label: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  initialItemsPerPage?: number;
  exportFileName?: string;
  isLoading?: boolean;
}

function DataTable<T>({ 
  data, 
  columns, 
  initialItemsPerPage = 5,
  exportFileName = "export",
  isLoading = false
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
    setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
  };

  return (
    <div className="data-table-container">
      <div className="table-controls">
        <div className="left-controls">
          <select 
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="page-size-select"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Mostrar {size}
              </option>
            ))}
          </select>
        </div>

        <div className="right-controls">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`${exportFileName}-${new Date().toISOString().slice(0,10)}.csv`}
            className="export-button"
          >
            📊 Exportar
          </CSVLink>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => handleSort(col.key)}
                className="sortable-header"
              >
                <div className="header-content">
                  {col.label}
                  {sortColumn === col.key && (
                    <span className="sort-icon">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {!isLoading && paginatedData.map((row, index) => (
            <tr 
              key={index} 
              className={`table-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="table-cell">
                  {String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {!isLoading && paginatedData.length === 0 && (
        <div className="no-results">No se encontraron resultados</div>
      )}

      {!isLoading && totalPages > 0 && (
        <div className="pagination-controls">
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ⏮️
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ◀️
            </button>
            
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              ▶️
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              ⏭️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;