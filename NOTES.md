# PLAN DE REDISEÑO - MÓDULO PREESCOLAR

**Fecha:** 2026-02-09
**Estado:** ✅ PLANIFICADO
**Cumple AGENTS.md:** ✅ Sí (Máximo 2 archivos por microtarea)

---

## 🎯 Objetivo General

Rediseñar el módulo de preescolar para crear una interfaz profesional tipo sistema (no sitio web) inspirada en la referencia `ui/pd.jpg` (diseño tipo Linear/project management tool).

## 📋 Referencias Visuales

1. **ui/pd.jpg**: Diseño profesional con:
   - Layout limpio con espacios bien distribuidos
   - Iconografía consistente
   - Estados visuales claros con badges
   - Filtros y búsqueda efectiva
   - Colores sutiles con buen contraste
   - Tipografía clara
   - Animaciones sutiles

2. **ui/image.png**: Títulos con iconos y cards estructuradas

## 🔗 Vistas a Mejorar

1. `/private/dashboard/notespreschool/:periodId/:classroomId` - Gestión de notas preescolar
2. `/private/dashboard/indicadores/:periodId/:classroomId` - Gestión de indicadores
3. `/private/dashboard/student/:periodId/:classroomId/students` - Vista de estudiantes
4. `/private/dashboard/evaluadorpreescolar/:periodId/:classroomId/:studentId/:year` - Evaluador

## ✅ Requisitos del Usuario

1. **Iconografía**: Agregar iconos consistentes en toda la interfaz
2. **Layout Profesional**: Inspirado en ui/pd.jpg (botones, tamaños, contraste, inputs, toasts)
3. **Animaciones**: Sutiles y consistentes para buena UX
4. **Feedback Visual**: Alertas, modales, toasts para retroalimentación constante
5. **Nueva Funcionalidad**: En vista de propósitos, permitir crear más áreas y agregarlas en cualquiera de los 3 propósitos
6. **Mantener Estilo**: Consistente con la vista de selección de salones y áreas

---

## 📊 Estadísticas del Plan

- **Total de microtareas:** 25
- **Tiempo estimado:** 27-37 horas
- **Fases:** 5
- **Archivos máximos por tarea:** 2
- **Metodología:** Una microtarea a la vez

---

# FASE 1: Sistema de Iconos (2-3 horas)

## MT-PRE-001: Crear biblioteca centralizada de iconos SVG

**Objetivo:** Centralizar todos los iconos SVG usados en el módulo preescolar para reutilización y consistencia

**Archivos a modificar (2):**
- `src/presentation/components/icons/PreschoolIcons.tsx` (CREAR)
- `src/presentation/components/icons/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ Componente `PreschoolIcons` con 15+ iconos como:
  - `BookOpenIcon`, `ClipboardIcon`, `CheckCircleIcon`, `UserIcon`
  - `CalendarIcon`, `DocumentIcon`, `PencilIcon`, `TrashIcon`
  - `ChevronLeftIcon`, `ChevronRightIcon`, `PlusIcon`, `XIcon`
  - `SearchIcon`, `FilterIcon`, `DownloadIcon`
- ✅ Todos con props: `className`, `size` (sm, md, lg)
- ✅ TypeScript estricto con interface `IconProps`
- ✅ Exportados en `icons/index.ts`

**Dependencias:** Ninguna

**Estado:** ⏸️ PENDIENTE

---

# FASE 2: Componentes Reutilizables (6-8 horas)

## MT-PRE-002: Crear componente Badge reutilizable

**Objetivo:** Componente Badge con variantes para estados y categorías

**Archivos a modificar (2):**
- `src/presentation/components/ui/Badge.tsx` (CREAR)
- `src/presentation/components/ui/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ Variantes: `default`, `success`, `warning`, `error`, `info`, `purple`, `blue`
- ✅ Tamaños: `sm`, `md`, `lg`
- ✅ Props: `variant`, `size`, `icon`, `children`
- ✅ Estilos consistentes con diseño de pd.jpg
- ✅ TypeScript estricto

**Dependencias:** MT-PRE-001

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-003: Crear componente Card reutilizable

**Objetivo:** Componente Card con header, body, footer opcionales

