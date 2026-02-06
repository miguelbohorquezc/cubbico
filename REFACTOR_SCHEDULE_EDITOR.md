# Plan de Refactorización - ScheduleEditor Legacy → Flexible

**Estado:** 🚧 En Progreso (5/9 microtareas completadas - 56%)

**Última actualización:** 2026-02-05

## Análisis del Código Actual

### Funcionalidades Críticas Identificadas

**ScheduleEditor.tsx (593 líneas)** actualmente implementa:

1. **Drag & Drop de Asignaturas** (líneas 179-224)
   - Panel lateral con áreas arrastrables
   - Requiere selección previa de profesor + salón
   - Drop en celdas del grid por día/hora
   - Sistema de detección de conflictos

2. **Navegación a Asistencia** (línea 560)
   - Botón en cada slot que navega a: `/asistencia/report/{salonId}/{profesorId}/{areaId}/{hora}`
   - **CRÍTICO**: Esta ruta usa `hora` como parámetro (formato "HH:mm")
   - Debe seguir funcionando con el nuevo modelo flexible

3. **Sistema de Conflictos** (líneas 195-204)
   - Función `detectSlotConflict()` valida profesor y salón en mismo día/hora
   - Muestra alerta temporal (3 segundos)

4. **Panel Lateral** (líneas 419-506)
   - Secciones: Profesores, Salones, Asignaturas
   - Click para seleccionar profesor/salón
   - Drag & drop desde asignaturas
   - Leyenda de estados visuales

5. **Filtros de Vista** (líneas 350-363)
   - Vista general (all)
   - Filtro por profesor (prof:id)
   - Filtro por salón (room:id)
   - Afecta opacidad de slots (función `isDimmed()`)

6. **Guardado Automático** (líneas 165-176)
   - Debounce de 900ms
   - Estados: idle, saving, saved, error
   - Guardado en Firebase tras cada cambio

7. **Impresión** (líneas 154-162, 407-414)
   - Cambio dinámico de tamaño de página (letter/legal)
   - Header especial para impresión
   - Oculta controles interactivos

8. **Bloques Horarios Configurables** (líneas 112-141, 271-297)
   - Integración con `TimeBlockConfiguration`
   - Detección automática de bloques personalizados vs TIME_SLOTS
   - Navegación a `/time-blocks` para configurar

### Integraciones a Mantener

1. **Módulo de Asistencia** - La navegación debe preservar el formato de URL
2. **Firebase Persistence** - Guardado en colección `horarios` (migrará a `flexible-schedules`)
3. **Sistema de Usuarios** - Carga de profesores vía `fetchDocentes()`
4. **Salones** - Carga vía `fetchClassrooms()`
5. **Áreas** - Carga vía `getAreas()`
6. **TimeBlocks** - Integración con configuración de bloques horarios
7. **SidebarV2 + HeaderV2** - Componentes de layout existentes
8. **Sistema de Rutas** - Integración con PrivateRoutes

## Estrategia de Refactorización

### Approach: **Reemplazo Gradual con Coexistencia Temporal**

**Justificación:**
- El ScheduleEditor es un componente crítico con muchas integraciones
- Reemplazo "big bang" tiene alto riesgo de romper asistencia
- Permitir coexistencia temporal facilita rollback si algo falla

**Plan de Migración:**

1. **Fase 1**: Adaptar el modelo de datos (mantener compatibilidad)
2. **Fase 2**: Reemplazar el grid HTML por FlexibleCalendar
3. **Fase 3**: Migrar drag & drop al nuevo sistema
4. **Fase 4**: Adaptar navegación a asistencia
5. **Fase 5**: Migrar guardado a modelo flexible
6. **Fase 6**: Limpiar código legacy

### Consideraciones Técnicas

**Diferencias Críticas entre Legacy y Flexible:**

| Aspecto | Legacy (ScheduleSlot) | Flexible (FlexibleScheduleActivity) |
|---------|----------------------|-------------------------------------|
| Tiempo | `hora: string` (TIME_SLOTS) | `startTime + durationMinutes` |
| Identificación | Array index | `id: string` |
| Conflictos | Por día/hora exacta | Por rango temporal (overlap) |
| Colección | `horarios` | `flexible-schedules` |

