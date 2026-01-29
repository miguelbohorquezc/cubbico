# Plan de Trabajo: Optimización UX/UI Sistema Académico

## Objetivo General
Optimizar la experiencia de usuario en el flujo docente: selección de salones → asignaturas → registro de notas → reportes, manteniendo la funcionalidad existente intacta.

---

## Estado Actual de las Rutas

| Ruta | Componente | Estilo | Estado |
|------|-----------|--------|--------|
| `/private/dashboard/academy/:periodId/:classroomId/:areaId` | Academy.tsx | Tailwind | ✅ Migrado |
| `/private/dashboard/notes/:periodId/:classroomId/:areaId` | Notes.tsx | CSS Tradicional | ⏳ Pendiente |
| `/private/dashboard/report/:studentId/:year` | AcademicReport.tsx | CSS Tradicional | ⏳ Pendiente |
| `/private/dashboard/report/:classroomId/:periodId/:schoolLevel/:year` | InformePorSalon.tsx | CSS Tradicional | ⏳ Pendiente |
| `/private/dashboard/final-report/:studentId/:year` | FinalReport.tsx | CSS Tradicional | ⏳ Pendiente |

---

## Módulos Protegidos (Requieren autorización)

```
src/presentation/components/notes/
src/presentation/components/achievement/
src/presentation/components/classRoomReport/
src/presentation/components/informeGeneral/
```

---

## FASE 1: Vista de Salones y Asignaturas (Academy)

**Objetivo:** Mejorar la experiencia de selección de salón y asignatura para los docentes.

**Archivos involucrados:**
- `src/presentation/pages/private/Dashboard/components/Academy.tsx`
- `src/presentation/features/teacher/TeacherClassrooms.tsx`
- `src/presentation/features/teacher/TeacherAreas.tsx`

### Microtareas Fase 1

| ID | Microtarea | Archivos (máx 2) | Estado |
|----|------------|------------------|--------|
| 1.1 | Mejorar feedback visual al seleccionar salón (estado activo) | `TeacherClassrooms.tsx` | ⏳ |
| 1.2 | Mostrar nombre del salón seleccionado en el header de asignaturas | `Academy.tsx` | ⏳ |
| 1.3 | Agregar breadcrumb de navegación (Período → Salón → Asignatura) | `Academy.tsx` | ⏳ |
| 1.4 | Mejorar empty state cuando no hay salones asignados | `TeacherClassrooms.tsx` | ⏳ |

---

## FASE 2: Vista de Notas (Requiere autorización)

**Objetivo:** Optimizar UX/UI del registro de notas sin afectar la funcionalidad de calificación.

**Archivos involucrados:**
- `src/presentation/pages/private/Dashboard/components/Notes.tsx`
- `src/presentation/features/notesManager/GradeManager.tsx`
- `src/presentation/features/teacher/TeacherAchievements.tsx`
- `src/presentation/components/achievement/AchievementForm.tsx`

### Microtareas Fase 2

| ID | Microtarea | Archivos (máx 2) | Estado |
|----|------------|------------------|--------|
| 2.1 | Migrar layout de Notes.tsx a SidebarV2/HeaderV2 | `Notes.tsx` | ⏳ |
| 2.2 | Optimizar estilos de TeacherAchievements con Tailwind | `TeacherAchievements.tsx` | ⏳ |
| 2.3 | Mejorar visual del formulario de logros (sin cambiar funcionalidad) | `AchievementForm.tsx` | ⏳ |
| 2.4 | Optimizar tabla de calificaciones GradeManager (solo estilos) | `GradeManager.tsx` | ⏳ |

---

## FASE 3: Sistema de Permisos Coordinador

**Objetivo:** Permitir que el usuario coordinador tenga acceso "super" a reportes aunque no esté asignado directamente.

**Archivos a crear/modificar:**
- `src/infrastructure/permission.service.ts` (nuevo)
- `src/domain/entities/` (tipos de roles)

### Microtareas Fase 3

| ID | Microtarea | Archivos (máx 2) | Estado |
|----|------------|------------------|--------|
| 3.1 | Crear servicio de permisos con rol coordinador | `permission.service.ts` | ⏳ |
| 3.2 | Implementar verificación de permisos en rutas de reportes | Componente de ruta | ⏳ |
| 3.3 | Agregar UI para acceso coordinador a reportes de cualquier docente | Componente de navegación | ⏳ |

---

## FASE 4: Reportes Académicos (Requiere autorización)

**Objetivo:** Optimizar diseño visual con Tailwind SIN cambiar estructura, columnas ni información presentada.

**Restricciones críticas:**
- NO cambiar cálculos de promedios
- NO cambiar estructura de tablas
- NO cambiar información mostrada
- SOLO mejorar aspecto visual
- MANTENER estilos de impresión funcionales

### Microtareas Fase 4

| ID | Microtarea | Archivos (máx 2) | Estado |
|----|------------|------------------|--------|
| 4.1 | Optimizar AcademicReport.tsx con Tailwind (visual) | `AcademicReport.tsx` + `.css` | ⏳ |
| 4.2 | Optimizar InformePorSalon.tsx con Tailwind (visual) | `InformePorSalon.tsx` + `.css` | ⏳ |
| 4.3 | Optimizar FinalReport.tsx con Tailwind (visual) | `FinalReport.tsx` | ⏳ |

---

## FASE 5: Configuración de Fecha de Entrega

**Objetivo:** Agregar capacidad de configurar fecha de entrega para reportes de período.

### Microtareas Fase 5

| ID | Microtarea | Archivos (máx 2) | Estado |
|----|------------|------------------|--------|
| 5.1 | Crear modelo de configuración de período con fecha de entrega | `domain/entities/` | ⏳ |
| 5.2 | Crear servicio para guardar/obtener configuración de período | `infrastructure/` | ⏳ |
| 5.3 | Agregar UI para configurar fecha de entrega | Componente nuevo | ⏳ |
| 5.4 | Mostrar fecha de entrega en reportes de período | `AcademicReport.tsx` | ⏳ |

---

## Commits Planificados

Cada fase tendrá su propio commit:

1. `feat(academy): mejorar UX de selección de salones y asignaturas`
2. `feat(notes): optimizar UI del registro de notas con Tailwind`
3. `feat(permissions): implementar permisos de coordinador para reportes`
4. `style(reports): optimizar diseño visual de reportes con Tailwind`
5. `feat(reports): agregar configuración de fecha de entrega`

---

## Progreso General

- [x] Análisis inicial completado
- [ ] **FASE 1: Vista Academy** ← INICIANDO
- [ ] FASE 2: Vista de Notas
- [ ] FASE 3: Permisos Coordinador
- [ ] FASE 4: Reportes Académicos
- [ ] FASE 5: Fecha de Entrega

---

## Notas de Implementación

### Reglas AGENTS.md
- Máximo 2 archivos por microtarea
- Una microtarea a la vez
- Declarar objetivo, archivos y definición de done antes de codificar
- No usar `any` ni `//@ts-ignore` sin explicación

### Arquitectura
- `presentation/` → React, hooks, UI
- `infrastructure/` → Firebase & servicios
- `domain/` → Entidades puras TypeScript

### Estilos
- Usar Tailwind CSS para todo lo nuevo
- Mobile-first
- No crear archivos `.css` nuevos
