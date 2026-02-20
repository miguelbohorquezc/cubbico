import { useAppSelector } from "../../../app/store/store";
import DataTable from "../../components/datatable/DataTable";
import { useNavigate, useParams } from "react-router-dom";
import { IconSchoolOff, IconDoor } from "@tabler/icons-react";

/**
 * Badge de nivel académico con Tailwind
 */
const NIVEL_BADGES: Record<string, { bg: string; text: string; label: string; border: string }> = {
  primaria: { bg: 'bg-magenta-ds/10', text: 'text-magenta-cc', border: 'border-magenta-ds/30', label: 'Primaria' },
  preescolar: { bg: 'bg-tosca-ds/10', text: 'text-tosca-cc', border: 'border-tosca-ds/30', label: 'Preescolar' },
  secundaria: { bg: 'bg-yellow-ds/10', text: 'text-yellow-cc', border: 'border-yellow-ds/30', label: 'Secundaria' },
};

const TeacherClassrooms = () => {
  const { classrooms, loading } = useAppSelector((state) => state.teacherData);
  const navigate = useNavigate();
  const { periodId, classroomId } = useParams();

  /** Determina si un salón está seleccionado actualmente */
  const getRowClassName = (row: { id?: string }) => {
    if (row.id === classroomId) {
      return 'bg-tosca/10 border-l-4 border-l-emerald-500';
    }
    return '';
  };

  const handleSelectClassRoom = (classroomId: string, classroomNivel: string) => {
    navigate(`/private/dashboard/academy/${periodId}/${classroomNivel}/${classroomId}`);
  };

  const columns = [
    {
      key: "identificador",
      label: "ID",
      render: (row: any) => (
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {row.identificador}
        </span>
      )
    },
    {
      key: "nombreSalon",
      label: "Salón",
      render: (row: any) => (
        <span className="font-medium text-gray-900 capitalize">
          {row.nombreSalon}
        </span>
      )
    },
    {
      key: "nivel",
      label: "Nivel",
      render: (row: any) => {
        const nivel = row.nivel?.toLowerCase() || '';
        const badge = NIVEL_BADGES[nivel] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: row.nivel };

        return (
          <span className={`
            inline-flex items-center px-2.5 py-1
            text-xs font-medium rounded-full border
            ${badge.bg} ${badge.text} ${badge.border}
          `}>
            {badge.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (classroom: any) => (
        <button
          onClick={() => handleSelectClassRoom(classroom.id, classroom.nivel)}
          className="
            p-2 rounded-lg
            text-gray-500 hover:text-orchid-blue-70
            hover:bg-orchid-blue-10
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-orchid-blue-30
          "
          title="Ver asignaturas"
          aria-label="Ver asignaturas"
        >
          <IconDoor size={20} />
        </button>
      )
    }
  ] as any;

  // Estado vacío personalizado cuando no hay salones asignados
  if (!loading && classrooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 mb-4 bg-amber-50 rounded-full flex items-center justify-center">
          <IconSchoolOff size={32} className="text-amber-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Sin salones asignados
        </h3>
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Aún no tienes salones asignados. Contacta al coordinador para que te asigne los salones correspondientes.
        </p>
      </div>
    );
  }

  return (
    <DataTable
      data={classrooms}
      columns={columns}
      isLoading={loading}
      exportFileName="mis-salones"
      initialItemsPerPage={10}
      enableExport={false}
      enablePagination={false}
      enableSearch={true}
      skeletonCount={5}
      tableSize={{
        width: "100%"
      }}
      rowClassName={getRowClassName}
    />
  );
};

export default TeacherClassrooms;