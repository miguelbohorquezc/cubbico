import {lazy} from 'react'
import { Navigate, Route } from "react-router-dom";
import { PrivateRoutes} from "../../../app/routes/routes";
import RoutesWithNotFound from '../../../shared/utils/routesWithNotFound';

const Dashboard = lazy(() => import('./Dashboard/Dashboard'))

function Private() {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={PrivateRoutes.DASHBOARD}/>}/>
      <Route path={`${PrivateRoutes.DASHBOARD}/*`} element={<Dashboard/>}/>
    </RoutesWithNotFound>
  )
}
export default Private