**Riesgos Identificados:**

1. **Navegación a asistencia**: Requiere convertir `FlexibleScheduleActivity` → parámetro `hora`
2. **Filtros de vista**: Lógica de `isDimmed()` debe adaptarse a activities
3. **Impresión**: Layout responsive debe funcionar con alturas variables
4. **Guardado**: Migración de datos legacy → flexible sin pérdida de información

---

## Microtareas de Refactorización

### Microtarea R1: Adaptar ScheduleEditor para cargar datos flexibles

**Objetivo:** Modificar el hook de carga de datos para obtener actividades flexibles en lugar de slots legacy, manteniendo compatibilidad visual temporal.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Panel lateral completo (líneas 419-506)
- Botones de acciones (líneas 327-396)
- Sistema de impresión (líneas 154-162, 407-414)
- Grid de tabla HTML (líneas 510-586)

**Cambios:**
1. Importar `fetchFlexibleSchedule` desde `schedule.service.ts`
2. Cambiar estado `slots` → `activities` con tipo `FlexibleScheduleActivity[]`
3. Modificar useEffect de carga (líneas 119-151):
   - Usar `fetchFlexibleSchedule(year)` en lugar de `fetchSchedule(year)`
   - Mantener carga de profesores, salones, áreas, timeBlockConfig
4. Agregar función auxiliar `convertActivityToSlot()` para convertir activities → slots temporalmente
5. Modificar `activeTimeSlots` (líneas 271-297) para extraer horas de activities

**Definition of Done:**
- [ ] ScheduleEditor carga activities desde `flexible-schedules`
- [ ] Conversión temporal a slots permite renderizar el grid sin cambios
- [ ] No hay errores en consola
- [ ] El guardado aún no funciona (esperado, se arregla en R5)

**Tiempo estimado:** 2 horas
**Dependencias:** Ninguna

---

### Microtarea R2: Crear componente adaptador FlexibleSchedulePanel

**Objetivo:** Construir un panel lateral que mantenga la UI/UX exacta del actual pero prepare el estado para drag & drop flexible.

**Archivos a modificar:**
1. `src/presentation/features/schedule/components/FlexibleSchedulePanel.tsx` (NUEVO)

**Mantener intacto:**
- Lógica de navegación a asistencia
- Grid de horario
- Sistema de guardado

**Cambios:**
1. Extraer JSX del panel lateral de ScheduleEditor (líneas 419-506)
2. Crear componente `FlexibleSchedulePanel` con props:
   - `professors: DocenteOption[]`
   - `classrooms: ClassRoom[]`
   - `areas: Area[]`
   - `selectedProfId: string | null`
   - `selectedRoomId: string | null`
   - `onSelectProf: (id: string | null) => void`
   - `onSelectRoom: (id: string | null) => void`
   - `onDragStartArea: (e, area) => void`
3. Mantener estilos Tailwind idénticos
4. Mantener leyenda de colores
5. Mantener hint de selección

**Definition of Done:**
- [ ] Componente FlexibleSchedulePanel renderiza igual que el actual
- [ ] Props permiten control desde ScheduleEditor
- [ ] Drag de áreas funciona (preparado para siguiente microtarea)
- [ ] No hay regresión visual

**Tiempo estimado:** 1.5 horas
**Dependencias:** R1

---

### Microtarea R3: Integrar FlexibleCalendar en ScheduleEditor

**Objetivo:** Reemplazar el grid de tabla HTML por FlexibleCalendar manteniendo toda la funcionalidad existente.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Panel lateral (ahora FlexibleSchedulePanel)
- Botones de acciones
- Sistema de guardado (aunque aún no funcione)
- Navegación a asistencia (aunque requiera adaptación)

**Cambios:**
1. Reemplazar `<table>` (líneas 512-584) por `<FlexibleCalendar>`
2. Configurar props de FlexibleCalendar:
   - `year={year}`
   - `onActivityClick={(activity) => { /* preparar para navegación a asistencia */ }}`
   - `readOnly={false}`
