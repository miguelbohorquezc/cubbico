# NOTASCONEXION.md — Plan de Microtareas

## Estado de avance

| MT | Descripción | Estado |
|----|------------|--------|
| MT-01 | Copiar logros del año anterior | ✅ Completado |
| MT-02 | Eliminar columnas Fallas de tabla de notas | ✅ Completado |
| MT-03 | AcademicReport: fallas desde asistencias + firmas condicionales | ✅ Completado |
| MT-04 | FinalReport: diseño gris y formal | ✅ Completado |

**✅ Plan completo.** 4/4 microtareas ejecutadas. TypeScript pasa sin errores en todas.

---

## Contexto

Ajustes al sistema de notas, logros y reportes tras la integración de asistencia online.
La asistencia se registra ahora en tiempo real (colección `asistencias`), por lo que los
campos de fallas en la tabla de notas son redundantes. Los reportes deben leer fallas
desde las listas de asistencia.

### Cambios solicitados
1. Permitir copiar logros del año anterior al año actual
2. Eliminar columnas Fallas / F. Injust. de la tabla de notas (GradeManager)
3. Informe de período (AcademicReport): contar fallas desde listas de asistencia
4. Firmas condicionales en informe de período: solo P4 lleva las 3 firmas; P1-P3 solo director de grupo
5. Informe final (FinalReport): reemplazar franja azul/indigo por gris, diseño formal; color solo en números

---

## ⚠️ Módulos Protegidos Involucrados

AGENTS.md §6 protege estos directorios. Las siguientes microtareas los tocan por
solicitud explícita del usuario:

| Microtarea | Módulo protegido | Archivos |
|------------|-----------------|----------|
| MT-01 | `presentation/components/achievement/` | useAchievementForm.ts, AchievementForm.tsx |
| MT-03 | `presentation/components/classRoomReport/` | AcademicReport.tsx |

---

## Microtareas

---

### MT-01 — Copiar logros del año anterior

**Archivos (2):**
- `src/presentation/components/achievement/useAchievementForm.ts`
- `src/presentation/components/achievement/AchievementForm.tsx`

**Objetivo:** El docente puede traer los 3 logros del año anterior como punto de partida
cuando el formulario está vacío.

**Lógica en useAchievementForm.ts:**
- Agregar estado `previousYearLogros: AchievementFormState | null`
- Tras cargar los logros del año actual (efecto existente), si el resultado es `null`
  (no hay logros para este año), intentar cargar del año anterior:
  `getAchievement(classroomId, areaId, periodNumber, String(currentYear - 1))`
- Si existen, guardar en `previousYearLogros`
- Exponer función `copyFromPreviousYear()` que setea `form` con los valores de `previousYearLogros`

**Lógica en AchievementForm.tsx:**
- Mostrar botón "Copiar logros del año anterior" cuando:
  - `previousYearLogros !== null`
  - Los 3 campos del form están vacíos (`!form.logro1 && !form.logro2 && !form.logro3`)
- Al hacer clic, llamar a `copyFromPreviousYear()`

**Definición de done:**
- Botón aparece solo cuando form está vacío y hay logros del año anterior
- Al copiar, los 3 campos se poblan correctamente
- Si no hay logros del año anterior, el botón no aparece
- TypeScript pasa sin errores

---

### MT-02 — Eliminar columnas Fallas de tabla de notas

**Archivos (1):**
- `src/presentation/features/notesManager/GradeManager.tsx`

**Objetivo:** Remover las columnas "Fallas" y "F. Injust." de la tabla de ingreso de notas.

**Cambios:**
- Eliminar los 2 `<th>` del thead: "Fallas" (línea 120-122) y "F. Injust." (línea 123-125)
- Eliminar los 2 `<td>` por cada fila de estudiante: bloque Fallas (líneas 168-179) y bloque Fallas injustificadas (líneas 181-192)

**No se toca:**
- `types.ts` — los tipos `CampoCalificacion` y `SimplifiedGrade` mantienen los campos
  fallas/fallasVerificadas. El batch save seguirá enviando fallas=0 para entradas nuevas
  (String `''` → Number `0`). Datos históricos se preservan sin cambios.
- `useConstruirYEnviarLote.ts` — no requiere cambios; fallas queda como valor por defecto
- `useCargarEstudiantesYNotas.ts` — sigue cargando fallas desde Firestore (sin mostrarlos)

**Definición de done:**
- La tabla muestra: Estudiante | L1 | L2 | L3 | Prom. | Informes
- No hay errores de compilación
- TypeScript pasa

---

### MT-03 — AcademicReport: fallas desde asistencias + firmas condicionales

**Archivos (1):**
- `src/presentation/components/classRoomReport/AcademicReport.tsx`

**Objetivo:**
(a) Calcular F y FI desde las listas de asistencia en lugar de leerlos de `grades`.
(b) Mostrar firmas condicionales según el período.

