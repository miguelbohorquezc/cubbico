# Cubbico - Sistema Institucional Académico

## Resumen del Proyecto

**Cubbico** es un Sistema Institucional Académico (SIA) completo diseñado para "Colina Campestre School". Es una aplicación web SPA (Single Page Application) que gestiona todo el ciclo académico de la institución educativa, desde el proceso de admisiones hasta la generación de informes finales.

### Características Principales
- Sistema completo de admisiones (aspirantes → matrícula)
- Gestión académica integral (estudiantes, salones, áreas)
- Sistema de calificaciones por periodos
- Módulo especializado para preescolar con evaluación cualitativa
- Generación de reportes e informes académicos
- Exportación de datos a CSV

---

## Tecnologías Utilizadas

### Frontend Core
- **React 18.3.1** - Librería UI principal
- **TypeScript 5.6.2** - Tipado estático
- **Vite 6.0.5** - Herramienta de build (HMR, compilación rápida)
- **React Router DOM 7.1.5** - Enrutamiento SPA

### Gestión de Estado
- **Redux Toolkit 2.5.1** - Estado global
- **React Redux 9.2.0** - Integración React-Redux

### Backend/Base de datos
- **Firebase 11.3.1** - Backend as a Service (BaaS)
  - Firebase Authentication (Google Auth)
  - Cloud Firestore Database
  - Firebase Hosting

### Utilidades
- **React CSV 2.2.2** - Exportación de datos a CSV
- **Prop Types 15.8.1** - Validación de props

### Desarrollo
- **ESLint** - Linting
- **PostCSS** - Procesamiento CSS
- **Babel** - Transpilación

---

## Estructura del Proyecto

```
cubbico/
├── src/
│   ├── app/                    # Configuración de la aplicación
│   │   ├── guard/             # Guardias de autenticación
│   │   ├── routes/            # Definición de rutas
│   │   └── store/             # Estado global (Redux)
│   │       └── states/        # Slices de Redux
│   ├── domain/                # Capa de dominio
│   │   └── entities/          # Entidades del negocio
│   ├── infrastructure/        # Servicios de infraestructura
│   │   └── firebase/          # Configuración Firebase
│   ├── presentation/          # Capa de presentación
│   │   ├── components/        # Componentes reutilizables
│   │   ├── features/          # Características/módulos
│   │   └── pages/             # Páginas públicas y privadas
│   └── shared/                # Utilidades compartidas
│       ├── types/
│       └── utils/
├── public/                     # Archivos públicos estáticos
├── .firebase/                  # Configuración Firebase
└── Archivos de configuración
```

---

## Arquitectura del Proyecto

### Arquitectura de 3 Capas (Clean Architecture)

#### A) CAPA DE DOMINIO (`domain/`)
Define las entidades del negocio sin dependencias externas:

**Entidades principales:**
- `studentInfo` - Información completa de estudiantes
- `ClassRoom` - Salones de clase
- `Area` - Áreas/asignaturas académicas
- `FirebaseUser` - Usuarios del sistema
- `AchievementData` - Logros académicos
- `Aspirante` - Aspirantes a admisión
- `Matricula` - Matrículas

#### B) CAPA DE INFRAESTRUCTURA (`infrastructure/`)
Servicios de persistencia y comunicación con Firebase Firestore:

- `student.service.ts` - CRUD estudiantes
- `classRoom.service.ts` - Gestión de salones
- `area.service.ts` - Gestión de áreas
- `achievement.service.ts` - Logros académicos
- `teacher.service.ts` - Datos de profesores
- `user.service.ts` - Gestión de usuarios

**Configuración Firebase:**
- Variables de entorno en `.env`
- Inicialización en `infrastructure/firebase/firebase.ts`

#### C) CAPA DE PRESENTACIÓN (`presentation/`)

**1. Componentes Reutilizables:**
- `datatable/` - Tablas de datos
- `modal/` - Modales
- `navbar/` - Barra de navegación
- `sidebar/` - Menú lateral
- `studentForm/` - Formularios de estudiantes
- `classRoomForm/` - Formularios de salones
- `areaForm/` - Formularios de áreas
- `achievement/` - Componentes de logros
- `notes/` - Componentes de notas
- `classRoomReport/` - Reportes académicos
- `informeGeneral/` - Informes generales

**2. Features (Módulos de funcionalidad):**
- `auth/` - Autenticación (Login)
- `apirantes/` - Formulario de aspirantes
- `aspirantes-admin/` - Administración de admisiones
- `matricula/` - Proceso de matrícula
- `students/` - Gestión de estudiantes
- `teacher/` - Funcionalidades para profesores
- `notesManager/` - Gestor de calificaciones
- `preschool/` - Módulo específico preescolar

**3. Páginas:**
- **Públicas:** Login, Formulario de aspirantes, Formulario de matrícula
- **Privadas:** Dashboard con todas las funcionalidades administrativas

### Estado Global (Redux)

```typescript
AppState {
  user: FirebaseUser              // Usuario autenticado
  students: {                      // Estudiantes
    students: studentInfo[]
    loading: boolean
    error: string | null
  }
  teacherData: {                   // Datos del profesor
    classrooms: ClassRoom[]
    areas: Area[]
    achievements: AchievementData[]
    loading: boolean
    error: string | null
  }
  users: {                         // Usuarios del sistema
    list: FirebaseUser[]
    loading: boolean
    error: string | null
  }
}
```

