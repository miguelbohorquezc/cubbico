import './App.css'
import store from './store/store'
import { Provider } from 'react-redux'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route } from 'react-router-dom'
import RoutesWithNotFound from '../shared/utils/routesWithNotFound'
import { PrivateRoutes, PublicRoutes } from './routes/routes'
// MIGRACIÓN MT-010b: Usando AuthGuardV2 (nuevo sistema de autenticación mejorado)
import { AuthGuardV2 } from './guard/AuthGuard.v2'
import AspirantesPage from '../presentation/pages/public/Public'
import MatriculaPage from '../presentation/pages/public/MatriculaPage'

// MIGRACIÓN MT-010a: Usando LoginFormTailwind (nuevo sistema de autenticación)
const Login = lazy(()=> import('../presentation/features/auth/components/LoginFormTailwind'))
const Private = lazy(()=> import('../presentation/pages/private/Private'))

function App() {
  return (
    <Suspense fallback={"Cargando..."}>
      <Provider store={store}>
        <BrowserRouter>
          <RoutesWithNotFound>
            <Route path='/' element={<Navigate to={PublicRoutes.LOGIN}/>}/>
            <Route path={PublicRoutes.LOGIN} element={<Login/>}/>
            <Route path={PublicRoutes.ASPIRANTES} element={<AspirantesPage />} />
            <Route path={PublicRoutes.MATRICULAS} element={<MatriculaPage />} />
            {/* MT-010b: Usando AuthGuardV2 con mejoras de UX y manejo de estados */}
            <Route element={<AuthGuardV2/>}>
              <Route path={`${PrivateRoutes.PRIVATE}/*`} element={ <Private/>}/>
            </Route>
          </RoutesWithNotFound>
        </BrowserRouter>
      </Provider>  
    </Suspense> 
  )
}

export default App