3. Remover lógica de `getSlotsForCell()`, `cellIsAvailable()`, `cellHasProf()`
4. Ajustar estilos de contenedor para que FlexibleCalendar ocupe el espacio del grid
5. Mantener mensaje de loading y error

**Definition of Done:**
- [ ] FlexibleCalendar renderiza actividades correctamente
- [ ] Grid responsive funciona como antes
- [ ] Click en actividad existe (aunque aún no navegue)
- [ ] Impresión aún funciona
- [ ] No hay drag & drop funcional aún (esperado)

**Tiempo estimado:** 2 horas
**Dependencias:** R2

---

### Microtarea R4: Implementar drag & drop de áreas a calendario flexible

**Objetivo:** Conectar el drag desde el panel lateral con el drop en FlexibleCalendar usando los hooks existentes.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Panel lateral (FlexibleSchedulePanel)
- FlexibleCalendar (solo agregar handlers)
- Sistema de guardado
- Navegación a asistencia

**Cambios:**
1. Importar `useCalendarDragDrop` hook
2. Remover `dragAreaRef`, `onDragStart`, `onDragOver`, `onDrop` legacy
3. Crear estado local `draggedArea: Area | null` para trackear área siendo arrastrada
4. Modificar FlexibleSchedulePanel:
   - `onDragStartArea` guarda el área en estado local
5. Crear handler `handleDropOnCalendar(dayOfWeek, startMinutes)`:
   - Validar que `selectedProfId` y `selectedRoomId` existan
   - Validar que no haya conflicto usando `detectActivityOverlap()`
   - Crear `FlexibleScheduleActivity` con:
     - `id`: generar único
     - `dayOfWeek`, `startTime`: desde drop
     - `durationMinutes`: 45 (default, editable después)
     - `courseId/courseName`: desde área arrastrada
     - `teacherId/teacherName`: desde profesor seleccionado
     - `classroomId/classroomName`: desde salón seleccionado
   - Agregar a estado local (preparar para guardado en R5)
6. Conectar handler con FlexibleCalendar via `onCreateActivity`

**Definition of Done:**
- [x] Arrastar área desde panel lateral funciona
- [x] Drop en calendario crea actividad visual
- [x] Conflictos son detectados y notificados
- [x] Actividad aparece en el calendario
- [x] Guardado aún no persiste (esperado, se resolverá en R5)

**Tiempo estimado:** 2 horas
**Dependencias:** R3
**Estado:** ✅ **COMPLETADO**

**Notas de implementación:**
- Creada función `handleCreateActivity(dayOfWeek, startMinutes)` que:
  - Valida selección de profesor y salón
  - Detecta conflictos usando `detectActivityOverlap()`
  - Genera ID único para la actividad
  - Crea `FlexibleScheduleActivity` con duración default de 45 min
  - Agrega actividad al estado local y llama `triggerSave()` legacy (temporal)
- Conectada función a FlexibleCalendar via prop `onCreateActivity`
- Mantiene compatibilidad temporal con sistema de guardado legacy

---

### Microtarea R5: Migrar guardado automático a modelo flexible

**Objetivo:** Reemplazar el guardado legacy por el sistema Redux de calendario flexible.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Panel lateral
- FlexibleCalendar
- Drag & drop
- Navegación a asistencia

**Cambios:**
1. Remover estado local `slots` y `setSlots`
2. Conectar con Redux:
   - Importar `useAppSelector`, `useAppDispatch`
   - Importar `selectAllActivities`, `loadFlexibleSchedule`, `saveActivity`, `removeActivity`
   - Usar `const activities = useAppSelector(selectAllActivities)`
3. Remover función `triggerSave()` legacy
4. En `handleDropOnCalendar`:
   - Usar `dispatch(saveActivity({ year, activity }))`
   - Manejar promise con `.unwrap()` para actualizar `saveStatus`
5. Crear `handleRemoveActivity(activityId)`:
   - Usar `dispatch(removeActivity({ year, activityId }))`
