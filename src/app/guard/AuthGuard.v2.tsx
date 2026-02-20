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
import { getUserByUid } from '../../infrastructure/user.service';

/**
 * User roles for authorization
 * TODO: Expandir cuando se implemente sistema de permisos completo
 */
export type UserRole = 'Administrativo' | 'Docente' | 'Coordinador';

/**
 * Auth states for the guard
 */
type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'inactive';

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
    const unsubscribe = AuthService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        try {
          // Verificar si el usuario está activo en Firestore
          const userProfile = await getUserByUid(authUser.uid);

          if (!userProfile) {
            // Usuario no existe en Firestore (solo tiene cuenta de Auth)
            // Permitir acceso pero sin datos de perfil
            const firebaseUser: any = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
              emailVerified: authUser.emailVerified,
              metadata: authUser.metadata,
            };
            dispatch(createUser(firebaseUser));
            setAuthState('authenticated');
            return;
          }

          // Verificar si el usuario está activo
          if (!userProfile.isActive) {
            // Usuario inhabilitado - cerrar sesión y mostrar mensaje
            await AuthService.signOut();
            // @ts-ignore - TODO: Fix Redux action type inference for resetUser
            dispatch(resetUser());
            setAuthState('inactive');
            return;
          }

          // Usuario activo - crear objeto con datos de Firestore
          const firebaseUser: any = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: userProfile.displayName || authUser.displayName,
            photoURL: authUser.photoURL,
            emailVerified: authUser.emailVerified,
            metadata: authUser.metadata,
            // Datos adicionales de Firestore
            role: userProfile.role,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            isActive: userProfile.isActive,
          };

          dispatch(createUser(firebaseUser));
          setAuthState('authenticated');
        } catch (error) {
          console.error('Error verificando estado del usuario:', error);
          // En caso de error, permitir acceso pero registrar el problema
          const firebaseUser: any = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            emailVerified: authUser.emailVerified,
            metadata: authUser.metadata,
          };
          dispatch(createUser(firebaseUser));
          setAuthState('authenticated');
        }
      } else {
        // Usuario no autenticado
        // @ts-ignore - TODO: Fix Redux action type inference for resetUser
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
   * @param user - Usuario actual desde Redux store (incluye role de Firestore)
   * @param roles - Roles permitidos para la ruta
   * @returns true si el usuario tiene alguno de los roles permitidos
   */
  const hasAllowedRole = (user: { role?: UserRole } | null, roles?: UserRole[]): boolean => {
    // Si no hay roles especificados, cualquier usuario autenticado puede acceder
    if (!roles || roles.length === 0) {
      return true;
    }

    // Si no hay usuario, no tiene acceso
    if (!user) {
      return false;
    }

    // Si el usuario no tiene rol asignado, no tiene acceso a rutas protegidas por rol
    if (!user.role) {
      return false;
    }

    // Verificar si el rol del usuario está en la lista de roles permitidos
    return roles.includes(user.role);
  };

  /**
   * Obtiene el rol del usuario actual desde el estado
   */
  const getUserRole = (): UserRole | undefined => {
    const user = userState as { role?: UserRole } | null;
    return user?.role;
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

  // Usuario inhabilitado: mostrar pantalla de cuenta inactiva
  if (authState === 'inactive') {
    return <InactiveAccountScreen />;
  }

  // Usuario autenticado: verificar roles
  if (!hasAllowedRole(userState as { role?: UserRole } | null, allowedRoles)) {
    // Usuario autenticado pero sin permisos suficientes
    return (
      <UnauthorizedScreen
        requiredRoles={allowedRoles}
        userRole={getUserRole()}
      />
    );
  }

  // Usuario autenticado y con permisos: renderizar rutas hijas
  return <Outlet />;
};

/**
 * LoadingScreen Component
 *
 * Pantalla de carga minimalista con spinner y fondo blur.
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        {/* Texto opcional */}
        <p className="text-sm text-gray-500 animate-pulse">Cargando...</p>
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

/**
 * InactiveAccountScreen Component
 *
 * Pantalla mostrada cuando el usuario tiene una cuenta inhabilitada.
 */
const InactiveAccountScreen: React.FC = () => {
  const handleGoToLogin = () => {
    window.location.href = `/${PublicRoutes.LOGIN}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono */}
        <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Cuenta Inhabilitada
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Tu cuenta ha sido temporalmente inhabilitada por un coordinador.
          Si crees que esto es un error, contacta con el administrador del sistema.
        </p>

        {/* Info box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-800 text-left">
              Mientras tu cuenta esté inhabilitada, no podrás acceder al sistema ni realizar ninguna operación.
            </p>
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={handleGoToLogin}
          className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Volver al inicio de sesión
        </button>

        {/* Contacto */}
        <p className="text-xs text-gray-500 mt-6">
          Colina Campestre School - Sistema Institucional Académico
        </p>
      </div>
    </div>
  );
};

export default AuthGuardV2;