### Seguridad
- **AuthGuard** - Protege rutas privadas
- Verifica autenticación vía Firebase Auth
- Redirige a login si no autenticado

---

## Funcionalidades Principales

### A) GESTIÓN DE ADMISIONES

#### 1. Formulario Público de Aspirantes
- Datos del aspirante (nombres, edad, sexo, etc.)
- Datos de padre y madre
- Datos de recomendador
- Estados: `en_espera`, `en_revision`, `admitido`, `no_admitido`, `matricular`

#### 2. Formulario Público de Matrícula
- Proceso de inscripción de estudiantes admitidos
- Pre-llenado con datos de aspirantes

#### 3. Panel Administrativo de Admisiones
- Gestión de aspirantes con seguimiento
- Gestión de matrículas con verificación documental
- Exportación de datos a CSV por grado
- Sistema de banderas (habilitación/deshabilitación)
- Búsqueda y filtrado por año

### B) GESTIÓN ACADÉMICA

#### 1. Gestión de Estudiantes
- CRUD completo de estudiantes
- Asignación a salones
- Historial académico
- Informes por estudiante

#### 2. Gestión de Salones
- Creación y administración de salones
- Asignación de niveles (preescolar, primaria, secundaria)
- Director de grupo

#### 3. Gestión de Áreas/Asignaturas
- Configuración de asignaturas por nivel
- IHS (Intensidad Horaria Semanal)
- Ordenamiento

#### 4. Gestión de Notas/Calificaciones
- Sistema de notas por periodo
- Gestión de logros académicos
- Registro de fallas (justificadas/injustificadas)
- Observaciones
- Validación de notas numéricas
- Cálculo automático de promedios
- Envío por lotes (batch)

#### 5. Sistema Especializado para Preescolar
- Gestor de indicadores personalizados
- Evaluador cualitativo
- Informes específicos de preescolar
- Configuración por asignatura y periodo

### C) REPORTES Y DOCUMENTACIÓN

#### 1. Reportes Académicos Individuales
- Historial académico completo por estudiante
- Informes por periodo
- Informe final

#### 2. Reportes por Salón
- Consolidado de notas por salón
- Análisis de rendimiento
- Exportación a Excel/CSV

#### 3. Reportes de Preescolar
- Informes cualitativos
- Evaluaciones por indicadores
- Impresión de informes

#### 4. Exportación de Datos
- CSV de matriculados por grado
- Exportación de reportes

### D) GESTIÓN DE USUARIOS
- Autenticación con Firebase Auth
- Gestión de usuarios del sistema
- Roles y permisos
- Perfil de usuario

### E) INTERFAZ PARA PROFESORES
- Vista de salones asignados
- Gestión de áreas que imparte
- Registro de calificaciones
- Gestión de logros
- Vista de estudiantes por salón

---

## Configuraciones Importantes

### Firebase

**Variables de entorno (`.env`):**
```env
VITE_APIKEY=AIzaSyCeHSbpQkQKnnfr79vxqrYbNWmgxreoFno
VITE_AUTHDOMAIN=sia-colina.firebaseapp.com
VITE_PROJECTID=sia-colina
VITE_STORAGEBUCKET=sia-colina.firebasestorage.app
VITE_MESSAGINGSENDERID=1028482946894
VITE_APPID=1:1028482946894:web:4b2125d849aef5f05c701f
```

**Colecciones Firestore:**
- `student` - Estudiantes
- `classrooms` - Salones
- `areas` - Áreas/asignaturas
- `achievements` - Logros
- `users` - Usuarios
- `aspirantes` - Aspirantes
- `matriculas` - Matrículas
- `indicadores` - Indicadores de preescolar
- `notas` - Calificaciones

### Rutas del Sistema

**Rutas Públicas:**
- `/login` - Inicio de sesión
- `/aspirantes` - Formulario de aspirantes
- `/matriculas` - Formulario de matrícula

**Rutas Privadas:**
- `/private/dashboard/history` - Inicio/historial
- `/private/dashboard/student` - Gestión estudiantes
- `/private/dashboard/classrooms` - Gestión salones
- `/private/dashboard/area` - Gestión áreas
- `/private/dashboard/user` - Gestión usuarios
- `/private/dashboard/academy/:periodId/:classroomId/:areaId` - Academia
- `/private/dashboard/notes/:periodId/:classroomId/:areaId` - Notas
- `/private/dashboard/notespreschool/:periodId/:classroomId` - Notas preescolar
- `/private/dashboard/aspirants` - Admin aspirantes
- `/private/dashboard/report/:studentId/:year` - Reportes
- `/private/dashboard/final-report/:studentId/:year` - Informe final

### Redux Middleware

```typescript
serializableCheck: {
  ignoredActions: ['teacherData/upsertAchievement'],
  ignoredPaths: ['teacherData.achievements']
}
```

---

## Guías de Desarrollo

### Comandos Principales

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Compila para producción
npm run preview      # Preview de build

# Deploy
firebase deploy      # Desplegar a Firebase Hosting
```

### Estructura de Archivos por Feature

Cada feature debe seguir esta estructura:
```
feature-name/
├── components/      # Componentes específicos de la feature
├── hooks/          # Hooks personalizados
├── types/          # Tipos TypeScript
├── utils/          # Utilidades
└── FeatureName.tsx # Componente principal
```

### Convenciones de Código

1. **Nombres de archivos:**
   - Componentes: `PascalCase.tsx`
   - Services: `camelCase.service.ts`
   - Utilidades: `camelCase.util.ts`

2. **Componentes:**
   - Usar functional components con hooks
   - Evitar `//@ts-ignore` cuando sea posible
   - Implementar PropTypes cuando no se use TypeScript estricto