**Archivos a modificar (2):**
- `src/presentation/components/ui/Card.tsx` (CREAR)
- `src/presentation/components/ui/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ Sub-componentes: `Card.Header`, `Card.Body`, `Card.Footer`
- ✅ Props: `className`, `elevation` (none, sm, md, lg)
- ✅ Soporte para iconos en header
- ✅ Animaciones sutiles (hover, active)
- ✅ Inspirado en pd.jpg

**Dependencias:** MT-PRE-001

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-004: Crear componente Tabs mejorado

**Objetivo:** Sistema de tabs profesional con badges de conteo

**Archivos a modificar (2):**
- `src/presentation/components/ui/Tabs.tsx` (CREAR)
- `src/presentation/components/ui/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ API: `<Tabs>`, `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>`
- ✅ Soporte para badges (contadores)
- ✅ Indicador visual de tab activo
- ✅ Animación de transición suave
- ✅ Accesibilidad (ARIA roles)

**Dependencias:** MT-PRE-001, MT-PRE-002

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-005: Crear componente EmptyState

**Objetivo:** Estado vacío consistente para tablas y listas

**Archivos a modificar (2):**
- `src/presentation/components/ui/EmptyState.tsx` (CREAR)
- `src/presentation/components/ui/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ Props: `icon`, `title`, `description`, `action` (botón opcional)
- ✅ Variantes: `default`, `search`, `error`
- ✅ Diseño centrado y atractivo
- ✅ Reutilizable en todas las vistas

**Dependencias:** MT-PRE-001

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-006: Crear componente ProgressBar

**Objetivo:** Barra de progreso animada para configuración de propósitos

**Archivos a modificar (2):**
- `src/presentation/components/ui/ProgressBar.tsx` (CREAR)
- `src/presentation/components/ui/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ Props: `value`, `max`, `label`, `showPercentage`
- ✅ Colores dinámicos según progreso (rojo < 50%, amarillo < 80%, verde >= 80%)
- ✅ Animación suave de transición
- ✅ Variantes: `default`, `slim`, `thick`

**Dependencias:** Ninguna

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-007: Crear componente SearchInput especializado

**Objetivo:** Input de búsqueda con funcionalidades avanzadas

