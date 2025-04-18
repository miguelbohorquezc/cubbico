import { Navigate, Route} from "react-router-dom"
import { PrivateRoutes } from "../../../../app/routes/routes"
import RoutesWithNotFound from "../../../../shared/utils/routesWithNotFound"
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

function Dashboard() {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={PrivateRoutes.HISTORY}/>}/>
      <Route path={PrivateRoutes.CREATESTUDENT}                                                           element={<StudentsPage/>}/>
      <Route path={PrivateRoutes.HISTORY}                                                                 element={<Home/>}/>
      <Route path={PrivateRoutes.USER}                                                                    element={<User/>}/>
      <Route path={`${PrivateRoutes.ACADEMY}/:periodId/:classroomNivel/:classroomId`}                     element={<Academy/>}/>
      <Route path={`${PrivateRoutes.ACADEMY}/:classroomId/:areaId`}                                       element={<Academy/>}/>
      <Route path={`${PrivateRoutes.ACADEMY}/:periodId`}                                                  element={<Academy/>}/>
      <Route path={PrivateRoutes.STUDENT}                                                                 element={<StudentsPage/>}/>
      <Route path={`${PrivateRoutes.REPORT}/:studentId/:year`}                                            element={<AcademicReport />} />
      <Route path={`${PrivateRoutes.REPORT}/:schoolLevel/:periodId/:studentId/:year`}                     element={<AcademicReport/>}/>
      <Route path={`${PrivateRoutes.NOTES}/:periodId/:classroomId/:areaId`}                               element={<Notes/>}/>
      <Route path={`${PrivateRoutes.NOTESPRESCHOOL}/:periodId/:classroomId`}                              element={<NotesPreschool/>}/>
      <Route path={`${PrivateRoutes.INDICADORES}/:periodId/:classroomId`}                                 element={<ConfigIndicadores/>}/>
      <Route path={`${PrivateRoutes.EVALUADORPREESCOLAR}/:periodId/:classroomId/:studentId/:year`}        element={<EvaluadorPreescolar/>}/>
      <Route path={`${PrivateRoutes.STUDENT}/:periodId/:classroomId/students`}                            element={<ClassroomStudents />} />
      <Route path={`${PrivateRoutes.CLASSROOMS}`}                                                         element={<ClassRoomPage />} />
      <Route path={`${PrivateRoutes.AREA}`}                                                               element={<AreaPage />} />
    </RoutesWithNotFound> 
  )
}
export default Dashboard