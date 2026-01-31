import { Navigate, Route} from "react-router-dom"
import { PrivateRoutes } from "../../../../app/routes/routes"
import RoutesWithNotFound from "../../../../shared/utils/routesWithNotFound"
import { AuthGuardV2 } from "../../../../app/guard/AuthGuard.v2"
import StudentsPage from "./components/StudentsPage"
import Home from "./components/Home"
import Academy from "./components/Academy"
import Notes from "./components/Notes"
import AcademicReport from "../../../components/classRoomReport/AcademicReport"
import NotesPreschool from "./components/NotesPreschool"
import ConfigIndicadores from "./components/ConfigIndicadores"
import EvaluadorPreescolar from "./components/EvaluadorPreescolar"
import ClassroomStudents from "../../../features/teacher/ClassroomStudents"
import User from "./components/Users"
import ClassRoomPage from "./components/ClassRoomPage"
import AreaPage from "./components/AreaPage"
import InformePorSalon from "../../../components/informeGeneral/InformePorSalon"
import InformePreescolar from "../../../features/preschool/Evaluador/InformePreescolar"
import AspirantesAdminPage from "./components/AspirantesAdminPage"
import FinalReport from "./components/FinalReport"
import PromotionManager from "../../../features/students/PromotionManager"
import BulkReportPrinter from "../../../features/reports/BulkReportPrinter"
import ScheduleEditor from "../../../features/schedule/ScheduleEditor"
import AttendanceList from "../../../features/attendance/AttendanceList"
import AttendanceReport from "../../../features/attendance/AttendanceReport"
import AttendanceOverview from "../../../features/attendance/AttendanceOverview"

/**
 * Dashboard - Rutas del panel principal
 *
 * Permisos por rol:
 * - Coordinador: Acceso total (gestión de usuarios, salones, áreas, estudiantes, aspirantes)
 * - Docente: Acceso a notas, reportes y academia (solo sus asignaciones)
 * - Ambos: Home/History
 */
function Dashboard() {
  return (
    <RoutesWithNotFound>
      {/* Ruta por defecto - Todos los usuarios autenticados */}
      <Route path="/" element={<Navigate to={PrivateRoutes.HISTORY}/>}/>
      <Route path={PrivateRoutes.HISTORY} element={<Home/>}/>

      {/* ═══════════════════════════════════════════════════════════════════
          RUTAS ADMINISTRATIVAS - Solo Coordinador
          Gestión de usuarios, salones, áreas, estudiantes y aspirantes
      ═══════════════════════════════════════════════════════════════════ */}
      <Route element={<AuthGuardV2 allowedRoles={['Coordinador']} />}>
        <Route path={PrivateRoutes.USER} element={<User/>}/>
        <Route path={PrivateRoutes.CLASSROOMS} element={<ClassRoomPage />} />
        <Route path={PrivateRoutes.AREA} element={<AreaPage />} />
        <Route path={PrivateRoutes.STUDENT} element={<StudentsPage/>}/>
        <Route path={PrivateRoutes.CREATESTUDENT} element={<StudentsPage/>}/>
        <Route path={PrivateRoutes.ASPIRANTS} element={<AspirantesAdminPage />} />
        <Route path={PrivateRoutes.PROMOTIONS} element={<PromotionManager />} />
        {/* Horario docente */}
        <Route path={PrivateRoutes.HORARIO} element={<ScheduleEditor />} />
        {/* Panorámica de informes de asistencia */}
        <Route path={`${PrivateRoutes.ASISTENCIA}/overview`} element={<AttendanceOverview />} />
        {/* Impresión masiva de informes */}
        <Route path={`${PrivateRoutes.BULKPRINT}/:periodId/:classroomId`} element={<BulkReportPrinter />} />
      </Route>

      {/* ═══════════════════════════════════════════════════════════════════
          RUTAS ACADÉMICAS - Docente y Coordinador
          Notas, reportes, academia, evaluaciones
      ═══════════════════════════════════════════════════════════════════ */}
      <Route element={<AuthGuardV2 allowedRoles={['Docente', 'Coordinador']} />}>
        {/* Academia */}
        <Route path={`${PrivateRoutes.ACADEMY}/:periodId/:classroomNivel/:classroomId`} element={<Academy/>}/>
        <Route path={`${PrivateRoutes.ACADEMY}/:classroomId/:areaId`} element={<Academy/>}/>
        <Route path={`${PrivateRoutes.ACADEMY}/:periodId`} element={<Academy/>}/>

        {/* Asistencias */}
        <Route path={`${PrivateRoutes.ASISTENCIA}/:salonId/:profesorId/:areaId/:fecha/:hora`} element={<AttendanceList />} />
        <Route path={`${PrivateRoutes.ASISTENCIA}/report/:salonId/:profesorId/:areaId/:hora`} element={<AttendanceReport />} />

        {/* Notas */}
        <Route path={`${PrivateRoutes.NOTES}/:periodId/:classroomId/:areaId`} element={<Notes/>}/>
        <Route path={`${PrivateRoutes.NOTESPRESCHOOL}/:periodId/:classroomId`} element={<NotesPreschool/>}/>

        {/* Preescolar */}
        <Route path={`${PrivateRoutes.INDICADORES}/:periodId/:classroomId`} element={<ConfigIndicadores/>}/>
        <Route path={`${PrivateRoutes.EVALUADORPREESCOLAR}/:periodId/:classroomId/:studentId/:year`} element={<EvaluadorPreescolar/>}/>
        <Route path={`${PrivateRoutes.PRINT}/:periodId/:classroomId/:studentId/:year`} element={<InformePreescolar/>}/>

        {/* Estudiantes por salón */}
        <Route path={`${PrivateRoutes.STUDENT}/:periodId/:classroomId/students`} element={<ClassroomStudents />} />

        {/* Reportes */}
        <Route path={`${PrivateRoutes.REPORT}/:studentId/:year`} element={<AcademicReport />} />
        <Route path={`${PrivateRoutes.REPORT}/:classroomId/:periodId/:schoolLevel/:year`} element={<InformePorSalon/>}/>
        <Route path={`${PrivateRoutes.REPORT}/:schoolLevel/:periodId/:director/:studentId/:year`} element={<AcademicReport/>}/>
        <Route path={`${PrivateRoutes.FINALREPORT}/:studentId/:year`} element={<FinalReport />} />
      </Route>
    </RoutesWithNotFound>
  )
}
export default Dashboard