6. Pasar `onDelete` a CalendarActivity via FlexibleCalendar
7. Mantener debounce si es necesario (evaluable, Redux ya tiene thunks async)

**Definition of Done:**
- [x] Crear actividad persiste en Firebase (`flexible-schedules`)
- [x] Eliminar actividad funciona
- [x] Estados de guardado (saving, saved, error) funcionan
- [x] Redux DevTools muestra acciones correctamente
- [x] No hay doble guardado (legacy + flexible)

**Tiempo estimado:** 2 horas
**Dependencias:** R4
**Estado:** ✅ **COMPLETADO**

**Notas de implementación:**
- Agregados imports de Redux:
  - `useAppDispatch`, `useAppSelector` desde `store.ts`
  - `selectAllActivities`, `selectSaving`, `loadFlexibleSchedule`, `saveActivity`, `removeActivity` desde `flexibleSchedule.slice.ts`
- Reemplazado estado local `activities` por selector Redux `useAppSelector(selectAllActivities)`
- Actualizado `useEffect` de carga para usar `dispatch(loadFlexibleSchedule(year))`
- Eliminada función `triggerSave()` y el ref `saveTimeout`
- Actualizado `handleCreateActivity` para usar `dispatch(saveActivity({ year, activity }))`
- Creada función `handleRemoveActivity(activityId)` que usa `dispatch(removeActivity({ year, activityId }))`
- Conectado `handleRemoveActivity` a FlexibleCalendar via prop `onDelete`
- Sincronizado estado de guardado local con Redux usando `useEffect` que observa `isSaving`
- Eliminado botón manual "Guardar" (guardado es automático ahora)
- Limpieza de código legacy:
  - Eliminadas funciones de conversión `convertActivityToSlot` y `convertSlotToActivity`
  - Eliminado estado derivado `slots`
  - Eliminadas funciones legacy: `cellIsAvailable`, `cellHasProf`, `getSlotsForCell`, `isDimmed`, `activeTimeSlots`
  - Eliminadas funciones legacy: `onDrop`, `removeSlot`
  - Eliminados imports no usados: `fetchSchedule`, `saveSchedule`, `detectSlotConflict`, `ScheduleSlot`
- Archivo reducido de ~511 líneas a ~315 líneas (38% reducción)

---

### Microtarea R6: Adaptar navegación a asistencia para modelo flexible

**Objetivo:** Modificar el click en actividades para construir la URL de asistencia correctamente desde FlexibleScheduleActivity.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Panel lateral
- FlexibleCalendar
- Drag & drop
- Guardado

**Cambios:**
1. Crear función `handleNavigateToAttendance(activity: FlexibleScheduleActivity)`:
   ```typescript
   const handleNavigateToAttendance = (activity: FlexibleScheduleActivity) => {
     // Formato de URL: /asistencia/report/{salonId}/{profesorId}/{areaId}/{hora}
     // Usar activity.startTime como {hora}
     const url = `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/report/${activity.classroomId}/${activity.teacherId}/${activity.courseId}/${encodeURIComponent(activity.startTime)}`;
     navigate(url);
   };
   ```
2. Modificar FlexibleCalendar:
   - Pasar `onActivityClick={handleNavigateToAttendance}`
3. Modificar CalendarActivity (si es necesario):
   - Agregar botón de asistencia en hover (similar a ScheduleEditor línea 559-565)
   - Usar ícono `IconFileAnalytics`

**Definition of Done:**
- [ ] Click en actividad navega correctamente a asistencia
- [ ] Parámetros de URL son correctos (salonId, profesorId, areaId, hora)
- [ ] Módulo de asistencia recibe datos sin errores
- [ ] Botón de asistencia visible en hover

**Tiempo estimado:** 1.5 horas
**Dependencias:** R5

---

### Microtarea R7: Implementar filtros de vista para modelo flexible

**Objetivo:** Adaptar los filtros (all, profesor, salón) para funcionar con FlexibleScheduleActivity.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Panel lateral
- FlexibleCalendar
- Drag & drop
- Guardado
- Navegación a asistencia