**Archivos a modificar (2):**
- `src/presentation/components/ui/SearchInput.tsx` (CREAR)
- `src/presentation/components/ui/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ Icono de búsqueda integrado
- ✅ Botón de limpiar (X) cuando hay texto
- ✅ Props: `placeholder`, `value`, `onChange`, `onClear`
- ✅ Debounce opcional (prop `debounceMs`)
- ✅ Contador de resultados opcional

**Dependencias:** MT-PRE-001

**Estado:** ⏸️ PENDIENTE

---

# FASE 3: Mejora de Vistas (12-16 horas)

## MT-PRE-008: Rediseñar InformeConfigurador - Parte 1 (Layout y navegación)

**Objetivo:** Mejorar estructura y navegación de tabs en configuración de propósitos

**Archivos a modificar (1):**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Definición de Done:**
- ✅ Reemplazar tabs custom por componente `Tabs`
- ✅ Reemplazar barra de progreso por `ProgressBar`
- ✅ Reemplazar toast custom por sistema `Toast` unificado
- ✅ Agregar iconografía en títulos y secciones
- ✅ Mejorar espaciado y jerarquía visual

**Dependencias:** MT-PRE-001 a MT-PRE-006

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-009: Rediseñar InformeConfigurador - Parte 2 (Formularios y asignaturas)

**Objetivo:** Mejorar UX de selección de asignaturas y referentes

**Archivos a modificar (1):**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Definición de Done:**
- ✅ Asignaturas disponibles como cards seleccionables (no botones simples)
- ✅ Asignaturas seleccionadas con badges y hover effects
- ✅ Referentes con iconos numerados
- ✅ Validación visual mejorada (errores inline con iconos)
- ✅ Animaciones al agregar/remover asignaturas

**Dependencias:** MT-PRE-008

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-010: Rediseñar GestorIndicadores - Parte 1 (Tabs y búsqueda)

**Objetivo:** Mejorar navegación por asignaturas y sistema de búsqueda

**Archivos a modificar (1):**
- `src/presentation/features/preschool/GestorIndicadores.tsx`

**Definición de Done:**
- ✅ Tabs de asignaturas con componente `Tabs` y badges de conteo
- ✅ SearchInput con debounce y clear button
- ✅ Filtros adicionales: por periodo, por estado (activo/inactivo)
- ✅ Iconos en headers de tabla
- ✅ Empty state cuando no hay resultados

**Dependencias:** MT-PRE-001 a MT-PRE-007

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-011: Rediseñar GestorIndicadores - Parte 2 (Tabla y panel lateral)

**Objetivo:** Mejorar tabla de indicadores y formulario lateral

**Archivos a modificar (1):**
- `src/presentation/features/preschool/GestorIndicadores.tsx`

**Definición de Done:**
- ✅ Tabla con hover effects y bordes sutiles
- ✅ Badges para periodos y estado
- ✅ Botones de acción con iconos mejorados
- ✅ Panel lateral como Card con secciones bien definidas
- ✅ Animación de apertura/cierre del formulario
- ✅ Contador de caracteres visual mejorado

**Dependencias:** MT-PRE-010

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-012: Rediseñar EvaluadorCompleto - Parte 1 (Header y cards de propósitos)

**Objetivo:** Mejorar header informativo y estructura de propósitos

**Archivos a modificar (1):**
- `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`

**Definición de Done:**
- ✅ Header con cards informativos (estudiante, grado, periodo, año) mejorados
- ✅ Iconos consistentes en cada card
- ✅ Cards de propósitos con mejores sombras y espaciado
- ✅ Panel de referentes sticky mejorado visualmente
- ✅ Iconografía en secciones de propósitos

**Dependencias:** MT-PRE-001 a MT-PRE-003

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-013: Rediseñar EvaluadorCompleto - Parte 2 (Selects y feedback)

**Objetivo:** Mejorar selectores de indicadores y feedback visual

**Archivos a modificar (1):**
- `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`

**Definición de Done:**
- ✅ Selects con estilos mejorados (borders, focus states)
- ✅ Indicadores visuales de selección completa/incompleta por propósito
- ✅ Botón de guardar con estado de éxito animado
- ✅ Toast de confirmación al guardar
- ✅ Validación visual de campos requeridos

**Dependencias:** MT-PRE-012

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-014: Rediseñar ClassroomStudents (vista de estudiantes)

**Objetivo:** Mejorar tabla de estudiantes manteniendo estilo consistente

**Archivos a modificar (1):**
- `src/presentation/features/teacher/ClassroomStudents.tsx`

**Definición de Done:**
- ✅ SearchInput con componente reutilizable
- ✅ Badges mejorados para "carácter"
- ✅ Botones de acción con tooltips
- ✅ Header de tabla con iconos
- ✅ Empty state consistente
- ✅ Contador de estudiantes mejorado

**Dependencias:** MT-PRE-001, MT-PRE-002, MT-PRE-005, MT-PRE-007

**Estado:** ⏸️ PENDIENTE

---

# FASE 4: Nueva Funcionalidad (4-6 horas)

## MT-PRE-015: Crear modal para agregar nuevas áreas desde propósitos

**Objetivo:** Permitir crear áreas dinámicamente desde InformeConfigurador

**Archivos a modificar (2):**
- `src/presentation/features/preschool/components/CreateAreaModal.tsx` (CREAR)
- `src/presentation/features/preschool/InformeConfigurador.tsx` (MODIFICAR)

**Definición de Done:**
- ✅ Modal con formulario: nombre de área, IHS, orden
- ✅ Validación de campos
- ✅ Integración con Firestore (crear área en colección `areas`)
- ✅ Actualizar lista de asignaturas disponibles después de crear
- ✅ Feedback visual (toast de éxito/error)

**Dependencias:** MT-PRE-009

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-016: Agregar botón "Crear nueva área" en selector de asignaturas

**Objetivo:** Integrar botón para abrir modal de creación de área

**Archivos a modificar (1):**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Definición de Done:**
- ✅ Botón "+ Nueva Área" en sección de asignaturas disponibles
- ✅ Icono apropiado
- ✅ Abre modal CreateAreaModal
- ✅ Mantiene contexto del propósito activo
- ✅ Cierre de modal actualiza lista automáticamente

**Dependencias:** MT-PRE-015

**Estado:** ⏸️ PENDIENTE

---

# FASE 5: Animaciones y Feedback Visual (3-4 horas)

## MT-PRE-017: Crear hook useToast centralizado

**Objetivo:** Sistema de toasts unificado para todo el módulo preescolar

**Archivos a modificar (2):**
- `src/presentation/features/preschool/hooks/useToast.ts` (CREAR)
- `src/presentation/features/preschool/hooks/index.ts` (CREAR)

**Definición de Done:**
- ✅ Hook `useToast` con métodos: `success()`, `error()`, `info()`
- ✅ Queue de toasts (máx 3 simultáneos)
- ✅ Auto-dismiss configurable
- ✅ TypeScript estricto
- ✅ Exportado correctamente

**Dependencias:** Ninguna

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-018: Agregar animaciones de entrada a cards y modales

**Objetivo:** Mejorar percepción de fluidez con animaciones sutiles

**Archivos a modificar (1):**
- `tailwind.config.js`

**Definición de Done:**
- ✅ Agregar keyframes: `slideInUp`, `fadeInScale`, `slideInRight`
- ✅ Agregar clases de animación correspondientes
- ✅ Duraciones: 200ms-300ms
- ✅ Timing functions: ease-out

**Dependencias:** Ninguna

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-019: Aplicar animaciones en InformeConfigurador

**Objetivo:** Añadir animaciones de transición entre tabs y secciones

**Archivos a modificar (1):**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Definición de Done:**
- ✅ Transición suave al cambiar de propósito (tab)
- ✅ Animación al agregar/remover asignaturas
- ✅ Fade in del toast de éxito
- ✅ Botones con efecto ripple sutil

**Dependencias:** MT-PRE-018

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-020: Aplicar animaciones en GestorIndicadores

**Objetivo:** Mejorar feedback visual en CRUD de indicadores

**Archivos a modificar (1):**
- `src/presentation/features/preschool/GestorIndicadores.tsx`

**Definición de Done:**
- ✅ Slide in del panel lateral al crear/editar
- ✅ Fade out al eliminar indicador
- ✅ Hover effects en filas de tabla
- ✅ Loading skeleton para carga inicial

**Dependencias:** MT-PRE-018

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-021: Aplicar animaciones en EvaluadorCompleto

**Objetivo:** Feedback visual al seleccionar indicadores

**Archivos a modificar (1):**
- `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`

**Definición de Done:**
- ✅ Animación de check al seleccionar indicador
- ✅ Pulse effect en botón guardar cuando hay cambios
- ✅ Success animation al guardar
- ✅ Smooth scroll entre propósitos

**Dependencias:** MT-PRE-018

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-022: Crear componente LoadingSpinner reutilizable

**Objetivo:** Spinner de carga consistente en todo el módulo

**Archivos a modificar (2):**
- `src/presentation/components/ui/LoadingSpinner.tsx` (CREAR)
- `src/presentation/components/ui/index.ts` (MODIFICAR)

**Definición de Done:**
- ✅ Variantes: `sm`, `md`, `lg`
- ✅ Colores: `primary`, `secondary`, `white`
- ✅ Props: `size`, `color`, `text` (opcional)
- ✅ Animación suave
- ✅ Centrado automático opcional

**Dependencias:** Ninguna

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-023a: Reemplazar spinner en InformeConfigurador

**Objetivo:** Unificar spinner de carga

**Archivos a modificar (1):**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Definición de Done:**
- ✅ Reemplazar spinner custom por `LoadingSpinner`
- ✅ Loading state consistente

**Dependencias:** MT-PRE-022

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-023b: Reemplazar spinner en GestorIndicadores

**Objetivo:** Unificar spinner de carga

**Archivos a modificar (1):**
- `src/presentation/features/preschool/GestorIndicadores.tsx`

**Definición de Done:**
- ✅ Reemplazar spinner custom por `LoadingSpinner`
- ✅ Loading state consistente

**Dependencias:** MT-PRE-022

**Estado:** ⏸️ PENDIENTE

---

## MT-PRE-023c: Reemplazar spinner en EvaluadorCompleto

**Objetivo:** Unificar spinner de carga

**Archivos a modificar (1):**
- `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`

**Definición de Done:**
- ✅ Reemplazar spinner custom por `LoadingSpinner`
- ✅ Loading state consistente

**Dependencias:** MT-PRE-022

**Estado:** ⏸️ PENDIENTE

---

## 📈 Progreso del Plan

### Por Fase

- **Fase 1 (Iconos):** 1/1 ✅✅✅✅✅✅✅✅✅✅ 100%
- **Fase 2 (Componentes):** 6/6 ✅✅✅✅✅✅✅✅✅✅ 100%
- **Fase 3 (Vistas):** 5/7 ✅✅✅✅✅⬜⬜⬜⬜⬜ 71%
- **Fase 4 (Nueva Funcionalidad):** 0/2 ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%
- **Fase 5 (Animaciones):** 0/9 ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%

### Total: 12/25 tareas completadas (48%)

---

## ✅ Tareas Completadas

1. **MT-PRE-001** ✅ - PreschoolIcons.tsx (35+ iconos)
2. **MT-PRE-002** ✅ - Badge (7 variantes, 3 tamaños)
3. **MT-PRE-003** ✅ - Card (Header/Body/Footer)
4. **MT-PRE-004** ✅ - Tabs (badges, accesibilidad)
5. **MT-PRE-005** ✅ - EmptyState (3 variantes)
6. **MT-PRE-006** ✅ - ProgressBar (colores dinámicos)
7. **MT-PRE-007** ✅ - SearchInput (debounce, clear)
8. **MT-PRE-008** ✅ - InformeConfigurador Parte 1 (layout, tabs, progress)
9. **MT-PRE-009** ✅ - InformeConfigurador Parte 2 (cards asignaturas, badges, validación)
10. **MT-PRE-010** ✅ - GestorIndicadores Parte 1 (Tabs, SearchInput, EmptyState)
11. **MT-PRE-011** ✅ - GestorIndicadores Parte 2 (panel Card, contador visual)
12. **MT-PRE-012** ✅ - EvaluadorCompleto Parte 1 (header cards, iconos, propósitos)

## 🎯 Próxima Tarea

**MT-PRE-013**: EvaluadorCompleto Parte 2 (Selects mejorados, feedback, validación)

---

## 📝 Notas de Implementación

- Cada microtarea debe ejecutarse UNA A LA VEZ siguiendo el orden numérico
- Respetar dependencias entre tareas
- Validar que cada tarea modifique MÁXIMO 2 archivos
- Usar TypeScript estricto (no `any`, no `//@ts-ignore` sin explicación)
- Usar Tailwind para todos los estilos (no crear nuevos archivos .css)
- Mantener consistencia con el sistema de diseño existente
- NO tocar módulos protegidos (notes/, achievement/, classRoomReport/, informeGeneral/)

