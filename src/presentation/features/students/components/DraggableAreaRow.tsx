import { AreaWithDragProps, DragDropHandlers } from '../../../../shared/types/areaTypes';

interface DraggableAreaRowProps {
  area: AreaWithDragProps;
  index: number;
  handlers: DragDropHandlers;
  onEdit: (area: AreaWithDragProps) => void;
  onDelete: (id: string) => void;
}

/**
 * Fila arrastrable para la lista de áreas.
 * Muestra información del área con soporte para drag & drop.
 */
const DraggableAreaRow = ({
  area,
  index,
  handlers,
  onEdit,
  onDelete
}: DraggableAreaRowProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', area.id);
    handlers.onDragStart(area.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    handlers.onDragOver(e, area.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handlers.onDrop(area.id);
  };

  const handleDeleteClick = () => {
    onDelete(area.id);
  };

  // Clases dinámicas según estado
  const rowClasses = [
    'flex items-center gap-4 p-3 rounded-lg border transition-all duration-200',
    'bg-white hover:bg-gray-50',
    area.isDragging && 'opacity-50 border-dashed border-deepBlue bg-blue-50',
    area.isDropTarget && !area.isDragging && 'border-gold border-2 bg-yellow-50',
    !area.isDragging && !area.isDropTarget && 'border-gray-200'
  ].filter(Boolean).join(' ');

  // Badge de nivel
  const nivelBadgeClasses = {
    'primaria': 'bg-yellow-ds/10 text-yellow-cc border border-yellow-ds/30',
    'secundaria': 'bg-magenta-ds/10 text-magenta-cc border border-magenta-ds/30',
    'preescolar': 'bg-tosca-ds/10 text-tosca-cc border border-tosca-ds/30'
  }[area.nivel] || 'bg-gray-100 text-gray-800';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handlers.onDragEnd}
      onDrop={handleDrop}
      className={rowClasses}
      role="listitem"
      aria-grabbed={area.isDragging}
      aria-dropeffect="move"
    >
      {/* Grip handle */}
      <div
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-deepBlue p-1"
        aria-label="Arrastrar para reordenar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Orden */}
      <div className="w-10 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-deepBlue text-white text-sm font-medium">
          {index + 1}
        </span>
      </div>

      {/* Asignatura */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{area.asignatura}</p>
        <p className="text-sm text-gray-500 truncate">{area.area}</p>
      </div>

      {/* Nivel badge */}
      <div className="hidden sm:block">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${nivelBadgeClasses}`}>
          {area.nivel.charAt(0).toUpperCase() + area.nivel.slice(1)}
        </span>
      </div>

      {/* IHS */}
      <div className="w-12 text-center">
        <span className="text-sm text-gray-600">{area.ihs} IHS</span>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(area)}
          className="p-1.5 text-gray-500 hover:text-deepBlue hover:bg-blue-50 rounded transition-colors"
          title="Editar área"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Eliminar área"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DraggableAreaRow;