**Cambios:**
1. Mantener estado `filterView` y selector (líneas 350-363)
2. Adaptar función `isDimmed()`:
   ```typescript
   function isDimmed(activity: FlexibleScheduleActivity): boolean {
     if (filterView === 'all') return false;
     if (filterView.startsWith('prof:')) return activity.teacherId !== filterView.slice(5);
     if (filterView.startsWith('room:')) return activity.classroomId !== filterView.slice(5);
     return false;
   }
   ```
3. Pasar función de filtro a FlexibleCalendar:
   - Opción A: Filtrar `activities` antes de pasarlas
   - Opción B: Agregar prop `activityFilter` a FlexibleCalendar
4. Actualizar `filterViewLabel` para mantener la descripción en impresión

**Definition of Done:**
- [ ] Filtro "Vista general" muestra todas las actividades
- [ ] Filtro por profesor opaca actividades de otros profesores
- [ ] Filtro por salón opaca actividades de otros salones
- [ ] Impresión refleja el filtro activo
- [ ] Tamaño de página cambia según filtro (letter/legal)

**Tiempo estimado:** 1.5 horas
**Dependencias:** R6

---

### Microtarea R8: Implementar botón de migración desde legacy

**Objetivo:** Agregar botón que permita migrar datos legacy a flexible si existen.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Todo lo demás

**Cambios:**
1. Importar `migrateFromLegacySchedule`, `needsMigration` desde `schedule.service.ts`
2. Agregar estado `showMigrationButton: boolean` y `isMigrating: boolean`
3. En `useEffect` de carga, verificar:
   ```typescript
   const needsMig = await needsMigration(year);
   setShowMigrationButton(needsMig);
   ```
4. Agregar botón en top bar (después de "Configurar Bloques"):
   ```tsx
   {showMigrationButton && (
     <button
       onClick={handleMigrate}
       className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600"
     >
       <IconDatabaseImport size={16} />
       Migrar desde Legacy
     </button>
   )}
   ```
5. Crear `handleMigrate`:
   - Mostrar confirmación
   - Llamar `migrateFromLegacySchedule(year)`
   - Recargar datos
   - Ocultar botón tras éxito

**Definition of Done:**
- [ ] Botón aparece solo si hay datos legacy sin migrar
- [ ] Click migra datos correctamente
- [ ] Botón desaparece tras migración exitosa
- [ ] Manejo de errores con mensaje al usuario
- [ ] No se pierde información en la migración

**Tiempo estimado:** 1.5 horas
**Dependencias:** R7

---

### Microtarea R9: Limpiar código legacy y optimizar imports

**Objetivo:** Remover código legacy no utilizado y optimizar imports para reducir tamaño del archivo.

**Archivos a modificar:**
1. `src/presentation/features/schedule/ScheduleEditor.tsx`

**Mantener intacto:**
- Todas las funcionalidades implementadas en R1-R8

**Cambios:**
1. Remover imports no utilizados:
   - `ScheduleSlot`, `detectSlotConflict`, `TIME_SLOTS` (si no se usan en migración)
   - `fetchSchedule`, `saveSchedule` legacy
   - `extractUniqueTimeSlots` (si se reemplazó)
2. Remover funciones no utilizadas:
   - `convertActivityToSlot()` (si ya no es necesaria)
   - `cellIsAvailable()`, `cellHasProf()`, `getSlotsForCell()` (reemplazadas por FlexibleCalendar)
3. Remover variables no utilizadas:
   - `dragAreaRef` (reemplazado por estado local)
   - `saveTimeout` (si Redux maneja el guardado)
4. Agregar comentarios JSDoc en funciones principales
5. Verificar que no queden `@ts-ignore` innecesarios

**Definition of Done:**
- [ ] No hay imports no utilizados (lint limpio)
- [ ] No hay funciones muertas
- [ ] Tamaño del archivo reducido (objetivo <450 líneas)
- [ ] Código documentado con JSDoc
- [ ] No hay regresión funcional

**Tiempo estimado:** 1 hora
**Dependencias:** R8

---

## Resumen de Microtareas

