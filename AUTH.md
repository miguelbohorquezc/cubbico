# AUTH.md - Plan de Mejora del Sistema de Autenticación

## Estado del Proyecto
- **Fecha de inicio:** 2026-01-23
- **Branch:** fix-update
- **Última actualización:** 2026-01-23

---

## Resumen de Requerimientos

### Registro de Usuarios
- Formulario con: nombres, apellidos, correo, contraseña
- Selección de rol: Coordinador o Docente
- Coordinador: checkbox "¿Dará clases?" para mostrar configuración de niveles/salones/áreas
- Docente: siempre muestra configuración de niveles/salones/áreas

### Permisos por Rol

#### Coordinador
- Crear, editar, eliminar, inhabilitar usuarios
- Actualizar rol de usuarios (coordinador ↔ docente)
- Gestionar salones de clases, estudiantes, asignaturas
- Revisión e impresión de informes
- Acceder a registros de docentes y modificar logros/notas/observadores
- Todo lo que un docente puede hacer (si tiene salones/asignaturas asignados)
- [FUTURO] Registrar estudiantes y gestionar su información
- [FUTURO] Configurar modo de evaluación específico por estudiante

#### Docente
- Registrar asistencias
- Registrar logros y notas de estudiantes
- Realizar observadores
- Solo en sus salones/asignaturas asignados

### Otras Funcionalidades
- Tabla de gestión de usuarios (CRUD completo)
- Recuperación de contraseña desde login

---

## FASE 1: Mejoras al Registro de Usuarios

### Microtarea 1.1: Actualizar entidad UserFormData
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Agregar campos `firstName` y `lastName` a la entidad de usuario
- **Archivos:**
  - `src/domain/entities/userFormData.ts`
  - `src/infrastructure/user.service.ts`
- **Definition of Done:**
  - [x] Interface `UserFormData` incluye `firstName: string` y `lastName: string`
  - [x] Función `createUser` guarda los nuevos campos en Firestore
  - [x] TypeScript compila sin errores
- **Cambios realizados (2026-01-23):**
  - Agregados campos: `firstName`, `lastName`, `willTeach`, `isActive` a `UserFormData`
  - Tipado de `role` cambiado de `string` a `'Coordinador' | 'Docente'`
  - Creada nueva interface `UserProfile` para datos de Firestore
  - `createUser` ahora guarda todos los campos nuevos incluyendo `displayName`
  - `getUsers` ahora retorna `UserProfile[]` en lugar de `any[]`
  - `fetchDocentes` actualizado para construir displayName desde firstName/lastName

---

### Microtarea 1.2: Agregar campos nombre y apellido al formulario
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Actualizar UI del formulario para capturar nombre y apellido
- **Archivos:**
  - `src/presentation/components/userForm/CreateUserForm.tsx`
  - `src/presentation/components/userForm/useUserForm.ts`
- **Definition of Done:**
  - [x] Campos de texto para `firstName` y `lastName` en el formulario
  - [x] Validación de campos requeridos (mínimo 2 caracteres)
  - [x] Estado inicial del form incluye nuevos campos
  - [x] Hook maneja correctamente los nuevos campos
- **Cambios realizados (2026-01-23):**
  - Agregados campos firstName y lastName al estado inicial del form
  - Validaciones de longitud mínima implementadas
  - Opciones de rol reducidas a Coordinador/Docente (eliminado Administrativo)
  - Campos preservados al cambiar de rol

---

### Microtarea 1.3: Lógica condicional para rol Coordinador
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Checkbox "¿Dará clases?" para coordinadores
- **Archivos:**
  - `src/presentation/components/userForm/CreateUserForm.tsx`
  - `src/presentation/components/userForm/useUserForm.ts`
- **Definition of Done:**
  - [x] Checkbox visible solo cuando rol es "Coordinador"
  - [x] Si marca checkbox, muestra campos de niveles/salones/áreas
  - [x] Estado `willTeach: boolean` agregado al formulario
  - [x] Campo guardado en Firestore
- **Cambios realizados (2026-01-23):**
  - Función `handleWillTeachChange` creada para manejar el checkbox
  - Lógica condicional: `showTeachingAssignments` para Docente O Coordinador+willTeach
  - Al desmarcar willTeach se limpian todas las asignaciones
  - Validaciones ajustadas para aplicar solo cuando requiere asignaciones
  - Eliminados casteos `as any` por tipos correctos

