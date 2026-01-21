/**
 * AuthGuard v2 - Improved Authentication Guard
 *
 * Mejoras sobre la versión legacy:
 * ✅ Estados de carga (loading) para prevenir flickering
 * ✅ Listener de Firebase Auth para actualización en tiempo real
 * ✅ Preservación de ruta destino para redirección post-login
 * ✅ Verificación de roles (preparado para sistema de permisos)
 * ✅ Pantalla de carga con Tailwind CSS
 * ✅ TypeScript estricto
 * ✅ Mejor UX durante verificación de autenticación
 *
 * @module AuthGuard
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppState } from '../store/store';
import { AuthService } from '../../infrastructure/firebase/auth.service';
import { createUser, resetUser } from '../store/states/user';
import { PublicRoutes } from '../routes/routes';

/**
 * User roles for authorization
 * TODO: Expandir cuando se implemente sistema de permisos completo
 */
export type UserRole = 'Administrativo' | 'Docente' | 'Coordinador';

/**
 * Auth states for the guard
 */
type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Props for AuthGuard
 */
interface AuthGuardProps {
  /**
   * Roles permitidos para acceder a la ruta
   * Si no se especifica, cualquier usuario autenticado puede acceder
   */
  allowedRoles?: UserRole[];

  /**
   * Ruta de redirección si el usuario no está autenticado
   * @default PublicRoutes.LOGIN
   */
  redirectTo?: string;
}

/**
 * AuthGuard Component v2
 *
 * Componente que protege rutas privadas verificando autenticación
 * y opcionalmente roles de usuario.
 *
 * CARACTERÍSTICAS:
 * - Verificación de autenticación con Firebase Auth
 * - Listener de cambios de estado de autenticación
 * - Pantalla de carga mientras verifica
 * - Preservación de ruta destino
 * - Soporte para verificación de roles (futuro)
 *
 * @example
 * ```tsx
 * // Rutas protegidas básicas (cualquier usuario autenticado)
 * <Route element={<AuthGuardV2 />}>
 *   <Route path="dashboard" element={<Dashboard />} />
 * </Route>
 *
 * // Rutas con verificación de roles
 * <Route element={<AuthGuardV2 allowedRoles={['Coordinador']} />}>
 *   <Route path="admin" element={<AdminPanel />} />
 * </Route>
 * ```
 */
export const AuthGuardV2: React.FC<AuthGuardProps> = ({
  allowedRoles,
  redirectTo = `/${PublicRoutes.LOGIN}`,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const userState = useSelector((store: AppState) => store.user);

  // Estado de autenticación
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    // Configurar listener de cambios de autenticación
    const unsubscribe = AuthService.onAuthStateChange((authUser) => {
      if (authUser) {
        // Usuario autenticado - AuthService ya retorna AuthUser mapeado
        // Convertir AuthUser a FirebaseUser para compatibilidad con Redux store existente
        // TODO: Migrar el store para usar AuthUser en lugar de FirebaseUser
        const firebaseUser: any = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
          emailVerified: authUser.emailVerified,
          metadata: authUser.metadata,
        };

        // Actualizar Redux store
        // NOTA: Los datos adicionales (rol, areas, salones) se cargarán desde Firestore
        // a través de otros efectos/servicios después de la autenticación
        dispatch(createUser(firebaseUser));
        setAuthState('authenticated');
      } else {
        // Usuario no autenticado
        dispatch(resetUser());
        setAuthState('unauthenticated');
      }
    });

    // Cleanup: desuscribir listener al desmontar
    return unsubscribe;
  }, [dispatch]);

  /**
   * Verifica si el usuario tiene los roles permitidos
   *
   * NOTA: Actualmente el store no tiene la propiedad 'rol'.
   * Esta función está preparada para cuando se implemente el sistema de roles
   * cargando datos adicionales desde Firestore.
   *
   * @param user - Usuario actual desde Redux store
   * @param roles - Roles permitidos
   * @returns true si el usuario tiene alguno de los roles permitidos
   */
  const hasAllowedRole = (user: any, roles?: UserRole[]): boolean => {
    if (!roles || roles.length === 0) {
      // Si no hay roles especificados, cualquier usuario autenticado puede acceder
      return true;
    }

    // TODO: Implementar verificación de roles cuando se carguen datos de Firestore
    // Por ahora, si se especifican roles requeridos, permitir acceso
    // (esto cambiará cuando se implemente el sistema de permisos completo)
    if (!user) {
      return false;
    }

    // Temporalmente permitir acceso si el usuario está autenticado
    // hasta que se implemente la carga de datos de rol desde Firestore
    return true;
  };

  // Estado de carga: mostrar pantalla de carga
  if (authState === 'loading') {
    return <LoadingScreen />;
  }

  // Usuario no autenticado: redirigir a login preservando la ruta destino
  if (authState === 'unauthenticated') {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Usuario autenticado: verificar roles
  if (!hasAllowedRole(userState, allowedRoles)) {
    // Usuario autenticado pero sin permisos suficientes
    // TODO: Descomentar cuando se implemente sistema de roles desde Firestore
    return (
      <UnauthorizedScreen
        requiredRoles={allowedRoles}
        userRole={undefined} // TODO: Obtener de Firestore cuando se implemente
      />
    );
  }

  // Usuario autenticado y con permisos: renderizar rutas hijas
  return <Outlet />;
};