3. **Estilos:**
   - CSS modular por componente
   - Archivos `.css` con el mismo nombre que el componente

4. **Estado:**
   - Redux para estado global
   - useState/useReducer para estado local
   - useEffect para efectos secundarios

---

## Metodología de Trabajo con Agentes

### Agentes Disponibles

Este proyecto utiliza 3 agentes especializados para el desarrollo:

#### 1. Agente Arquitecto (Plan)
- **Propósito:** Planificar microtareas
- **Cuándo usar:** Antes de iniciar cualquier desarrollo
- **Función:** Descomponer features en microtareas ejecutables

#### 2. Agente TDD (Test-Driven Development)
- **Propósito:** Implementar microtareas siguiendo TDD
- **Cuándo usar:** Para ejecutar cada microtarea planificada
- **Función:** Escribir tests primero, luego implementación

#### 3. Agente de Seguridad (tdd-security-reviewer)
- **Propósito:** Revisar implementaciones en busca de vulnerabilidades
- **Cuándo usar:** Después de cada implementación
- **Función:** Análisis de seguridad y best practices

### Flujo de Trabajo

```
1. Recibir requisito/feature
   ↓
2. Agente Arquitecto → Planificar microtareas
   ↓
3. Para cada microtarea:
   a. Agente TDD → Implementar
   b. Agente Seguridad → Revisar
   ↓
4. Integrar cambios
```

### Principios de Microtareas

- **Atómicas:** Cada microtarea debe ser independiente
- **Pequeñas:** No más de 1-2 horas de trabajo
- **Testables:** Deben poder verificarse con tests
- **Documentadas:** Descripción clara del objetivo

---

## Vulnerabilidades Conocidas a Revisar

### Áreas de Atención
1. **Autenticación:**
   - Verificar que todas las rutas privadas estén protegidas
   - Validar tokens de Firebase correctamente

2. **Validación de Datos:**
   - Input validation en formularios
   - Sanitización antes de guardar en Firestore

3. **Permisos:**
   - Implementar reglas de seguridad en Firestore
   - Verificar permisos a nivel de UI y backend

4. **Exportación de Datos:**
   - Validar que solo usuarios autorizados puedan exportar
   - No exponer datos sensibles en exports

---

## Notas Importantes

- El proyecto usa `//@ts-ignore` frecuentemente, se recomienda reducir su uso gradualmente
- TypeScript strict mode está deshabilitado
- Configurar Firebase Security Rules es crucial antes de producción
- El sistema maneja datos sensibles de estudiantes, priorizar seguridad

---

## Estado Actual

- **Branch actual:** `fix-update`
- **Branch principal:** `main`
- **Archivos TypeScript:** 158
- **Archivos CSS:** 26
- **Estado:** Desarrollo activo

### Cambios Recientes
- Se agregó el informe final
- Refactor en reportes: columna de fallas injustificadas
- Exportación a CSV implementada
- Ajustes UI en feature aspirantes-admin
- Proceso de admisiones completo

---

## Plan de Refactorización Actual

### Objetivo General
Refactorizar e incorporar Tailwind CSS y mejorar el sistema de autenticación y gestión de usuarios sin afectar los módulos críticos de notas, logros y reportes.

### Restricciones Críticas
**NO SE DEBE AFECTAR:**
1. La manera como los maestros registran sus logros y notas
2. La manera como el usuario coordinador registra usuarios y asigna salones, dirección de grupo y asignaturas
3. Los módulos de reportes e informes (LA PARTE MÁS IMPORTANTE)

### Estadísticas del Plan
- **Total de microtareas:** 23
- **Fases:** 4
- **Tiempo estimado:** 35-45 horas
- **Metodología:** Una microtarea a la vez

---

### FASE 1: Incorporación de Tailwind CSS (2-3 horas)

#### MT-001: Instalación y configuración base de Tailwind CSS
**Objetivo:** Instalar Tailwind CSS y configurarlo en el proyecto Vite sin afectar estilos existentes

**Archivos a crear/modificar:**
- Crear: `tailwind.config.js`
- Crear: `postcss.config.js`
- Modificar: `src/index.css` (agregar directivas Tailwind)
- Modificar: `package.json` (agregar dependencias)

**Criterios de aceptación:**
- Tailwind CSS instalado correctamente (tailwindcss, postcss, autoprefixer)
- Archivo `tailwind.config.js` creado con configuración para todos los archivos tsx/ts
- Directivas `@tailwind` agregadas al inicio de index.css
- Variables CSS existentes (--deep-blue, --gold, etc.) preservadas
- Proyecto compila sin errores
- Estilos existentes NO se ven afectados

**Notas:**
- NO eliminar las variables CSS existentes
- Configurar Tailwind para que NO sobreescriba estilos existentes

---

#### MT-002: Extender configuración de Tailwind con paleta institucional
**Objetivo:** Configurar Tailwind para usar los colores institucionales del proyecto

**Archivos a crear/modificar:**
- Modificar: `tailwind.config.js`

**Dependencias:** MT-001

**Criterios de aceptación:**
- Paleta de colores personalizada agregada:
  - `deepBlue`: '#001D38'
  - `mediumBlue`: '#00386B'
  - `lightGray`: '#CFD1D0'
  - `gold`: '#FFD600'
  - `offWhite`: '#F5F5F5'
