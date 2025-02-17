import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"
import { PublicRoutes } from "../routes/routes"
import { AppState } from "../store/store"

export const AuthGuard = () =>{
    const userState = useSelector((store: AppState) => store.user)

    if (!userState) {
        return <Navigate replace to={PublicRoutes.LOGIN} />;
    }

    return userState.uid ? <Outlet/> : <Navigate replace to={PublicRoutes.LOGIN}/>
}

export default AuthGuard;