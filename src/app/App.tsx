import './App.css'
import store from './store/store'
import { Provider } from 'react-redux'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route } from 'react-router-dom'
import RoutesWithNotFound from '../shared/utils/routesWithNotFound'
import { PrivateRoutes, PublicRoutes } from './routes/routes'
import AuthGuard from './guard/auth.guard'

const Login = lazy(()=> import('../presentation/features/auth/LoginForm'))
const Private = lazy(()=> import('../presentation/pages/private/Private'))

function App() {
  return (
    <Suspense fallback={"Cargando..."}>
      <Provider store={store}>
        <BrowserRouter>
          <RoutesWithNotFound>     
            <Route path='/' element={<Navigate to={PublicRoutes.LOGIN}/>}/>
            <Route path={PublicRoutes.LOGIN} element={<Login/>}/>
            <Route element={<AuthGuard/>}>
              <Route path={`${PrivateRoutes.PRIVATE}/*`} element={ <Private/>}/>
            </Route>
          </RoutesWithNotFound>
        </BrowserRouter>
      </Provider>  
    </Suspense> 
  )
}

export default App