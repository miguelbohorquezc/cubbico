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

### archivo AGENTS.md
- obligatoriamente se deberá usar el archivo AGENTS.md para revisar las reglas definidas 

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
### PLANIFICACIÓN DEL PROYECTO
- El documento TAREAS.md contiente las fases definidas y avances