**Total:** 9 microtareas
**Tiempo estimado total:** 15.5 horas
**Archivos modificados:** 2 (ScheduleEditor.tsx + FlexibleSchedulePanel.tsx nuevo)

---

## Riesgos y Mitigaciones

### Riesgo 1: Romper Navegación a Asistencia
**Probabilidad:** Alta
**Impacto:** Crítico
**Mitigación:**
- R6 dedicada específicamente a esta integración
- Pruebas manuales exhaustivas del flujo completo
- Validar que el módulo de asistencia interpreta correctamente `startTime` como `hora`

### Riesgo 2: Pérdida de Datos en Migración
**Probabilidad:** Media
**Impacto:** Crítico
**Mitigación:**
- `migrateFromLegacySchedule()` NO elimina datos legacy (solo copia)
- R8 incluye validación pre-migración
- Botón de migración requiere confirmación explícita
- Log detallado de migración en consola

### Riesgo 3: Filtros de Vista Afectan Impresión
**Probabilidad:** Media
**Impacto:** Medio
**Mitigación:**
- R7 valida impresión para cada filtro
- Mantener lógica de cambio de tamaño de página
- Verificar que `filterViewLabel` se muestra correctamente

### Riesgo 4: Drag & Drop No Funciona en Todos los Browsers
**Probabilidad:** Baja
**Impacto:** Alto
**Mitigación:**
- `useCalendarDragDrop` ya está testeado en FlexibleCalendar
- Pruebas en Chrome, Firefox, Edge
- Fallback: permitir crear actividad via click + modal

### Riesgo 5: Conflictos con Sistema de Bloques Horarios
**Probabilidad:** Media
**Impacto:** Medio
**Mitigación:**
- R1 mantiene carga de `timeBlockConfig`
- Validar que bloques personalizados se reflejan en FlexibleCalendar
- El botón "Configurar Bloques" debe seguir funcionando

---

## Checklist de Validación Final

### Funcionalidades Core
- [ ] Cargar horario del año seleccionado
- [ ] Seleccionar profesor y salón desde panel lateral
- [ ] Arrastrar asignatura y soltar en calendario
- [ ] Crear actividad en el calendario
- [ ] Editar duración de actividad (resize)
- [ ] Mover actividad (drag & drop)
- [ ] Eliminar actividad
- [ ] Guardado automático en Firebase

### Integraciones Críticas
- [ ] Navegación a asistencia funciona correctamente
- [ ] Click en actividad navega a URL correcta
- [ ] Módulo de asistencia recibe parámetros válidos
- [ ] Sistema de permisos funciona (solo Coordinador)

### Filtros y Vistas
- [ ] Vista general muestra todas las actividades
- [ ] Filtro por profesor funciona
- [ ] Filtro por salón funciona
- [ ] Filtros afectan impresión correctamente

### Impresión
- [ ] Header de impresión se muestra
- [ ] Tamaño de página cambia según filtro
- [ ] Actividades son legibles
- [ ] Controles se ocultan en impresión

### Sistema de Conflictos
- [ ] Detecta solapamiento de profesor
- [ ] Detecta solapamiento de salón
- [ ] Muestra mensaje de error descriptivo
- [ ] Previene conflictos (o permite con advertencia)

### Migración
- [ ] Botón de migración aparece si hay datos legacy
- [ ] Migración transfiere todos los slots
- [ ] Datos legacy se preservan como respaldo
- [ ] Botón desaparece tras migración exitosa

### Rendimiento
- [ ] Calendario carga rápido (<1s)
- [ ] Drag & drop es fluido (no lag)
- [ ] Guardado no bloquea UI
- [ ] Redux DevTools muestra estado correctamente

---

## Próximos Pasos

1. **Revisar este plan** con el equipo
2. **Comenzar con R1** (Adaptar carga de datos)
3. **Ejecutar una microtarea a la vez** siguiendo el orden
4. **Validar cada microtarea** antes de continuar
5. **Testing manual exhaustivo** tras completar R6 (navegación a asistencia)
6. **Validación final** con el checklist completo