- Configuración de fuente Nunito agregada
- Variables de sombras y transiciones configuradas
- Documentación básica de clases personalizadas en comentarios

---

### FASE 2: Refactor del Sistema de Autenticación (15-20 horas)

#### MT-003: Crear tipos TypeScript centralizados para autenticación
**Objetivo:** Definir interfaces y tipos reutilizables para el módulo de autenticación

**Archivos a crear/modificar:**
- Crear: `src/domain/entities/auth.types.ts`
- Modificar: `src/domain/entities/FirebaseUser.ts` (limpiar y simplificar)

**Criterios de aceptación:**
- Interface `AuthFormData` definida (email, password)
- Interface `AuthErrors` definida
- Type `AuthErrorCode` con códigos de error de Firebase
- Interface `AuthUser` simplificada (uid, email, displayName, metadata básica)
- Todas las interfaces exportadas correctamente
- Sin dependencias circulares

---

#### MT-004: Refactorizar hook de autenticación con mejores prácticas
**Objetivo:** Mejorar el hook useUserForm con mejor manejo de estado y errores

**Archivos a crear/modificar:**
- Crear: `src/presentation/features/auth/hooks/useAuth.ts`
- Mantener: `src/presentation/features/auth/user-form.hook.tsx` (legacy)

**Dependencias:** MT-003

**Criterios de aceptación:**
- Hook `useAuth` creado con funcionalidad completa
- Estados bien tipados usando tipos de MT-003
- Manejo de errores mejorado con tipos específicos
- Loading states granulares (isAuthenticating, isLoggingOut)
- Validación de formulario separada en función pura
- Sin lógica de navegación dentro del hook (usar callbacks)

---

#### MT-005: Crear servicio de autenticación en capa de infraestructura
**Objetivo:** Centralizar la lógica de autenticación Firebase en un servicio dedicado

**Archivos a crear/modificar:**
- Crear: `src/infrastructure/firebase/auth.service.ts`

**Dependencias:** MT-003

**Criterios de aceptación:**
- Clase o módulo `AuthService` creado con métodos:
  - `signIn(email, password)`
  - `signOut()`
  - `getCurrentUser()`
  - `onAuthStateChanged(callback)`
  - `resetPassword(email)`
- Manejo centralizado de errores Firebase
- Mapeo de errores Firebase a mensajes en español
- Tipos correctamente aplicados
- Documentación JSDoc de métodos públicos

---

#### MT-006: Rediseñar componente LoginForm con Tailwind CSS
**Objetivo:** Crear nueva versión del LoginForm usando Tailwind manteniendo funcionalidad

**Archivos a crear/modificar:**
- Crear: `src/presentation/features/auth/components/LoginFormTailwind.tsx`
- Mantener: `src/presentation/features/auth/LoginForm.tsx` (legacy)

**Dependencias:** MT-002, MT-004

**Criterios de aceptación:**
- Componente nuevo usando 100% Tailwind CSS
- Diseño responsivo (mobile-first)
- Misma funcionalidad que el original
- Usa el nuevo hook `useAuth`
- Validación en tiempo real
- Indicadores de carga apropiados
- Accesibilidad mejorada (ARIA labels, roles)
- Sin archivo CSS separado

---

#### MT-007: Crear componentes atómicos reutilizables para formularios
**Objetivo:** Extraer componentes de UI reutilizables del LoginForm

**Archivos a crear/modificar:**
- Crear: `src/presentation/components/ui/Input.tsx`
- Crear: `src/presentation/components/ui/Button.tsx`
- Crear: `src/presentation/components/ui/FormError.tsx`
- Crear: `src/presentation/components/ui/index.ts`

**Dependencias:** MT-002

**Criterios de aceptación:**
- Componente `Input` con props: type, name, value, error, icon, etc.
- Componente `Button` con variantes: primary, secondary, accent, loading
- Componente `FormError` para mostrar errores consistentemente
- Todos con TypeScript estricto y PropTypes
- Estilos con Tailwind CSS
- Documentación de props con JSDoc
- Barrel export en index.ts

---

#### MT-008: Mejorar manejo de persistencia de sesión
**Objetivo:** Implementar mejor manejo de sesiones con recuperación automática

**Archivos a crear/modificar:**
- Crear: `src/infrastructure/storage/session.storage.ts`
- Modificar: `src/app/store/states/user.ts`

**Dependencias:** MT-003, MT-005

**Criterios de aceptación:**
- Clase `SessionStorage` con métodos type-safe
- Manejo de errores de localStorage/sessionStorage
- Serialización/deserialización segura
- Limpieza automática de datos expirados
- Slice de Redux actualizado para usar nuevo storage
- Recuperación automática de sesión al cargar app
- Logs de errores apropiados

---

#### MT-009: Implementar AuthGuard mejorado con rutas protegidas
**Objetivo:** Mejorar el guard de autenticación con mejor UX y manejo de estados

**Archivos a crear/modificar:**
- Crear: `src/app/guard/AuthGuard.v2.tsx`
- Mantener: `src/app/guard/auth.guard.tsx` (legacy)

**Dependencias:** MT-005, MT-008

**Criterios de aceptación:**
- Componente AuthGuard mejorado con estados: loading, authenticated, unauthenticated
- Pantalla de carga mientras verifica autenticación
- Redirección correcta con preservación de ruta destino
- Verificación de roles (preparación para permisos)
- Listener de cambios de auth state
- Componente con Tailwind CSS
- Sin flickering en carga inicial

---

