import { Navigate, Route} from "react-router-dom"
import { PrivateRoutes } from "../../../../app/routes/routes"
import RoutesWithNotFound from "../../../../shared/utils/routesWithNotFound"
import StudentsPage from "./components/StudentsPage"
import Home from "./components/Home"
import Academy from "./components/Academy"

function Dashboard() {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={PrivateRoutes.HISTORY}/>}/>
      <Route path={PrivateRoutes.HISTORY}                     element={<Home/>}/>
      <Route path={`${PrivateRoutes.ACADEMY}/:classroomId`}   element={<Academy/>}/>
      <Route path={PrivateRoutes.ACADEMY}                     element={<Academy/>}/>
      <Route path={PrivateRoutes.STUDENT}                     element={<StudentsPage/>}/>
    </RoutesWithNotFound> 
  )
}
export default Dashboard