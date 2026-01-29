# ESTUDIANTES.md - Plan de Trabajo

## Resumen del Módulo

Este documento contiene el plan de trabajo para mejorar el módulo de gestión de estudiantes en Cubbico.

### Funcionalidades a Implementar

1. **Mejorar formulario de registro/edición** de estudiantes con Tailwind CSS
2. **Sistema de promoción de estudiantes** a siguientes salones
3. **Modal de configuración de promoción** con:
   - Lista de estudiantes a promover
   - Depuración (retirados, no promovidos, nuevos)
   - Asignación de modo de evaluación (normal/ajustes)
4. **Persistencia anual** del proceso de promoción

---

## Estado Actual del Módulo

### Entidad Estudiante (`studentInfo`)
```typescript
interface studentInfo {
    id: string;           // Número de documento
    document: string;     // Tipo (RC, TI)
    name: string;         // Nombres
    lastName: string;     // Apellidos
    classRoom: string;    // Nivel (Preescolar, Primaria, Básica Secundaria)
    className: string;    // Nombre del salón
    caracter: string;     // Modo evaluación (normal, ajustes)
    classroomId?: string; // ID del salón
}
```

### Archivos Principales Existentes
- `src/domain/entities/studentInfo.ts` - Entidad
- `src/infrastructure/student.service.ts` - Servicio CRUD
- `src/presentation/components/studentForm/` - Formulario actual (CSS puro)
- `src/presentation/features/students/StudentsList.tsx` - Lista de estudiantes
- `src/app/store/states/student.slice.ts` - Estado Redux

---

## FASE 1: Mejora del Formulario de Estudiantes (4-6 horas)

### MT-EST-001: Crear tipos TypeScript para gestión de estudiantes mejorada
**Objetivo:** Definir interfaces y tipos para el nuevo sistema de gestión

**Archivos a crear/modificar:**
- Crear: `src/shared/types/studentManagementTypes.ts`

**Criterios de aceptación:**
- Interface `StudentFormData` con todos los campos necesarios
- Interface `StudentPromotionData` para datos de promoción
- Type `EvaluationMode` = 'normal' | 'ajustes'
- Type `PromotionStatus` = 'promover' | 'no_promover' | 'retirado' | 'nuevo'
- Interface `PromotionConfig` para configuración del modal
- Documentación JSDoc completa

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-002: Crear componentes UI atómicos para formularios de estudiantes
**Objetivo:** Crear componentes Tailwind reutilizables para el formulario

**Archivos a crear:**
- Crear: `src/presentation/components/ui/Select.tsx`
- Crear: `src/presentation/components/ui/Label.tsx`

**Dependencias:** Componentes existentes de UI (Input, Button)

**Criterios de aceptación:**
- Componente `Select` con props: options, value, onChange, error, disabled
- Componente `Label` con props: text, required, htmlFor
- Estilos 100% Tailwind CSS
- Accesibilidad (ARIA labels)
- Sin archivos CSS separados

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-003: Refactorizar hook useStudentForm con mejores prácticas
**Objetivo:** Mejorar el hook del formulario con mejor tipado y validación

**Archivos a crear/modificar:**
- Crear: `src/presentation/components/studentForm/hooks/useStudentFormV2.ts`

**Dependencias:** MT-EST-001

**Criterios de aceptación:**
- Hook con tipado estricto usando tipos de MT-EST-001
- Estados separados: formData, errors, touched, isSubmitting
- Validación en tiempo real con debounce
- Carga dinámica de salones optimizada con useMemo
- Funciones para crear y editar estudiantes
- Reset de formulario correcto
- Sin `//@ts-ignore`

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-004: Rediseñar StudentForm con Tailwind CSS
**Objetivo:** Crear nueva versión del formulario usando Tailwind

**Archivos a crear:**
- Crear: `src/presentation/components/studentForm/StudentFormV2.tsx`

**Dependencias:** MT-EST-002, MT-EST-003

**Criterios de aceptación:**
- Formulario completamente rediseñado con Tailwind CSS
- Usa componentes de UI (Input, Select, Button, Label)
- Diseño responsivo (mobile-first)
- Campos organizados en grid de 2 columnas (desktop)
- Validación visual en tiempo real
- Loading states apropiados
- Indicadores de campo requerido
- Sin archivo CSS separado

**Estado:** ✅ COMPLETADA (2026-01-25)

---

## FASE 2: Sistema de Promoción de Estudiantes (8-12 horas)

### MT-EST-005: Crear servicio de promoción de estudiantes
**Objetivo:** Implementar funciones para promover estudiantes masivamente

**Archivos a crear:**
- Crear: `src/infrastructure/promotion.service.ts`

**Dependencias:** MT-EST-001