#### MT-010: Migración y prueba del nuevo sistema de auth
**Objetivo:** Integrar los nuevos componentes de auth reemplazando los legacy

**Archivos a crear/modificar:**
- Modificar: `src/presentation/features/auth/index.ts`
- Modificar: `src/app/App.tsx`
- Eliminar (después de migración): archivos legacy de auth

**Dependencias:** MT-006, MT-009

**Criterios de aceptación:**
- LoginFormTailwind reemplaza a LoginForm en App.tsx
- AuthGuard.v2 reemplaza a auth.guard
- Sistema de auth funciona completamente
- No hay regresiones de funcionalidad
- Archivos legacy eliminados
- Login/logout/recuperación de sesión funcionando

**NOTA:** Punto de no retorno - hacer commit antes de eliminar archivos legacy

---

### FASE 3: Refactor del Módulo de Gestión de Usuarios (15-20 horas)

#### MT-011: Refactorizar entidades de dominio de usuarios/docentes
**Objetivo:** Limpiar y mejorar las interfaces de usuario con mejor tipado

**Archivos a crear/modificar:**
- Modificar: `src/domain/entities/userFormData.ts`
- Crear: `src/domain/entities/teacher.ts`
- Crear: `src/domain/entities/user.types.ts`

**Dependencias:** MT-003

**Criterios de aceptación:**
- Interface `Teacher` separada de `UserFormData`
- Tipos para roles: `UserRole` = 'Administrativo' | 'Docente' | 'Coordinador'
- Interface `UserProfile` para datos del usuario en Firestore
- Interface `TeacherAssignments` para asignaciones (áreas, salones)
- Validaciones de tipos estrictas
- Sin tipos `any` o `Record<string, boolean>` ambiguos
- Documentación de cada campo

---

#### MT-012: Crear servicio mejorado de usuarios en capa de infraestructura
**Objetivo:** Refactorizar user.service.ts con mejor arquitectura y manejo de errores

**Archivos a crear/modificar:**
- Crear: `src/infrastructure/services/user.service.v2.ts`
- Mantener: `src/infrastructure/user.service.ts` (legacy)

**Dependencias:** MT-011

**Criterios de aceptación:**
- Clase `UserService` con métodos CRUD completos
- Método `createTeacher` separado de `createUser`
- Validación de datos antes de enviar a Firebase
- Manejo de errores centralizado con try-catch
- Transacciones para operaciones complejas
- Métodos para obtener usuarios por rol
- Métodos para actualizar asignaciones

---

#### MT-013: Refactorizar Redux slice de usuarios con mejores prácticas
**Objetivo:** Mejorar user.slice.ts con RTK Query o mejores async thunks

**Archivos a crear/modificar:**
- Crear: `src/app/store/states/users.slice.v2.ts`
- Mantener: `src/app/store/states/user.slice.ts` (legacy)

**Dependencias:** MT-012

**Criterios de aceptación:**
- Slice refactorizado con mejor tipado
- Async thunks para: fetch, create, update, delete
- Estados de loading por operación (no global)
- Selectores memoizados con reselect
- Normalización de datos (considerar usando entities adapter)
- Manejo de errores por operación
- Estado de UI separado de datos

---

#### MT-014: Crear hook personalizado para gestión de formulario de usuario
**Objetivo:** Refactorizar useUserForm.ts con mejor lógica y separación de concerns

**Archivos a crear/modificar:**
- Crear: `src/presentation/components/userForm/hooks/useUserFormV2.ts`
- Crear: `src/presentation/components/userForm/hooks/useUserFormValidation.ts`
- Mantener: `src/presentation/components/userForm/useUserForm.ts` (legacy)

**Dependencias:** MT-011, MT-013

**Criterios de aceptación:**
- Hook principal `useUserFormV2` con estado del formulario
- Hook separado `useUserFormValidation` solo para validaciones
- Validación en tiempo real debounced
- Estados separados: formData, errors, touched, isSubmitting
- Lógica de filtrado de áreas/salones optimizada con useMemo
- Reset de formulario correcto
- Sin efectos secundarios inesperados

---

#### MT-015: Rediseñar CreateUserForm con Tailwind y componentes atómicos
**Objetivo:** Reescribir el formulario de usuario usando Tailwind y componentes de UI

**Archivos a crear/modificar:**
- Crear: `src/presentation/components/userForm/CreateUserFormV2.tsx`
- Crear: `src/presentation/components/userForm/components/TeacherAssignments.tsx`
- Crear: `src/presentation/components/userForm/components/PasswordRequirements.tsx`
- Mantener: `src/presentation/components/userForm/CreateUserForm.tsx` (legacy)

**Dependencias:** MT-007, MT-014

**Criterios de aceptación:**
- Formulario completamente rediseñado con Tailwind
- Usa componentes de UI de MT-007
- Componente `TeacherAssignments` para sección de docente
- Componente `PasswordRequirements` separado
- Diseño responsivo y accesible
- Mejor UX en selección de niveles/áreas/salones
- Feedback visual mejorado
- Sin archivos CSS separados

---

#### MT-016: Crear componentes de visualización de usuarios (tabla/lista)
**Objetivo:** Crear componentes para listar y gestionar usuarios existentes

**Archivos a crear/modificar:**
- Crear: `src/presentation/components/userList/UserList.tsx`
- Crear: `src/presentation/components/userList/UserCard.tsx`
- Crear: `src/presentation/components/userList/UserFilters.tsx`

**Dependencias:** MT-007, MT-013