---

## FASE 2: Tabla de Gestión de Usuarios

### Microtarea 2.1: Crear componente UserTable
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Tabla que muestre todos los usuarios del sistema
- **Archivos:**
  - Crear: `src/presentation/components/userList/UserTable.tsx`
  - `src/app/store/states/user.slice.ts`
- **Definition of Done:**
  - [x] Componente `UserTable` con Tailwind CSS
  - [x] Columnas: Nombre, Email, Rol, Estado
  - [x] Carga usuarios desde Redux
  - [x] Loading skeleton y mensaje vacío
- **Cambios realizados (2026-01-23):**
  - Componente UserTable creado con Tailwind CSS
  - Loading skeleton animado, estado de error con retry
  - Badges de colores para roles y estados

---

### Microtarea 2.2: Inhabilitar/habilitar usuarios
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Toggle de estado activo/inactivo
- **Archivos:**
  - `src/infrastructure/user.service.ts`
  - `src/presentation/components/userList/UserTable.tsx`
- **Definition of Done:**
  - [x] Función `toggleUserStatus(userId, isActive)`
  - [x] Campo `isActive: boolean` en Firestore
  - [x] Botón toggle en cada fila
  - [x] Confirmación antes de inhabilitar
- **Cambios realizados (2026-01-23):**
  - Función toggleUserStatus agregada al servicio
  - Modal de confirmación implementado en UserTable
  - Usuarios inactivos se muestran con opacidad reducida

---

### Microtarea 2.3: Cambio de rol de usuario
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Permitir cambiar rol Coordinador ↔ Docente
- **Archivos:**
  - `src/presentation/components/userList/UserTable.tsx`
  - `src/infrastructure/user.service.ts`
- **Definition of Done:**
  - [x] Dropdown/modal para seleccionar nuevo rol
  - [x] Función `updateUserRole(userId, newRole)`
  - [x] Advertencia si hay asignaciones que se perderán
  - [x] Confirmación antes de cambiar
- **Cambios realizados (2026-01-23):**
  - Función updateUserRole con opción clearAssignments
  - Modal de confirmación reutilizable para todas las acciones
  - Advertencia sobre pérdida de asignaciones al cambiar rol

---

### Microtarea 2.4: Eliminación de usuario
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Eliminar usuarios del sistema
- **Archivos:**
  - `src/presentation/components/userList/UserTable.tsx`
  - `src/app/store/states/user.slice.ts`
- **Definition of Done:**
  - [x] Botón eliminar en cada fila
  - [x] Modal de confirmación con doble verificación
  - [x] No permite eliminar usuario logueado
  - [x] Lista se actualiza automáticamente
- **Cambios realizados (2026-01-23):**
  - Integrado thunk deleteUser del slice
  - Botón eliminar oculto para usuario actual (currentUserId)
  - Modal de confirmación reutilizado

---

### Microtarea 2.5: Integrar UserTable en página Users
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Mostrar tabla en página de gestión
- **Archivos:**
  - `src/presentation/pages/private/Dashboard/components/Users.tsx`
- **Definition of Done:**
  - [x] `UserTable` integrado en la página
  - [x] Dispatch de `fetchUsers` al montar
  - [x] Layout responsive
- **Cambios realizados (2026-01-23):**
  - UserTable importado e integrado en body-container-page
  - currentUserId pasado desde Redux state
  - Título corregido a "Gestion de Usuarios"
  - Título del modal corregido a "Registrar Nuevo Usuario"

---

## FASE 3: Recuperación de Contraseña

### Microtarea 3.1: Crear ForgotPasswordModal
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Modal para solicitar recuperación de contraseña
- **Archivos:**
  - Crear: `src/presentation/features/auth/components/ForgotPasswordModal.tsx`
- **Definition of Done:**
  - [x] Modal con Tailwind CSS
  - [x] Campo email con validación
  - [x] Usa `AuthService.sendPasswordReset()`
  - [x] Mensajes de éxito/error
- **Cambios realizados (2026-01-23):**
  - Componente ForgotPasswordModal creado con Tailwind CSS
  - Validación de email con regex
  - Estado de éxito con instrucciones para el usuario
  - Manejo de errores del servicio