**Criterios de aceptación:**
- Función `promoteStudentsBatch(promotions)` - Promoción masiva
- Función `updateStudentClassroom(studentId, newClassroomId)` - Individual
- Función `updateStudentEvaluationMode(studentId, mode)` - Cambiar modo
- Función `getPromotionHistory(year)` - Historial de promociones
- Transacciones batch para operaciones masivas
- Registro de historial de promoción (año origen, año destino)
- Manejo de errores con try-catch
- Documentación JSDoc

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-006: Extender entidad studentInfo para promoción
**Objetivo:** Agregar campos necesarios para el sistema de promoción

**Archivos a modificar:**
- Modificar: `src/domain/entities/studentInfo.ts`
- Modificar: `src/shared/types/studentTypes.ts`

**Criterios de aceptación:**
- Campo `enrollmentYear?: string` - Año de matrícula
- Campo `lastPromotionYear?: string` - Último año de promoción
- Campo `promotionHistory?: PromotionRecord[]` - Historial
- Interface `PromotionRecord` con: fromClassroom, toClassroom, year, date
- Backwards compatible con datos existentes

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-007: Crear hook usePromotion para lógica de promoción
**Objetivo:** Implementar lógica de negocio para el modal de promoción

**Archivos a crear:**
- Crear: `src/presentation/features/students/hooks/usePromotion.ts`

**Dependencias:** MT-EST-005, MT-EST-006

**Criterios de aceptación:**
- Estado local para lista de estudiantes a promover
- Funciones: `addToPromotion`, `removeFromPromotion`, `setEvaluationMode`
- Función `togglePromotionStatus` (promover/no promover/retirado)
- Función `executePromotion` - Ejecuta la promoción masiva
- Cálculo automático de salón destino (siguiente nivel)
- Validaciones previas a promoción
- Loading states por operación

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-008: Crear componente StudentPromotionRow
**Objetivo:** Fila individual de estudiante en el modal de promoción

**Archivos a crear:**
- Crear: `src/presentation/features/students/components/StudentPromotionRow.tsx`

**Dependencias:** MT-EST-001

**Criterios de aceptación:**
- Muestra: nombre, apellido, salón actual, modo evaluación
- Checkbox para seleccionar/deseleccionar estudiante
- Select para modo de evaluación (normal/ajustes)
- Badge de estado (promover/no promover/retirado)
- Botones de acción para cambiar estado
- Indicador visual diferenciado por estado
- Estilos Tailwind CSS

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-009: Crear componente PromotionSummary
**Objetivo:** Resumen de la promoción antes de ejecutar

**Archivos a crear:**
- Crear: `src/presentation/features/students/components/PromotionSummary.tsx`

**Dependencias:** MT-EST-001

**Criterios de aceptación:**
- Muestra conteo por estado (promover, no promover, retirados)
- Muestra conteo por modo de evaluación
- Muestra salón origen y destino
- Advertencias si hay inconsistencias
- Botón de confirmación
- Estilos Tailwind CSS

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-010: Crear modal PromotionModal principal
**Objetivo:** Modal completo para gestionar promoción de estudiantes

**Archivos a crear:**
- Crear: `src/presentation/features/students/components/PromotionModal.tsx`

**Dependencias:** MT-EST-007, MT-EST-008, MT-EST-009

**Criterios de aceptación:**
- Header con selector de salón origen
- Lista scrolleable de StudentPromotionRow
- Barra de búsqueda/filtro de estudiantes
- Filtros por estado (todos/promover/no promover/retirados)
- Acciones masivas (seleccionar todos, cambiar modo a todos)
- Sección de agregar estudiante nuevo
- PromotionSummary en footer
- Botones Cancelar/Confirmar promoción
- Responsive design (modal fullscreen en móvil)
- Estilos 100% Tailwind CSS

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-011: Crear selector de salón destino inteligente
**Objetivo:** Componente para seleccionar/sugerir salón destino

**Archivos a crear:**
- Crear: `src/presentation/features/students/components/ClassroomDestinationSelector.tsx`

**Dependencias:** Ninguna

**Criterios de aceptación:**
- Sugiere automáticamente el siguiente salón (Primero → Segundo)
- Permite override manual si es necesario
- Muestra capacidad del salón destino (si aplica)
- Validación: no permitir promoción a mismo salón
- Estilos Tailwind CSS

**Estado:** ✅ COMPLETADA (2026-01-25)

---

## FASE 3: Integración y Flujo Completo (4-6 horas)

### MT-EST-012: Integrar PromotionModal en ClassRoomList
**Objetivo:** Agregar botón de promoción en la lista de salones

**Archivos a modificar:**
- Modificar: `src/presentation/features/students/ClassRoomList.tsx`

**Dependencias:** MT-EST-010