**Criterios de aceptación:**
- Componente `UserList` con tabla o grid de usuarios
- Componente `UserCard` para mostrar info individual
- Componente `UserFilters` para filtrar por rol/nivel
- Acciones: editar, eliminar, ver detalles
- Paginación o scroll infinito
- Loading states y skeleton loaders
- Confirmación antes de eliminar
- Diseño con Tailwind CSS

---

#### MT-017: Crear modal de edición de usuario
**Objetivo:** Implementar funcionalidad de edición de usuarios existentes

**Archivos a crear/modificar:**
- Crear: `src/presentation/components/userForm/EditUserModal.tsx`
- Modificar: `src/presentation/components/modal/Modal.tsx` (si necesita mejoras)

**Dependencias:** MT-015, MT-016

**Criterios de aceptación:**
- Modal reutilizable para editar usuarios
- Pre-carga de datos del usuario
- Validación similar a creación (excepto password opcional)
- Actualización optimista en UI
- Manejo de errores apropiado
- Confirmación de cambios
- Diseño consistente con CreateUserForm

---

#### MT-018: Refactorizar página Users.tsx con nueva arquitectura
**Objetivo:** Actualizar la página de usuarios usando los nuevos componentes

**Archivos a crear/modificar:**
- Modificar: `src/presentation/pages/private/Dashboard/components/Users.tsx`

**Dependencias:** MT-015, MT-016, MT-017

**Criterios de aceptación:**
- Página reorganizada con layout claro
- Integración de UserList y CreateUserFormV2
- Navegación entre vistas (lista/crear/editar)
- Estados de carga global apropiados
- Mensajes de éxito/error con toast/notification
- Responsive design
- Sin CSS modular, solo Tailwind

---

#### MT-019: Implementar sistema de notificaciones/toast
**Objetivo:** Crear componente de notificaciones para feedback de operaciones

**Archivos a crear/modificar:**
- Crear: `src/presentation/components/ui/Toast.tsx`
- Crear: `src/presentation/components/ui/ToastContainer.tsx`
- Crear: `src/app/hooks/useToast.ts`

**Dependencias:** MT-007

**Criterios de aceptación:**
- Componente Toast con variantes: success, error, warning, info
- ToastContainer para gestionar múltiples toasts
- Hook useToast para disparar notificaciones
- Auto-dismiss configurable
- Animaciones suaves con Tailwind
- Posicionamiento configurable
- Stack de múltiples toasts

---

#### MT-020: Migración completa del módulo de usuarios
**Objetivo:** Reemplazar todos los componentes legacy de usuarios con las nuevas versiones

**Archivos a crear/modificar:**
- Modificar: Store para usar nuevo slice
- Eliminar archivos legacy de userForm
- Actualizar imports en toda la aplicación

**Dependencias:** MT-018, MT-019

**Criterios de aceptación:**
- Todos los archivos legacy eliminados
- Imports actualizados en toda la app
- CRUD completo de usuarios funcionando
- No hay regresiones
- Build sin warnings
- Verificar que NO se afecta módulo de notas/logros/reportes

**NOTA:** Punto de no retorno - hacer commit antes de eliminar archivos legacy

---

### FASE 4: Tareas Adicionales de Calidad (3-5 horas, opcional)

#### MT-021: Crear documentación de componentes con Storybook (opcional)
**Objetivo:** Documentar componentes de UI reutilizables

**Dependencias:** MT-007

---

#### MT-022: Crear suite de tests para módulos refactorizados
**Objetivo:** Agregar tests unitarios y de integración

**Dependencias:** MT-010, MT-020

**Criterios de aceptación:**
- Tests unitarios para hooks con >80% coverage
- Tests de servicios con mocks de Firebase
- Tests de componentes con React Testing Library
- Tests de integración de flujos completos

---

#### MT-023: Optimización de rendimiento y bundle
**Objetivo:** Optimizar el tamaño del bundle y rendimiento

**Dependencias:** MT-020

**Criterios de aceptación:**
- Bundle size analizado con vite-plugin-bundle-analyzer
- Lazy loading implementado donde corresponda
- Tree shaking verificado
- Optimizaciones de Tailwind (purge configurado)
- Build time mejorado

---

### Módulos Protegidos (NO TOCAR)

Los siguientes módulos NO se modificarán durante este refactor:
- `src/presentation/components/notes/` - Registro de notas
- `src/presentation/components/achievement/` - Logros académicos
- `src/presentation/components/classRoomReport/` - Reportes por salón
- `src/presentation/components/informeGeneral/` - Informes generales
- Cualquier archivo relacionado con notas, logros o reportes

---

### FASE 5: Mejoras de Módulos Áreas y Salones (10-15 horas)

> **Objetivo:** Implementar drag & drop para ordenar asignaturas y selector de director de grupo para salones. Solo aplica a Primaria y Secundaria (Preescolar excluido).

---

#### SECCIÓN A: Drag & Drop para Áreas/Asignaturas

##### MT-A01: Crear tipos e interfaces para drag & drop ✅ COMPLETADA
**Objetivo:** Definir tipos TypeScript para el sistema de reordenamiento

**Archivos modificados:**
- `src/shared/types/areaTypes.ts`

**Criterios de aceptación:**
- ✅ Interface `DragDropState` definida
- ✅ Type `ReorderAreasPayload` definido
- ✅ Type `AreaWithDragProps` definido
- ✅ Type `NivelDragDrop` definido
- ✅ Interface `DragDropHandlers` definida

---