---

## 🔒 Restricciones Críticas

**NO SE DEBE AFECTAR:**
1. La manera como los maestros registran sus logros y notas
2. La manera como el usuario coordinador registra usuarios y asigna salones, dirección de grupo y asignaturas
3. Los módulos de reportes e informes (LA PARTE MÁS IMPORTANTE)

---

## 📂 Archivos Críticos del Plan

Los 5 archivos más críticos para este plan:

1. **`src/presentation/features/preschool/InformeConfigurador.tsx`**
   Vista de configuración de propósitos. Se modificará en 4 microtareas (MT-PRE-008, MT-PRE-009, MT-PRE-016, MT-PRE-019).

2. **`src/presentation/features/preschool/GestorIndicadores.tsx`**
   Vista de gestión de indicadores. Se modificará en 4 microtareas (MT-PRE-010, MT-PRE-011, MT-PRE-020, MT-PRE-023b).

3. **`src/presentation/components/ui/index.ts`**
   Archivo barrel de exports. Se modificará en 9 microtareas (todas las creaciones de componentes UI).

4. **`src/presentation/components/icons/PreschoolIcons.tsx`**
   Biblioteca de iconos (a crear en MT-PRE-001). Será importado por casi todas las vistas mejoradas.

5. **`tailwind.config.js`**
   Configuración de Tailwind. Se modificará en MT-PRE-018 para agregar animaciones personalizadas.

---

**Agente Arquitecto ID:** abe6fbb (para retomar si es necesario)
