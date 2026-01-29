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

---

## FASE 4: Reportes Académicos ✅ COMPLETADA

| ID | Microtarea | Estado |
|----|------------|--------|
| 4.1 | Optimizar AcademicReport.tsx con Tailwind | ✅ |
| 4.2 | Optimizar InformePorSalon.tsx con Tailwind | ✅ |
| 4.3 | Optimizar FinalReport.tsx con Tailwind | ✅ |

---

## FASE 4B: Corrección de Bugs y Mejoras ✅ COMPLETADA

| ID | Microtarea | Estado |
|----|------------|--------|
| 4B.1 | Ampliar tamaño del modal de logros | ✅ |
| 4B.2 | Corregir carga de logros al entrar a asignatura | ✅ |
| 4B.3 | Corregir orden de asignaturas en informes | ✅ |

**Cambios realizados:**
- Modal.tsx: Agregados tamaños 3xl, 4xl, full
- Notes.tsx: Modal de logros ahora usa size="3xl"
- teacher.service.ts: Ahora carga achievements junto con classrooms y areas
- TeacherDataLoader.tsx: Dispatch de achievements al store
- InformePorSalon.tsx: Ordenamiento de asignaturas por campo 'orden'

---

## FASE 4C: Rediseño Impresión Masiva ✅ COMPLETADA

| ID | Microtarea | Estado |
|----|------------|--------|
| 4C.1 | Rediseñar BulkReportPrinter para documento único | ✅ |
| 4C.2 | Configurar estilos para hoja legal y PDF | ✅ |
| 4C.3 | Renderizar informes en secuencia (uno debajo de otro) | ✅ |
| 4C.4 | Diferenciar vista primaria vs secundaria | ✅ |

**Cambios realizados en BulkReportPrinter.tsx:**
- Genera UN documento único con todos los informes
- Usa `@page { size: legal portrait }` para hoja legal
- Usa `page-break-after: always` entre informes
- Vista de previsualización antes de imprimir
- Botón "Imprimir / Exportar PDF" que usa `window.print()`
- Diferencia primaria (lista plana) vs secundaria (agrupado por áreas)
- Ordena asignaturas por campo 'orden'

---

## FASE 5: Configuración de Fecha de Entrega (PENDIENTE)

| ID | Microtarea | Archivos (máx 2) | Estado |
|----|------------|------------------|--------|
| 5.1 | Crear modelo de configuración de período | `domain/entities/` | ⏳ |
| 5.2 | Crear servicio para configuración de período | `infrastructure/` | ⏳ |
| 5.3 | Agregar UI para configurar fecha de entrega | Componente nuevo | ⏳ |
| 5.4 | Mostrar fecha de entrega en reportes | `AcademicReport.tsx` | ⏳ |

---

## Pendientes Menores

| ID | Tarea | Estado |
|----|-------|--------|
| 4.3 | Optimizar FinalReport.tsx con Tailwind | ✅ |

**Cambios realizados en FinalReport.tsx:**
- Migrado completamente a Tailwind CSS (sin archivo CSS externo)
- Spinner de carga moderno con animación
- Barra de título con gradiente ("INFORME FINAL – {año}")
- Badges de calificación coloreados por período y promedio final
- Leyenda visual con puntos de colores
- Estructura y cálculos de datos sin modificar

---

## Progreso General

- [x] **FASE 1: Vista Academy** ✅ COMPLETADA
- [x] **FASE 2: Vista de Notas** ✅ COMPLETADA
- [x] **FASE 3: Permisos Coordinador** ✅ COMPLETADA
- [x] **FASE 4: Reportes Académicos** ✅ COMPLETADA (4.1 ✅, 4.2 ✅, 4.3 ✅)
- [x] **FASE 4B: Bugs y Mejoras** ✅ COMPLETADA
- [x] **FASE 4C: Impresión Masiva Rediseño** ✅ COMPLETADA
- [ ] **FASE 5: Fecha de Entrega** ← SIGUIENTE

---

## Notas Técnicas

### Ordenamiento de Asignaturas
- Las asignaturas tienen un campo `orden` en la colección `areas`
- AcademicReport.tsx y InformePorSalon.tsx respetan este orden
- BulkReportPrinter.tsx también respeta el orden
- Secundaria agrupa por campo `area`, ordenando internamente

### Impresión Masiva - Implementación Final
- Documento único con todos los informes
- CSS `@page { size: legal portrait }` para hoja legal
- `page-break-after: always` entre informes de estudiantes
- `window.print()` permite guardar como PDF desde el navegador

### Carga de Achievements
- teacher.service.ts ahora carga achievements junto con classrooms y areas
- TeacherDataLoader.tsx hace dispatch de achievements al store Redux
- TeacherAchievements.tsx filtra por classroomId, areaId y periodId

### FinalReport.tsx - Migración Tailwind
- Sin archivo CSS externo, todo en clases Tailwind
- Función `getGradeCategory()` retorna colores según promedio
- Tabla con encabezados estilizados y filas alternadas
- Promedios por período muestran badges coloreados
- Promedio final destacado con gradiente
- Estados de carga/error modernos

---

## Reglas AGENTS.md
- Máximo 2 archivos por microtarea
- Una microtarea a la vez
- No usar `any` ni `//@ts-ignore` sin explicación