##### MT-A02: Crear servicio batch update de orden ✅ COMPLETADA
**Objetivo:** Implementar función para actualizar orden de múltiples áreas en Firestore

**Archivos modificados:**
- `src/infrastructure/area.service.ts`

**Criterios de aceptación:**
- ✅ Función `updateAreasOrder` con `writeBatch` de Firestore
- ✅ Transacción atómica para actualizar múltiples documentos
- ✅ Manejo de errores con try-catch
- ✅ Documentación JSDoc

---

##### MT-A03: Crear hook useDragDropAreas ✅ COMPLETADA
**Objetivo:** Implementar lógica de drag & drop reutilizable

**Archivos creados:**
- `src/presentation/features/students/hooks/useDragDropAreas.ts`

**Criterios de aceptación:**
- ✅ Estado local para drag & drop
- ✅ Handlers: `handleDragStart`, `handleDragOver`, `handleDragEnd`, `handleDrop`
- ✅ Integración con `updateAreasOrder`
- ✅ Estado `isSaving` y `hasChanges`
- ✅ Funciones `saveOrder` y `discardChanges`
- ✅ Filtrado por nivel

---

##### MT-A04: Crear componente DraggableAreaRow ✅ COMPLETADA
**Objetivo:** Crear componente de fila arrastrable con Tailwind CSS

**Archivos creados:**
- `src/presentation/features/students/components/DraggableAreaRow.tsx`

**Criterios de aceptación:**
- ✅ Props tipadas
- ✅ Estilos Tailwind para estados: normal, dragging, drop-target
- ✅ Icono de grip para arrastrar
- ✅ Badge de nivel con colores
- ✅ Acciones de editar/eliminar
- ✅ Atributos ARIA para accesibilidad

---

##### MT-A05: Crear componente AreaListDragDrop ✅ COMPLETADA
**Objetivo:** Crear lista con drag & drop para áreas de Primaria/Secundaria

**Archivos creados:**
- `src/presentation/features/students/AreaListDragDrop.tsx`

**Criterios de aceptación:**
- ✅ Tabs para seleccionar nivel (Primaria/Secundaria)
- ✅ Lista de áreas arrastrables
- ✅ Botones guardar/cancelar cambios
- ✅ Loading states y feedback visual
- ✅ Confirmación antes de cambiar tab con cambios pendientes
- ✅ Funcionalidad de editar/eliminar mantenida

---

##### MT-A06: Integrar AreaListDragDrop en AreaPage ✅ COMPLETADA
**Objetivo:** Actualizar AreaPage para usar el nuevo componente

**Archivos modificados:**
- `src/presentation/pages/private/Dashboard/components/AreaPage.tsx`

**Criterios de aceptación:**
- ✅ Usar `AreaListDragDrop` en lugar de `AreaList`
- ✅ Mantener funcionalidad de crear área (modal)
- ✅ Recarga automática al crear nueva área
- ✅ Sin regresiones

---

##### MT-A07: Auto-asignar orden al crear asignatura ✅ COMPLETADA
**Objetivo:** Asignar automáticamente el siguiente orden disponible al crear una asignatura

**Archivos modificados:**
- `src/presentation/components/areaForm/useAreaForm.ts`
- `src/presentation/components/areaForm/AreaForm.tsx`
- `src/presentation/pages/private/Dashboard/components/AreaPage.tsx`

**Criterios de aceptación:**
- ✅ Al crear asignatura, se calcula el siguiente orden disponible para el nivel seleccionado
- ✅ El campo "orden" se pre-llena automáticamente al seleccionar nivel
- ✅ La nueva asignatura aparece al final de la lista del nivel correspondiente
- ✅ El usuario puede luego reordenar con drag & drop

---

#### SECCIÓN B: Selector de Director de Grupo para Salones

##### MT-B01: Crear tipos para selector de director ✅ COMPLETADA
**Objetivo:** Definir tipos TypeScript para el selector de docentes

**Archivos modificados:**
- `src/shared/types/classRoomTypes.ts`

**Criterios de aceptación:**
- ✅ Interface `DocenteOption` con `id`, `email`, `displayName`, `role`
- ✅ Type `DirectorSelectorProps` con opciones, valor seleccionado, handlers
- ✅ Type `DocentesMap` para búsqueda rápida
- ✅ Documentación JSDoc

---

##### MT-B02: Crear función fetchDocentes en user.service ✅ COMPLETADA
**Objetivo:** Agregar función para obtener lista de docentes activos

**Archivos modificados:**
- `src/infrastructure/user.service.ts`

**Criterios de aceptación:**
- ✅ Función `fetchDocentes(): Promise<DocenteOption[]>`
- ✅ Filtrar solo usuarios con `role === 'Docente'`
- ✅ Ordenar alfabéticamente por email
- ✅ Manejo de errores

---

##### MT-B03: Crear componente DirectorSelector ✅ COMPLETADA
**Objetivo:** Implementar dropdown de selección de director

**Archivos creados:**
- `src/presentation/components/classRoomForm/DirectorSelector.tsx`

**Criterios de aceptación:**
- ✅ Componente select con lista de docentes
- ✅ Estado de carga mientras obtiene docentes
- ✅ Mensaje si no hay docentes disponibles
- ✅ Estilos Tailwind
- ✅ Accesibilidad (ARIA labels)

---

##### MT-B04: Integrar DirectorSelector en ClassRoomForm ✅ COMPLETADA
**Objetivo:** Reemplazar input de texto por selector de director

