# Sistema de Horarios y Asistencias

## Objetivo
Incorporar un sistema de horarios (creado por el Coordinador) y asistencias en línea (registradas por los Docentes), con reporte imprimible. El calendario se integra en el Dashboard (`/private/dashboard/history`) y es el punto de entrada para registrar asistencias.

---

## Modelo de Datos

### Colección `horarios` (1 doc por año)
```
horarios/{year}
  └── slots: [
        {
          profesorId: string,
          profesorNombre: string,
          salonId: string,
          salonNombre: string,
          areaId: string,
          areaNombre: string,
          dia: number,          // 0=Lunes … 4=Viernes
          hora: string          // "7:30" | "8:20" | "9:10" | "10:30" | "11:20" | "12:10" | "13:40" | "14:30" | "15:20"
        }
      ]
```
- Regla: un profesor no puede tener 2 clases en mismo día+hora.
- Regla: un salón no puede tener 2 clases en mismo día+hora.

### Colección `asistencias` (1 doc por clase-sesión)
```
asistencias/{salonId}_{profesorId}_{areaId}_{fecha}_{hora}
  └── {
        salonId: string,
        profesorId: string,
        areaId: string,
        fecha: string,          // ISO "2025-01-30"
        hora: string,           // "7:30"
        año: string,
        estudiantes: {
          [studentId]: {
            status: "present" | "justified" | "unjustified",
            motivo?: string,    // obligatorio si status = unjustified
            conExcusa?: boolean
          }
        }
      }
```

---

## Flujo
```
Coordinador → ScheduleEditor → guarda horarios en Firestore
                                       ↓
Docente → Home.tsx (Dashboard) ← lee horarios → ve su semana actual
                  ↓ (click clase de hoy)
          AttendanceList ← lee estudiantes del salón + asistencias guardadas
                  ↓ (marca / justifica)
          guarda asistencias en Firestore
                  ↓
          AttendanceReport ← lee asistencias del salón → imprime
```

---

## Microtareas y Avance

| ID | Microtarea | Archivos | Estado |
|----|------------|----------|--------|
| 1.1 | Entidad + Servicio Schedule | `domain/entities/schedule.ts` ✨, `infrastructure/schedule.service.ts` ✨ | ✅ |
| 1.2 | Entidad + Servicio Attendance | `domain/entities/attendance.ts` ✨, `infrastructure/attendance.service.ts` ✨ | ✅ |
| 2.1 | ScheduleEditor (UI Coordinador) | `features/schedule/ScheduleEditor.tsx` ✨, `routes.ts` ✏️ | ✅ |
| 2.2 | Conectar ruta + sidebar | `Dashboard.tsx` ✏️, `sidebarNavConfig.ts` ✏️ | ✅ |
| 3.1 | Calendario docente en Dashboard | `features/schedule/TeacherCalendar.tsx` ✨, `Home.tsx` ✏️ | ✅ |
| 4.1 | AttendanceList (marca asistencia) | `features/attendance/AttendanceList.tsx` ✨, `Dashboard.tsx` ✏️ | ✅ |
| 4.2 | Modal de justificación | `features/attendance/JustificationModal.tsx` ✨, `AttendanceList.tsx` ✏️ | ✅ |
| 4.3 | Conectar calendario → asistencia | Ya cubierto por TeacherCalendar + ruta en Dashboard | ✅ |
| 5.1 | Reporte de asistencias | `features/attendance/AttendanceReport.tsx` ✨, `Dashboard.tsx` ✏️ | ✅ |

---

### Avance 1 (microtareas 1.1 – 3.1) ✅
- Entidades y servicios de horario y asistencia listos.
- ScheduleEditor: grid semanal con drag & drop, conflictos, auto-save, filtro por profesor/salón, impresión.
- Ruta `/horario` conectada en Dashboard.tsx, item "Horario" en sidebar (solo Coordinador).
- TeacherCalendar: semana actual del docente en Home.tsx, clase clickeable navega a asistencia, hoy destacado.
- Quedan: AttendanceList (4.1), JustificationModal (4.2), conexión calendario→asistencia (4.3), AttendanceReport (5.1).

### Avance 2 (microtareas 4.1 – 5.1) ✅
- AttendanceList: grid mensual, ciclo de estados (null→present→unjustified→justified), debounce save, navigación al reporte.
- JustificationModal: motivo obligatorio + checkbox "con excusa", se abre al marcar injustificada.
- 4.3: la conexión calendario→asistencia ya estaba cubierta por TeacherCalendar + ruta en Dashboard.
- AttendanceReport: 3 tabs (Resumen KPIs, Estudiantes ranking, Días detalle), umbral de alerta configurable, impresión.
- **Bugs corregidos en sesión de fix:** paths de import `../../components/` (estaban con `../../../`), `IconBarChart` → `IconChartBar`, `</div>` extra en tab resumen.
- **Build pasa limpio.** Todas las microtareas completadas.

---

## Notas Técnicas

### Bloques horarios
```
7:30 → 8:20 → 9:10 → [recreo 10:00-10:30] → 10:30 → 11:20 → 12:10 → [recreo 13:00-13:40] → 13:40 → 14:30 → 15:20
```

### Patrones de UI del proyecto
- Layout: `flex h-screen`, `SidebarV2`, `HeaderV2`
- Iconos: `@tabler/icons-react`
- Cards: `bg-white rounded-2xl shadow-sm border border-gray-100/80`
- Botones: `bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl`
- Colores de estado asistencia: present=emerald, justified=amber, unjustified=red

### Archivos clave de referencia
- Router de rutas: `src/presentation/pages/private/Dashboard/Dashboard.tsx`
- Constantes de ruta: `src/app/routes/routes.ts`
- Dashboard (donde va el calendario): `src/presentation/pages/private/Dashboard/components/Home.tsx`
- Sidebar config: `src/presentation/components/sidebarV2/config/sidebarNavConfig.ts`
- Entidades existentes: `src/domain/entities/`
- Servicios existentes: `src/infrastructure/`

### Reglas AGENTS.md
- Máximo 2 archivos por microtarea
- Una microtarea a la vez
- No usar `any` ni `//@ts-ignore` sin explicación
- Tailwind para UI nueva (sin archivos .css)
- No tocar: notes/, achievement/, classRoomReport/, informeGeneral/
