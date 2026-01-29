import { useAppSelector } from "../../../app/store/store";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../../components/datatable/DataTable";

/**
 * Badge de nivel académico con Tailwind
 */
const NIVEL_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  primaria: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Primaria' },
  preescolar: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Preescolar' },
  secundaria: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Secundaria' },
};

const TeacherAreas = () => {
  const { areas, loading } = useAppSelector((state) => state.teacherData);
  const { periodId, classroomId, classroomNivel } = useParams();
  const navigate = useNavigate();

  const handleSelectNotes = (areaId: string) => {
    navigate(`/private/dashboard/notes/${periodId}/${classroomId}/${areaId}`);
  };

  const handleSelectPreschoolNotes = () => {
    navigate(`/private/dashboard/notespreschool/${periodId}/${classroomId}`);
  };

  const handleSelectIndicadores = () => {
    navigate(`/private/dashboard/indicadores/${periodId}/${classroomId}`);
  };

  const handleSelectStudents = () => {
    navigate(`/private/dashboard/student/${periodId}/${classroomId}/students`);
  };

  const isPreschool = classroomNivel?.toLowerCase() === 'preescolar';

  const columns = [
    {
      key: "asignatura",
      label: "Asignatura",
      render: (row: any) => (
        <span className="font-medium text-gray-900">
          {row.asignatura}
        </span>
      )
    },
    {
      key: "area",
      label: "Área",
      render: (row: any) => (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
          {row.area}
        </span>
      )
    },
    {
      key: "nivel",
      label: "Nivel",
      render: (row: any) => {
        const nivel = row.nivel?.toLowerCase() || '';
        const badge = NIVEL_BADGES[nivel] || { bg: 'bg-gray-50', text: 'text-gray-700', label: row.nivel };

        return (
          <span className={`
            inline-flex items-center px-2.5 py-1
            text-xs font-medium rounded-full
            ${badge.bg} ${badge.text}
          `}>
            {badge.label}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "Acciones",
      render: (area: any) => {
        if (!isPreschool) {
          return (
            <button
              onClick={() => handleSelectNotes(area.id)}
              className="
                p-2 rounded-lg
                text-gray-500 hover:text-blue-600
                hover:bg-blue-50
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-200
              "
              title="Gestionar notas"
              aria-label="Gestionar notas"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </button>
          );
        } else {
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSelectPreschoolNotes}
                className="
                  p-2 rounded-lg
                  text-gray-500 hover:text-purple-600
                  hover:bg-purple-50
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-200
                "
                title="Propósitos"
                aria-label="Propósitos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </button>
              <button
                onClick={handleSelectIndicadores}
                className="
                  p-2 rounded-lg
                  text-gray-500 hover:text-amber-600
                  hover:bg-amber-50
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-200
                "
                title="Indicadores"
                aria-label="Indicadores"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button
                onClick={handleSelectStudents}
                className="
                  p-2 rounded-lg
                  text-gray-500 hover:text-teal-600
                  hover:bg-teal-50
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-teal-200
                "
                title="Estudiantes"
                aria-label="Estudiantes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </button>
            </div>
          );
        }
      }
    }
  ];

  const preschoolArea = [
    {
      id: "",
      nivel: "preescolar",
      area: "Preescolar",
      orden: 1,
      ihs: 2,
      asignatura: "Informe Preescolar"
    }
  ];

  const tableData = isPreschool
    ? preschoolArea
    : areas.filter((area: any) => area.nivel === classroomNivel?.toLowerCase());

  return (
    <DataTable
      data={tableData}
      columns={columns}
      isLoading={loading}
      exportFileName="mis-areas"
      initialItemsPerPage={10}
      enableExport={false}
      enablePagination={false}
      enableSearch={true}
      skeletonCount={5}
      tableSize={{
        width: "100%"
      }}
    />
  );
};

export default TeacherAreas;