---

### Microtarea 3.2: Integrar en LoginFormTailwind
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Conectar enlace "Olvidé mi contraseña" con el modal
- **Archivos:**
  - `src/presentation/features/auth/components/LoginFormTailwind.tsx`
  - `src/presentation/features/auth/components/index.ts`
- **Definition of Done:**
  - [x] Estado `showForgotModal` en LoginFormTailwind
  - [x] Click abre el modal
  - [x] Reemplazar alert placeholder
- **Cambios realizados (2026-01-23):**
  - Estado showForgotModal agregado
  - Enlace convertido a botón que abre el modal
  - ForgotPasswordModal integrado al final del JSX
  - Export agregado en index.ts

---

## FASE 3.5: Normalización UI con Tailwind CSS

### Microtarea 3.5.1: Convertir Modal genérico a Tailwind
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Migrar Modal.tsx de CSS a Tailwind CSS
- **Archivos:**
  - `src/presentation/components/modal/Modal.tsx`
- **Definition of Done:**
  - [x] Modal usa solo clases Tailwind
  - [x] Consistente con ForgotPasswordModal y modal de UserTable
  - [x] Eliminar dependencia de Modal.css
- **Cambios realizados (2026-01-23):**
  - Modal completamente migrado a Tailwind CSS
  - Agregado prop `size` para diferentes tamaños (sm, md, lg, xl)
  - Backdrop con click para cerrar
  - Accesibilidad mejorada (aria-modal, aria-labelledby)
  - Scroll interno para contenido largo

---

### Microtarea 3.5.2: Convertir CreateUserForm a Tailwind
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Migrar formulario de creación de usuarios a Tailwind CSS
- **Archivos:**
  - `src/presentation/components/userForm/CreateUserForm.tsx`
- **Definition of Done:**
  - [x] Formulario usa solo clases Tailwind
  - [x] Consistente con LoginFormTailwind
  - [x] Eliminar import de UserForm.css
  - [x] Responsive mobile-first
- **Cambios realizados (2026-01-23):**
  - Formulario 100% Tailwind CSS (eliminado import UserForm.css)
  - Grid responsive para nombre/apellido
  - Indicadores de requisitos de contrasena con iconos
  - Secciones coloreadas: purple para coordinador, blue para asignaciones
  - Botones pill para niveles educativos
  - Listas scrollables para asignaturas/salones
  - Spinner de carga en boton submit
  - Eliminado boton logout (innecesario en modal)

---

## FASE 3.6: Mejoras UI Página de Usuarios

### Microtarea 3.6.1: Mejorar UserTable con edición de nombres
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Agregar modal de edición para nombres/apellidos y mejorar UI de la tabla
- **Archivos:**
  - `src/presentation/components/userList/UserTable.tsx`
  - `src/infrastructure/user.service.ts`
- **Definition of Done:**
  - [x] Modal de edición para firstName/lastName
  - [x] Función updateUserNames en servicio
  - [x] UI mejorada con iconos y hover states
  - [x] Feedback visual al editar
- **Cambios realizados (2026-01-23):**
  - Función updateUserNames agregada al servicio
  - Modal de edición con campos firstName/lastName
  - Búsqueda/filtro de usuarios implementado
  - Avatar con inicial coloreada según rol

---

### Microtarea 3.6.2: Integrar layout existente y agregar Tooltips
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Usar componente Sidebar existente y agregar Tooltips a botones de acción
- **Archivos:**
  - `src/presentation/pages/private/Dashboard/components/Users.tsx`
  - `src/presentation/components/userList/UserTable.tsx`
- **Definition of Done:**
  - [x] Users.tsx usa componente Sidebar existente (patrón de History.tsx)
  - [x] Botones de acción tienen Tooltips descriptivos
  - [x] Código simplificado sin sidebar/navbar embebido
  - [x] Consistente con el resto del dashboard
- **Cambios realizados (2026-01-24):**
  - Users.tsx refactorizado para usar `SidebarV2` y `HeaderV2` (patrón de Home.tsx)
  - Hook `useSidebarCollapsed` para sincronizar estado del sidebar
  - Layout con gradient icons y estilos consistentes con dashboard
  - Componente Tooltip importado en UserTable
  - Tooltips agregados a botones: Editar, Cambiar rol, Inhabilitar/Habilitar, Eliminar

