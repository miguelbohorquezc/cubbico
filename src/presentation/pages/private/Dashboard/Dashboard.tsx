import { Navigate, Route} from "react-router-dom"
import { PrivateRoutes } from "../../../../app/routes/routes"
import RoutesWithNotFound from "../../../../shared/utils/routesWithNotFound"
import StudentsPage from "./components/StudentsPage"
import Home from "./components/Home"
import Academy from "./components/Academy"
import Notes from "./components/Notes"
import AcademicReport from "../../../components/classRoomReport/AcademicReport"

function Dashboard() {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={PrivateRoutes.HISTORY}/>}/>
      <Route path={PrivateRoutes.HISTORY}                                     element={<Home/>}/>
      <Route path={`${PrivateRoutes.ACADEMY}/:classroomNivel/:classroomId`}   element={<Academy/>}/>
      <Route path={`${PrivateRoutes.ACADEMY}/:classroomId/:areaId`}           element={<Academy/>}/>
      <Route path={`${PrivateRoutes.NOTES}/:periodId/:classroomId/:areaId`}   element={<Notes/>}/>
      <Route path={`${PrivateRoutes.ACADEMY}/:periodId`}                      element={<Academy/>}/>
      <Route path={PrivateRoutes.STUDENT}                                     element={<StudentsPage/>}/>
      <Route path={`${PrivateRoutes.REPORT}/:studentId/:year`}   element={<AcademicReport />} />

      <Route path={`${PrivateRoutes.REPORT}/:schoolLevel/:studentId/:year`} element={<AcademicReport/>}/>
    </RoutesWithNotFound> 
  )
}
export default Dashboard