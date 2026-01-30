# Plan de Trabajo: Optimización UX/UI Sistema Académico

## Objetivo General
Optimizar la experiencia de usuario en el flujo docente: selección de salones → asignaturas → registro de notas → reportes, manteniendo la funcionalidad existente intacta.

---

## Estado Actual de las Rutas

| Ruta | Componente | Estilo | Estado |
|------|-----------|--------|--------|
| `/private/dashboard/academy/:periodId/:classroomId/:areaId` | Academy.tsx | Tailwind | ✅ Migrado |
| `/private/dashboard/notes/:periodId/:classroomId/:areaId` | Notes.tsx | Tailwind | ✅ Migrado |
| `/private/dashboard/report/:studentId/:year` | AcademicReport.tsx | Tailwind | ✅ Migrado |
| `/private/dashboard/report/:classroomId/:periodId/:schoolLevel/:year` | InformePorSalon.tsx | Tailwind | ✅ Migrado |
| `/private/dashboard/final-report/:studentId/:year` | FinalReport.tsx | Tailwind | ✅ Migrado |
| `/private/dashboard/bulk-print/:periodId/:classroomId` | BulkReportPrinter.tsx | Tailwind | ✅ Rediseñado |

---

## FASE 1: Vista de Salones y Asignaturas (Academy) ✅ COMPLETADA
## FASE 2: Vista de Notas ✅ COMPLETADA
## FASE 3: Sistema de Permisos Coordinador ✅ COMPLETADA
## FASE 4: Reportes Académicos ✅ COMPLETADA
## FASE 4B: Corrección de Bugs y Mejoras ✅ COMPLETADA
## FASE 4C: Rediseño Impresión Masiva ✅ COMPLETADA

---

## FASE 5: Configuración de Fecha de Entrega ✅ COMPLETADA

| ID | Microtarea | Archivos | Estado |
|----|------------|----------|--------|
| 5.1 | Crear modelo de configuración de período | `domain/entities/periodConfig.ts` | ✅ |
| 5.2 | Crear servicio para configuración de período | `infrastructure/periodConfig.service.ts` | ✅ |
| 5.3 | Agregar UI en modal desde SidebarV2 | `SidebarActions.tsx`, `PeriodConfigManager.tsx` | ✅ |
| 5.4 | Mostrar fecha de entrega en reportes | `AcademicReport.tsx` | ✅ |

**Archivos creados:**
- `domain/entities/periodConfig.ts` - Entidad PeriodConfig con periodId, year, fechaEntrega, activo
- `infrastructure/periodConfig.service.ts` - CRUD para colección `periodConfigs` en Firestore
- `features/settings/PeriodConfigManager.tsx` - UI de configuración de fechas por período/año

**Cambios realizados:**
- `SidebarActions.tsx`: Botón "Fechas de entrega" (solo Coordinador) que abre modal
- `AcademicReport.tsx`: Importa y muestra fecha de entrega configurada

---

## FASE 5B: Correcciones SidebarV2 ✅ COMPLETADA

| ID | Microtarea | Estado |
|----|------------|--------|
| 5B.1 | Corregir tooltips en botones superiores | ✅ |
| 5B.2 | Corregir hover que se sale del sidebar | ✅ |

**Cambios realizados:**
- `SidebarTooltip.tsx`: Cambiado `inline-flex` a `w-full` para tooltips correctos
- `SidebarActions.tsx`: Padding dinámico, botones `w-10 h-10` colapsados, `overflow-hidden`
- `SidebarNavItem.tsx`: Consistencia de tamaños (`w-10 h-10` colapsado)
- `SidebarV2.tsx`: Padding nav dinámico (`px-1` colapsado, `px-3` expandido)

---

## Progreso General

- [x] **FASE 1: Vista Academy** ✅
- [x] **FASE 2: Vista de Notas** ✅
- [x] **FASE 3: Permisos Coordinador** ✅
- [x] **FASE 4: Reportes Académicos** ✅
- [x] **FASE 4B: Bugs y Mejoras** ✅
- [x] **FASE 4C: Impresión Masiva** ✅
- [x] **FASE 5: Fecha de Entrega** ✅
- [x] **FASE 5B: Correcciones SidebarV2** ✅

---

## Notas Técnicas

### Configuración de Fechas de Entrega
- Colección Firestore: `periodConfigs`
- ID documento: `{year}_{periodId}` (ej: "2025_1")
- Acceso: Modal desde SidebarV2 > "Fechas de entrega" (solo Coordinador)
- AcademicReport.tsx consume `fetchPeriodConfig()` y muestra `formatFechaEntrega()`

### SidebarV2 - Modo Colapsado
- Botones nav y acciones: `w-10 h-10` centrados con `mx-auto`
- Nav container: `px-1` colapsado, `px-3` expandido
- Tooltips usan portal para evitar overflow

### Ordenamiento de Asignaturas
- Campo `orden` en colección `areas`
- Respetado en: AcademicReport, InformePorSalon, BulkReportPrinter, FinalReport

---

## Reglas AGENTS.md
- Máximo 2 archivos por microtarea
- Una microtarea a la vez
- No usar `any` ni `//@ts-ignore` sin explicación