---

## FASE 4: Sistema de Permisos por Rol

### Microtarea 4.1: Crear servicio getUserByUid
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Cargar rol y permisos del usuario desde Firestore
- **Archivos:**
  - `src/infrastructure/user.service.ts`
  - `src/domain/entities/userFormData.ts`
- **Definition of Done:**
  - [x] Función `getUserByUid(uid): Promise<UserProfile>`
  - [x] Interface `UserProfile` con rol, áreas, salones, isActive
  - [x] Manejo de usuario no existente
- **Cambios realizados (2026-01-24):**
  - Función `getUserByUid` implementada en user.service.ts (líneas 190-218)
  - Retorna UserProfile completo o null si no existe
  - Maneja errores y valores por defecto

---

### Microtarea 4.2: Cargar datos de usuario al login
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Después de autenticar, cargar datos de Firestore
- **Archivos:**
  - `src/app/guard/AuthGuard.v2.tsx`
  - `src/app/store/states/user.ts`
- **Definition of Done:**
  - [x] AuthGuard llama `getUserByUid` después de autenticar
  - [x] Datos de Firestore se agregan al store
  - [x] Estado incluye `role: UserRole | null`
- **Cambios realizados (2026-01-24):**
  - AuthGuardV2 llama `getUserByUid` en línea 96
  - Datos de Firestore (role, firstName, lastName, isActive) se incluyen en el usuario
  - Verificación de isActive para usuarios inhabilitados

---

### Microtarea 4.3: Verificación de roles en AuthGuardV2
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Activar verificación de roles en el guard
- **Archivos:**
  - `src/app/guard/AuthGuard.v2.tsx`
- **Definition of Done:**
  - [x] Función `hasAllowedRole` verifica rol del usuario
  - [x] Compara contra `allowedRoles` prop
  - [x] Si no tiene permiso, muestra `UnauthorizedScreen` con rol actual
- **Cambios realizados (2026-01-24):**
  - `hasAllowedRole` ahora verifica `user.role` contra `allowedRoles`
  - Tipado mejorado: `user: { role?: UserRole } | null`
  - Nueva función `getUserRole()` para obtener rol actual
  - `UnauthorizedScreen` ahora recibe el rol del usuario

---

### Microtarea 4.4: Proteger rutas según rol
- **Estado:** ✅ COMPLETADA
- **Objetivo:** Aplicar restricciones de rol a rutas
- **Archivos:**
  - `src/presentation/pages/private/Dashboard/Dashboard.tsx`
- **Definition of Done:**
  - [x] Rutas administrativas (user, classrooms, area, student, aspirants) solo para Coordinador
  - [x] Rutas de notas/reportes/academia para Docente y Coordinador
  - [x] Pantalla de acceso denegado funcional (ya implementada en 4.3)
- **Cambios realizados (2026-01-24):**
  - Importado AuthGuardV2 en Dashboard.tsx
  - Rutas agrupadas en 3 categorías:
    1. Públicas (cualquier autenticado): `/`, `/history`
    2. Administrativas (Coordinador): `/user`, `/classrooms`, `/area`, `/student`, `/aspirants`
    3. Académicas (Docente + Coordinador): `/academy`, `/notes`, `/report`, preescolar
  - Documentación de permisos en comentarios JSDoc

---

## Resumen de Progreso

| Fase | Total | Completadas | Pendientes | En Progreso |
|------|-------|-------------|------------|-------------|
| Fase 1 | 3 | 3 | 0 | 0 |
| Fase 2 | 5 | 5 | 0 | 0 |
| Fase 3 | 2 | 2 | 0 | 0 |
| Fase 3.5 | 2 | 2 | 0 | 0 |
| Fase 3.6 | 2 | 2 | 0 | 0 |
| Fase 4 | 4 | 4 | 0 | 0 |
| **Total** | **18** | **18** | **0** | **0** |

---

## Notas de Implementación

### Módulos Protegidos (NO TOCAR)
- `src/presentation/components/notes/`
- `src/presentation/components/achievement/`
- `src/presentation/components/classRoomReport/`
- `src/presentation/components/informeGeneral/`