**Archivos modificados:**
- `src/presentation/components/classRoomForm/ClassRoomForm.tsx`
- `src/presentation/components/classRoomForm/useClassRoomForm.ts`

**Criterios de aceptación:**
- ✅ Usar `DirectorSelector` en lugar de campo de texto
- ✅ Solo mostrar selector para Primaria y Secundaria
- ✅ Campo texto para Preescolar (mantiene funcionalidad legacy)
- ✅ Compatibilidad con edición de salones existentes

---

##### MT-B05: Mostrar nombre del director en ClassRoomList ✅ COMPLETADA
**Objetivo:** Mejorar visualización del director en la lista de salones

**Archivos modificados:**
- `src/presentation/features/students/ClassRoomList.tsx`

**Criterios de aceptación:**
- ✅ Mostrar nombre/email del docente en lugar de ID
- ✅ Compatibilidad hacia atrás si el ID no se encuentra
- ✅ Avatar con inicial del nombre
- ✅ Estilo diferenciado para valores legacy

---

#### SECCIÓN C: Módulo CRUD de Áreas Académicas (Futuro)

> **Estado:** ⏸️ PLANIFICADO - No ejecutar aún

##### MT-C01: Crear entidad y tipos para Áreas Académicas ⏸️ FUTURO
**Objetivo:** Definir la estructura de datos para áreas académicas en Firestore

**Archivos a crear:**
- `src/domain/entities/areaAcademica.ts`
- `src/shared/types/areaAcademicaTypes.ts`

**Criterios de aceptación:**
- Interface `AreaAcademica` con: id, nombre, descripcion, activo, orden
- Tipos para formulario y servicio
- Documentación JSDoc

---

##### MT-C02: Crear servicio CRUD de Áreas Académicas ⏸️ FUTURO
**Objetivo:** Implementar operaciones CRUD para áreas en Firestore

**Archivos a crear:**
- `src/infrastructure/areaAcademica.service.ts`

**Criterios de aceptación:**
- Funciones: fetchAreasAcademicas, addAreaAcademica, updateAreaAcademica, deleteAreaAcademica
- Colección Firestore: `areasAcademicas`
- Manejo de errores
- Ordenamiento por campo `orden`

---

##### MT-C03: Crear página de administración de Áreas Académicas ⏸️ FUTURO
**Objetivo:** Crear interfaz para gestionar las áreas académicas

**Archivos a crear:**
- `src/presentation/pages/private/Dashboard/components/AreasAcademicasPage.tsx`
- `src/presentation/components/areaAcademicaForm/AreaAcademicaForm.tsx`

**Criterios de aceptación:**
- Lista de áreas con acciones CRUD
- Formulario para crear/editar áreas
- Drag & drop para reordenar (reutilizar patrón de asignaturas)
- Diseño con Tailwind CSS

---

##### MT-C04: Integrar áreas dinámicas en formulario de asignaturas ⏸️ FUTURO
**Objetivo:** Reemplazar el select hardcodeado por uno dinámico

**Archivos a modificar:**
- `src/presentation/components/areaForm/formConfig.ts`
- `src/presentation/components/areaForm/AreaForm.tsx`

**Criterios de aceptación:**
- El select de "Área" carga opciones desde Firestore
- Mantener compatibilidad con datos existentes
- Loading state mientras carga
- Fallback a opciones hardcodeadas si falla la carga

---

##### MT-C05: Agregar ruta y navegación para Áreas Académicas ⏸️ FUTURO
**Objetivo:** Integrar la nueva página en el sistema de navegación

**Archivos a modificar:**
- `src/app/routes/PrivateRoutes.tsx`
- `src/presentation/components/sidebar/Sidebar.tsx`

**Criterios de aceptación:**
- Nueva ruta: `/private/dashboard/areas-academicas`
- Enlace en el sidebar (solo para rol Coordinador/Admin)
- Breadcrumb correcto

---

##### MT-C06: Migrar áreas hardcodeadas a Firestore ⏸️ FUTURO
**Objetivo:** Crear script/función para poblar la colección inicial

**Archivos a crear:**
- `src/infrastructure/scripts/seedAreasAcademicas.ts`

**Criterios de aceptación:**
- Script que crea las 10 áreas actuales en Firestore
- Solo ejecutar si la colección está vacía
- Documentación de uso

---

#### Resumen FASE 5

| Sección | Total | Completadas | Pendientes | Futuras |
|---------|-------|-------------|------------|---------|
| A (Drag & Drop Asignaturas) | 7 | 7 ✅ | 0 | 0 |
| B (Selector Director) | 5 | 5 ✅ | 0 | 0 |
| C (CRUD Áreas Académicas) | 6 | 0 | 0 | 6 ⏸️ |
| **Total** | **18** | **12** | **0** | **6** |

---

### Estado Actual del Plan
- **Fase actual:** FASE 5 - Mejoras de Áreas y Salones (Secciones A y B completadas)
- **Microtarea actual:** Ninguna pendiente (Sección C es futura)
- **Última actualización del plan:** 2026-01-21

---

## Próximos Pasos Sugeridos (Post-Refactor)

1. Implementar Firebase Security Rules
2. Reducir uso de `//@ts-ignore`
3. Habilitar TypeScript strict mode gradualmente
4. Agregar tests unitarios y de integración
5. Documentar API de servicios
6. Implementar sistema de roles más robusto
7. Optimizar rendimiento de queries a Firestore
8. Implementar sistema de caché para datos frecuentes

---

**Última actualización:** 2026-01-20