**Criterios de aceptación:**
- Botón "Promover estudiantes" en cada fila de salón
- Solo visible para salones con estudiantes
- Abre PromotionModal con salón preseleccionado
- Recarga lista después de promoción exitosa
- No afecta funcionalidad existente

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-013: Crear página/sección de Promoción Anual
**Objetivo:** Vista dedicada para proceso de promoción masiva

**Archivos a crear:**
- Crear: `src/presentation/features/students/PromotionManager.tsx`

**Dependencias:** MT-EST-010, MT-EST-011

**Criterios de aceptación:**
- Vista de todos los salones con conteo de estudiantes
- Selector de año académico
- Progreso de promoción por salón (completado/pendiente)
- Acceso rápido a PromotionModal por salón
- Historial de promociones realizadas
- Estilos Tailwind CSS

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-014: Actualizar StudentsList para mostrar modo de evaluación
**Objetivo:** Mejorar visualización del modo de evaluación en la lista

**Archivos a modificar:**
- Modificar: `src/presentation/features/students/StudentsList.tsx`

**Dependencias:** Ninguna

**Criterios de aceptación:**
- Columna "Modo Evaluación" con badge visual
- Badge verde para "Normal", badge amarillo para "Ajustes"
- Filtro por modo de evaluación
- No afecta otras funcionalidades

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-015: Migrar StudentsPage a nueva arquitectura
**Objetivo:** Integrar todos los nuevos componentes en la página principal

**Archivos a modificar:**
- Modificar: `src/presentation/pages/private/Dashboard/components/StudentsPage.tsx`

**Dependencias:** MT-EST-004, MT-EST-014

**Criterios de aceptación:**
- Usar StudentFormV2 en lugar del formulario legacy
- Mantener funcionalidad de crear/editar estudiantes
- Integrar acceso a PromotionManager
- Layout responsivo con Tailwind
- Sin regresiones de funcionalidad

**Estado:** ✅ COMPLETADA (2026-01-25)

---

## FASE 4: Limpieza y Documentación (2-3 horas)

### MT-EST-016: Eliminar archivos legacy y actualizar imports
**Objetivo:** Limpiar código obsoleto después de migración

**Archivos a modificar/eliminar:**
- Eliminar: `src/presentation/components/studentForm/StudentForm.css`
- Modificar: Imports en archivos que usen componentes antiguos

**Dependencias:** MT-EST-015 completamente funcional

**Criterios de aceptación:**
- Archivos CSS legacy eliminados
- Imports actualizados en toda la app
- Build sin warnings
- Funcionalidad completa verificada
- NOTA: Hacer commit antes de eliminar archivos

**Estado:** ✅ COMPLETADA (2026-01-25)

---

### MT-EST-017: Agregar ruta para PromotionManager
**Objetivo:** Crear ruta de navegación para el gestor de promociones

**Archivos a modificar:**
- Modificar: `src/app/routes/routes.ts`
- Modificar: `src/presentation/pages/private/Dashboard/Dashboard.tsx`
- Modificar: `src/presentation/components/sidebar/Sidebar.tsx`

**Dependencias:** MT-EST-013

**Criterios de aceptación:**
- Nueva ruta: `/private/dashboard/promotions`
- Enlace en sidebar (solo para Coordinador/Admin)
- Breadcrumb correcto
- Guard de autenticación aplicado

**Estado:** ✅ COMPLETADA (2026-01-25)

---

## Resumen del Plan

| Fase | Microtareas | Descripción |
|------|-------------|-------------|
| FASE 1 | MT-EST-001 a MT-EST-004 | Mejora del formulario de estudiantes |
| FASE 2 | MT-EST-005 a MT-EST-011 | Sistema de promoción de estudiantes |
| FASE 3 | MT-EST-012 a MT-EST-015 | Integración y flujo completo |
| FASE 4 | MT-EST-016 a MT-EST-017 | Limpieza y documentación |

**Total de microtareas:** 17
**Tiempo estimado:** 18-27 horas

---

## Restricciones (RECORDATORIO)

**Módulos Protegidos - NO TOCAR:**
- `src/presentation/components/notes/`
- `src/presentation/components/achievement/`
- `src/presentation/components/classRoomReport/`
- `src/presentation/components/informeGeneral/`

**Reglas de AGENTS.md:**
- Máximo 2 archivos por microtarea
- Una microtarea a la vez
- Sin expansión de alcance

---

## Registro de Avances

### 2026-01-25
- Creación del plan de trabajo
- Análisis del módulo existente completado
- 17 microtareas definidas en 4 fases
- ✅ **MT-EST-001 COMPLETADA**: Creado `src/shared/types/studentManagementTypes.ts`
  - Tipos para EvaluationMode, PromotionStatus, DocumentType, AcademicLevel
  - Interfaces para formularios, promoción, UI y servicios
  - Constantes para mapeo de promoción y colores de badges
  - Documentación JSDoc completa