### Reglas de AGENTS.md
- Máximo 2 archivos por microtarea
- TypeScript estricto, no `any`, no `@ts-ignore` sin explicación
- Tailwind CSS para nuevos componentes
- Redux solo para estado global

---

## Historial de Cambios

| Fecha | Microtarea | Cambios |
|-------|------------|---------|
| 2026-01-23 | - | Plan inicial creado |
| 2026-01-23 | 1.1 | Entidad UserFormData actualizada con firstName, lastName, willTeach, isActive. Creada interface UserProfile. Servicio createUser actualizado. |
| 2026-01-23 | 1.2 | Formulario actualizado con campos nombre/apellido. Validaciones implementadas. Roles reducidos a Coordinador/Docente. |
| 2026-01-23 | 1.3 | Checkbox "¿Dará clases?" implementado. Lógica condicional para mostrar asignaciones. handleWillTeachChange creado. |
| 2026-01-23 | 2.1 | Componente UserTable creado con Tailwind CSS. Loading skeleton, badges de colores. |
| 2026-01-23 | 2.2 | Función toggleUserStatus en servicio. Modal de confirmación en tabla. |
| 2026-01-23 | 2.3 | Función updateUserRole con clearAssignments. Modal reutilizable para acciones. |
| 2026-01-23 | 2.4 | Eliminación de usuarios integrada con thunk deleteUser. Protección usuario actual. |
| 2026-01-23 | 2.5 | UserTable integrado en página Users.tsx. Títulos corregidos. |
| 2026-01-23 | 3.1 | ForgotPasswordModal creado con validación y estados de éxito/error. |
| 2026-01-23 | 3.2 | Modal integrado en LoginFormTailwind. Export en index.ts. |
| 2026-01-23 | 3.5.1 | Modal.tsx migrado a Tailwind. Prop size agregado. Accesibilidad mejorada. |
| 2026-01-23 | 3.5.2 | CreateUserForm 100% Tailwind. Eliminado UserForm.css. UI consistente. |
| 2026-01-23 | 3.6.1 | updateUserNames en servicio. Modal de edición. Búsqueda de usuarios. |
| 2026-01-24 | 3.6.2 | Users.tsx usa SidebarV2/HeaderV2. Tooltips en botones de UserTable. |
| 2026-01-24 | Fix | LoginFormTailwind: Integrado ForgotPasswordModal correctamente. |
| 2026-01-24 | Fix | AuthGuardV2: Verificación de isActive en Firestore. Pantalla InactiveAccountScreen. |
| 2026-01-24 | Fix | user.service: Agregada función getUserByUid para obtener perfil completo. |
| 2026-01-24 | UI/UX | UserTable: Modales mejorados con headers coloreados, animaciones, mejor feedback. |
| 2026-01-24 | UI/UX | UserTable: Layout flex para ocupar espacio, loading skeleton mejorado. |
| 2026-01-24 | Layout | Users.tsx y Home.tsx: Corregido layout flex para ocupar 100% del viewport. |
| 2026-01-24 | Layout | Contenedor raíz: h-screen overflow-hidden. Eliminado w-full/max-w-full redundantes. |
| 2026-01-24 | Layout | UserTable: Agregado flex-1 a todos los estados (normal, loading, error). |
| 2026-01-24 | UI/UX | UserTable skeleton: Rediseñado con grid que replica estructura real de la tabla. |
| 2026-01-24 | UI/UX | AuthGuard LoadingScreen: Simplificado a spinner minimalista con fondo blur. |
| 2026-01-24 | 4.1 | getUserByUid ya existía en user.service.ts. Marcada como completada. |
| 2026-01-24 | 4.2 | Carga de datos de Firestore ya implementada en AuthGuardV2. Marcada como completada. |
| 2026-01-24 | 4.3 | hasAllowedRole activada: verifica user.role contra allowedRoles. getUserRole() creada. |
| 2026-01-24 | 4.4 | Dashboard.tsx: Rutas protegidas con AuthGuardV2. Admin→Coordinador, Academia→Docente+Coordinador. |
| 2026-01-24 | Extra | Sidebar: Items filtrados por rol. NavItem tiene allowedRoles. SidebarV2 filtra según userRole de Redux. |
