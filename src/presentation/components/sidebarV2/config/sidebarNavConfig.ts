/**
 * @fileoverview Configuración de navegación del SidebarV2
 * @module presentation/components/sidebarV2/config/sidebarNavConfig
 *
 * Centraliza la configuración de items de navegación,
 * acciones y marca del sidebar.
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import {
  DashboardIcon,
  UsersIcon,
  ClassroomIcon,
  BookIcon,
  CalendarIcon,
  EvaluationIcon,
  AspirantIcon,
  EnrollmentIcon,
  SettingsIcon,
  LogoutIcon,
} from '../../icons/SidebarIcons';
import { PrivateRoutes } from '../../../../app/routes/routes';
import type { NavItem } from '../../../../shared/types/dashboardTypes';
import type { SidebarBrandConfig } from '../../../../shared/types/layoutTypes';

// ============================================
// Rutas base
// ============================================

const BASE_PATH = '/private/dashboard';

/**
 * Construye una ruta completa del dashboard
 */
const buildPath = (route: string): string => `${BASE_PATH}/${route}`;

// ============================================
// Configuración de Marca
// ============================================

/**
 * Configuración del logo y nombre de la aplicación
 */
export const brandConfig: SidebarBrandConfig = {
  name: 'Cubbico',
  logoAlt: 'Cubbico - Sistema Institucional Académico',
  onLogoClick: undefined, // Usa navegación por defecto a Home
};

// ============================================
// Items de Navegación Principal
// ============================================

/**
 * Items del menú principal del sidebar
 *
 * Permisos por rol:
 * - Sin allowedRoles: visible para todos los usuarios autenticados
 * - allowedRoles: ['Coordinador']: solo visible para coordinadores
 * - allowedRoles: ['Docente', 'Coordinador']: visible para ambos roles
 */
export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: buildPath(PrivateRoutes.HISTORY),
    icon: DashboardIcon,
    description: 'Inicio y resumen general',
    // Sin allowedRoles = visible para todos
  },
  {
    id: 'matricula',
    label: 'Matrícula',
    path: null,
    icon: EnrollmentIcon,
    description: 'Gestión de matrículas',
    allowedRoles: ['Coordinador'],
    submenu: [
      {
        id: 'matricula-nuevo',
        label: 'Nuevo estudiante',
        path: buildPath(PrivateRoutes.CREATESTUDENT),
        description: 'Registrar nuevo estudiante',
      }/* ,
      {
        id: 'matricula-lista',
        label: 'Lista de estudiantes',
        path: buildPath(PrivateRoutes.STUDENT),
        description: 'Ver todos los estudiantes',
      }, */
    ],
  },
  {
    id: 'salones',
    label: 'Salones',
    path: null,
    icon: ClassroomIcon,
    description: 'Gestión de salones',
    allowedRoles: ['Coordinador'],
    submenu: [
      {
        id: 'salones-lista',
        label: 'Administrar salones',
        path: buildPath(PrivateRoutes.CLASSROOMS),
        description: 'Crear y editar salones',
      },
    ],
  },
  {
    id: 'asignaturas',
    label: 'Asignaturas',
    path: buildPath(PrivateRoutes.AREA),
    icon: BookIcon,
    description: 'Gestión de asignaturas y áreas',
    allowedRoles: ['Coordinador'],
  },
  {
    id: 'horario',
    label: 'Horario',
    path: null,
    icon: CalendarIcon,
    description: 'Horarios y asistencias',
    allowedRoles: ['Coordinador'],
    submenu: [
      {
        id: 'horario-editor',
        label: 'Editor de Horarios',
        path: buildPath(PrivateRoutes.HORARIO),
        description: 'Construir horario semanal',
      },
      {
        id: 'horario-asistencias',
        label: 'Informes de Asistencia',
        path: buildPath(`${PrivateRoutes.ASISTENCIA}/overview`),
        description: 'Ver informes por salón',
      },
    ],
  },
  {
    id: 'periodos',
    label: 'Períodos',
    path: null,
    icon: CalendarIcon,
    description: 'Períodos académicos',
    allowedRoles: ['Docente', 'Coordinador'],
    submenu: [
      {
        id: 'periodo-1',
        label: 'Período 1',
        path: `${buildPath(PrivateRoutes.ACADEMY)}/1`,
        description: 'Primer período académico',
      },
      {
        id: 'periodo-2',
        label: 'Período 2',
        path: `${buildPath(PrivateRoutes.ACADEMY)}/2`,
        description: 'Segundo período académico',
      },
      {
        id: 'periodo-3',
        label: 'Período 3',
        path: `${buildPath(PrivateRoutes.ACADEMY)}/3`,
        description: 'Tercer período académico',
      },
      {
        id: 'periodo-4',
        label: 'Período 4',
        path: `${buildPath(PrivateRoutes.ACADEMY)}/4`,
        description: 'Cuarto período académico',
      },
    ],
  },
  {
    id: 'evaluaciones',
    label: 'Evaluaciones',
    path: buildPath(PrivateRoutes.ACADEMY),
    icon: EvaluationIcon,
    description: 'Gestión de evaluaciones',
    allowedRoles: ['Docente', 'Coordinador'],
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    path: buildPath(PrivateRoutes.USER),
    icon: UsersIcon,
    description: 'Gestión de usuarios del sistema',
    allowedRoles: ['Coordinador'],
  },
  {
    id: 'aspirantes',
    label: 'Aspirantes',
    path: buildPath(PrivateRoutes.ASPIRANTS),
    icon: AspirantIcon,
    description: 'Gestión de admisiones',
    allowedRoles: ['Coordinador'],
  },
];

// ============================================
// Items de Acciones (Sección Inferior)
// ============================================

/**
 * Items de la sección inferior del sidebar
 */
export const actionItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Configuración',
    path: buildPath(PrivateRoutes.USER),
    icon: SettingsIcon,
    description: 'Configuración del sistema',
  },
  {
    id: 'logout',
    label: 'Cerrar sesión',
    path: null,
    icon: LogoutIcon,
    description: 'Salir del sistema',
  },
];

// ============================================
// Configuración Completa
// ============================================

/**
 * Configuración completa del sidebar
 */
export const sidebarConfig = {
  brand: brandConfig,
  navItems,
  actionItems,
};

// ============================================
// Utilidades
// ============================================

/**
 * Encuentra un item de navegación por su ID
 */
export const findNavItemById = (id: string): NavItem | undefined => {
  // Buscar en items principales
  const mainItem = navItems.find((item) => item.id === id);
  if (mainItem) return mainItem;

  // Buscar en submenús
  for (const item of navItems) {
    if (item.submenu) {
      const subItem = item.submenu.find((sub) => sub.id === id);
      if (subItem) {
        return {
          ...item,
          path: subItem.path,
          label: subItem.label,
        };
      }
    }
  }

  // Buscar en acciones
  return actionItems.find((item) => item.id === id);
};

/**
 * Obtiene todos los paths de navegación
 */
export const getAllNavPaths = (): string[] => {
  const paths: string[] = [];

  navItems.forEach((item) => {
    if (item.path) paths.push(item.path);
    if (item.submenu) {
      item.submenu.forEach((sub) => paths.push(sub.path));
    }
  });

  return paths;
};

// ============================================
// Exports
// ============================================

export default sidebarConfig;
