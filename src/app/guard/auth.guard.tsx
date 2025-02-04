import { useSelector } from "react-redux"
import { AppStore } from "../store/store"
import { Navigate, Outlet } from "react-router-dom"
import { PublicRoutes } from "../routes/routes"

export const AuthGuard = () =>{
    const userState = useSelector((store: AppStore) => store.user)
    return !userState.uid ? <Outlet/> : <Navigate replace to={PublicRoutes.LOGIN}/>
}

export default AuthGuard;