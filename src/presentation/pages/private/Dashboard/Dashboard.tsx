import { Navigate, Route} from "react-router-dom"
import { PrivateRoutes } from "../../../../app/routes/routes"
import RoutesWithNotFound from "../../../../shared/utils/routesWithNotFound"
import StudentsPage from "./components/StudentsPage"
import Home from "./components/Home"

function Dashboard() {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={PrivateRoutes.HOME}/>}/>
      <Route path={PrivateRoutes.HOME}     element={<Home/>}/>
      <Route path={PrivateRoutes.STUDENT}  element={<StudentsPage/>}/>
    </RoutesWithNotFound> 
  )
}
export default Dashboard