**Lógica — Fallas:**

Datos disponibles en el componente:
- `classroomId` ← de `studentInfo.classroomId` (ya cargado, línea 61)
- `studentId` ← de URL params
- `periodId` ← de URL params
- `periodConfig` ← ya se obtiene (línea 100), tiene `fechaInicio` y `fechaFin`

Estrategia de consulta (1 sola query de Firestore para todas las áreas):
1. Tras obtener `periodConfig`, si tiene `fechaInicio` y `fechaFin`:
   - Llamar `fetchAttendanceByClassroom(classroomId, fechaInicio, fechaFin)` → array de todos los registros del salón en ese período
2. Para cada área al construir `SubjectData`:
   - Extraer `teacherId` del metadata: `(areaData as any).metadata?.teacherId`
   - Filtrar los registros: `.filter(r => r.profesorId === teacherId && r.areaId === areaId)`
   - Llamar `computeAttendanceSummary(filteredRecords, studentId)`
   - Mapear: `F = totalJustified + totalUnjustified`, `FI = totalUnjustified`
3. Si `fechaInicio`/`fechaFin` no existen en periodConfig → fallback: F=0, FI=0

Donde mostrar los valores calculados:
- En `SubjectData`, agregar campos `fallasTotales` y `fallasInjustificadas` (calculados)
- En `SubjectRow`, reemplazar `{subject.grades.fallas}` y `{subject.grades.fallasVerificadas}`
  por los nuevos campos calculados

**Lógica — Firmas:**
- Pasar `periodId` como prop a `SignaturesTable`
- Si `periodId === '4'`: mostrar las 3 firmas (directora, coordinadora, director de grupo) — igual que hoy
- Si `periodId !== '4'`: mostrar solo la firma del director de grupo (1 columna centrada)

**Imports a agregar:**
```typescript
import { fetchAttendanceByClassroom } from '../../../infrastructure/attendance.service';
import { computeAttendanceSummary } from '../../../domain/entities/attendance';
```

**Definición de done:**
- F y FI se leen de asistencia online, no de `grades`
- Periodos 1-3: solo firma director de grupo
- Periodo 4: las 3 firmas
- Si no hay configuración de fechas del período, los campos F y FI muestran 0
- TypeScript pasa

---

### MT-04 — FinalReport: diseño gris y formal

**Archivos (1):**
- `src/presentation/pages/private/Dashboard/components/FinalReport.tsx`

**Objetivo:** Reemplazar la franja azul/indigo por gris. Usar color solo en los badges
de categoría de los números.

**Tabla de cambios:**

| Elemento | Línea | Clase actual | Clase nueva |
|----------|-------|--------------|-------------|
| Franja título | 505 | `from-indigo-600 to-blue-600` | `from-gray-700 to-gray-600` |
| Badges P1-P4 header | 299 | `bg-blue-100 text-blue-700` | `bg-gray-200 text-gray-700` |
| Fila pie tabla (tfoot) | 352 | `from-indigo-50 to-blue-50` | `from-gray-100 to-gray-50` |
| Border pie | 355, 359 | `border-indigo-200` | `border-gray-300` |
| Número promedio general | 361 | `text-indigo-700` | `text-gray-900` |

**No se cambia:**
- Badges de categoría en celdas (Superior/Alto/Básico/Bajo) — estos son los "números con color"
- Badge de categoría del promedio general (ya usa `getGradeCategory`)
- Las 3 firmas (ya están correctas para el informe final)
- Estructura del layout

**Definición de done:**
- No hay azul ni indigo en elementos estructurales
- Los badges de categoría mantienen sus colores originales
- TypeScript pasa

---

## Orden de ejecución

| Orden | Microtarea | Motivo |
|-------|-----------|--------|
| 1 | MT-02 | Sin dependencias, no es módulo protegido, fácil de verificar |
| 2 | MT-04 | Sin dependencias, no es módulo protegido, solo cambio de colores |
| 3 | MT-01 | Módulo protegido, sin dependencias con otros MT |
| 4 | MT-03 | Módulo protegido, usa servicios existentes (attendance.service, computeAttendanceSummary) |

---

## Notas y riesgos conocidos

- **Bug pre-existente (fuera de scope):** GradeManager.tsx tiene `2025` hardcoded en los
  links de informe (líneas 205 y 225). Debería usar `anioActual`. No se aborda en este plan.
- **periodConfig sin fechas:** Si un período no tiene `fechaInicio`/`fechaFin` configurados
  en Firestore, MT-03 debe mostrar F=0 y FI=0 sin romper el reporte.
- **Datos históricos de fallas en grades:** Los campos `fallas`/`fallasVerificadas` que ya
  están guardados en history/{studentId} no se borran. Solo dejan de usarse en los reportes
  (reemplazados por datos de asistencia). Esto es intencional.