- ✅ **MT-EST-002 COMPLETADA**: Creados componentes UI
  - `src/presentation/components/ui/Select.tsx` - Dropdown con soporte para errores, iconos, placeholder
  - `src/presentation/components/ui/Label.tsx` - Label con indicadores required/optional, descripción
  - Actualizado barrel export en `index.ts`
- ✅ **MT-EST-003 COMPLETADA**: Hook useStudentFormV2
  - `src/presentation/components/studentForm/hooks/useStudentFormV2.ts`
  - Estados separados: formData, errors, touched, isSubmitting
  - Soporte para modo crear y editar
  - Filtrado dinámico de salones por nivel
  - Validación en tiempo real, sin //@ts-ignore
- ✅ **MT-EST-004 COMPLETADA**: StudentFormV2 con Tailwind
  - `src/presentation/components/studentForm/StudentFormV2.tsx`
  - Grid responsivo, usa componentes UI
- ✅ **MT-EST-005 COMPLETADA**: Servicio de promoción
  - `src/infrastructure/promotion.service.ts`
  - promoteStudentsBatch, updateStudentClassroom, getNextClassroomSuggestion
- ✅ **MT-EST-006 COMPLETADA**: Entidad studentInfo extendida
  - Campos: enrollmentYear, lastPromotionYear, status, promotionHistory
- ✅ **MT-EST-007 COMPLETADA**: Hook usePromotion
  - `src/presentation/features/students/hooks/usePromotion.ts`
  - Gestión completa de promoción masiva
- ✅ **MT-EST-008 COMPLETADA**: StudentPromotionRow
  - `src/presentation/features/students/components/StudentPromotionRow.tsx`
  - Fila con checkbox, selects de estado y modo evaluación
- ✅ **MT-EST-009 COMPLETADA**: PromotionSummary
  - `src/presentation/features/students/components/PromotionSummary.tsx`
  - Grid de stats, advertencias, indicador de ejecución
- ✅ **MT-EST-010 COMPLETADA**: PromotionModal
  - `src/presentation/features/students/components/PromotionModal.tsx`
  - Modal fullscreen con filtros, búsqueda, acciones masivas
- ✅ **MT-EST-011 COMPLETADA**: ClassroomDestinationSelector
  - `src/presentation/features/students/components/ClassroomDestinationSelector.tsx`
  - Sugerencia automática, agrupado por nivel
- ✅ **MT-EST-012 COMPLETADA**: Integrar PromotionModal en ClassRoomList
  - Botón "Promover" con icono en cada salón
- ✅ **MT-EST-013 COMPLETADA**: PromotionManager
  - `src/presentation/features/students/PromotionManager.tsx`
  - Vista con cards por nivel, conteo estudiantes, selector año
- ✅ **MT-EST-014 COMPLETADA**: StudentsList mejorado
  - Filtros por modo evaluación, badges Tailwind con iconos
- ✅ **MT-EST-015 COMPLETADA**: StudentsPage migrada
  - Usa StudentFormV2, callback onSuccess para refrescar
- ✅ **MT-EST-016 COMPLETADA**: Limpieza y fixes
  - Eliminado `StudentForm.css` legacy
  - StudentsList.tsx usa StudentFormV2 para edición
  - Fix: Hook usePromotion usaba callbacks inline que causaban re-renders infinitos
  - Fix: Años de promoción corregidos (2025 → 2026 en lugar de 2026 → 2027)
  - Mejoras UI en PromotionModal:
    - Header con gradiente y badges de año
    - PromotionSummary compacto para sidebar
    - StatCards más pequeños para layout vertical
- ✅ **MT-EST-017 COMPLETADA**: Ruta para PromotionManager
  - Agregada constante `PROMOTIONS` en `src/app/routes/routes.ts`
  - Ruta `/private/dashboard/promotions` en Dashboard.tsx (solo Coordinador)
  - Enlace "Promociones" en Sidebar con tooltip

---

## ✅ PLAN COMPLETADO

Todas las 17 microtareas del módulo de gestión de estudiantes han sido completadas.

### Resumen de Funcionalidades Implementadas:
1. **StudentFormV2**: Formulario mejorado con Tailwind CSS
2. **Sistema de Promoción**: Modal completo para promover estudiantes masivamente
3. **PromotionManager**: Vista dedicada para gestión anual de promociones
4. **Filtros de evaluación**: En StudentsList para filtrar por modo normal/ajustes
5. **Ruta de acceso**: `/private/dashboard/promotions` disponible en sidebar

---

**Última actualización:** 2026-01-25