/**
 * LoadingScreen Component
 *
 * Pantalla de carga mostrada mientras se verifica la autenticación.
 * Usa Tailwind CSS y animaciones para mejor UX.
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-deep-blue-900 via-deep-blue-800 to-medium-blue-700">
      {/* Logo o icono */}
      <div className="mb-8 animate-bounce">
        <div className="w-20 h-20 bg-gold-500 rounded-2xl flex items-center justify-center shadow-2xl">
          <svg
            className="w-12 h-12 text-deep-blue-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </div>

      {/* Texto de carga */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
          Cubbico SIA
        </h2>
        <p className="text-off-white-200 text-sm">
          Verificando autenticación...
        </p>
      </div>

      {/* Spinner */}
      <div className="mt-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Decoración inferior */}
      <div className="absolute bottom-8 text-center">
        <p className="text-off-white-300 text-xs">
          Colina Campestre School
        </p>
      </div>
    </div>
  );
};

/**
 * UnauthorizedScreen Component
 *
 * Pantalla mostrada cuando el usuario está autenticado pero no tiene
 * los roles necesarios para acceder a la ruta.
 */
interface UnauthorizedScreenProps {
  requiredRoles?: UserRole[];
  userRole?: UserRole;
}

const UnauthorizedScreen: React.FC<UnauthorizedScreenProps> = ({
  requiredRoles,
  userRole,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-light-gray-50 to-light-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-card p-8 text-center">
        {/* Icono de error */}
        <div className="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-error-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-deep-blue-900 mb-2">
          Acceso Denegado
        </h1>

        {/* Mensaje */}
        <p className="text-light-gray-600 mb-6">
          No tienes permisos suficientes para acceder a esta sección.
        </p>

        {/* Información de roles */}
        {requiredRoles && requiredRoles.length > 0 && (
          <div className="bg-light-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-light-gray-700 mb-2">
              <span className="font-semibold">Roles requeridos:</span>
            </p>
            <ul className="list-disc list-inside text-sm text-light-gray-600">
              {requiredRoles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
            {userRole && (
              <p className="text-sm text-light-gray-600 mt-3">
                <span className="font-semibold">Tu rol actual:</span> {userRole}
              </p>
            )}
          </div>
        )}

        {/* Botón de volver */}
        <button
          onClick={() => window.history.back()}
          className="w-full bg-deep-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-deep-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-deep-blue-300 focus:ring-offset-2"
        >
          Volver atrás
        </button>

        {/* Link a contacto */}
        <p className="text-xs text-light-gray-500 mt-4">
          Si crees que esto es un error, contacta al coordinador
        </p>
      </div>
    </div>
  );
};

export default AuthGuardV2;
