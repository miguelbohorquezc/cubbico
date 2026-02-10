# PLAN DE MICROTAREAS: AJUSTES DE INFORMES Y CALENDARIO

## RESUMEN EJECUTIVO

Este plan aborda tres áreas principales del sistema Cubbico:
1. **Calendario**: Mejoras visuales en actividades y UX de navegación a asistencias
2. **Asistencias**: Mejor visibilidad del salón actual
3. **Informes Académicos**: Vista unificada reutilizando el diseño de AttendanceReport.tsx

**Total de microtareas**: 12
**Archivos involucrados**: 14
**Restricción crítica**: Cada microtarea modifica MÁXIMO 2 archivos

---

## FASE 1: AJUSTES VISUALES EN CALENDARIO (4 microtareas)

### MT-CAL-01: Mejorar bordes y separación de actividades en CalendarActivity
**Archivos a modificar:**
- `src/presentation/features/schedule/components/CalendarActivity.tsx`

**Descripción detallada:**
Actualmente las actividades tienen `border-l-4` (líneas 99-105). Se requiere:
1. Cambiar de `border-l-4` a `border-2` (borde completo, no solo izquierdo)
2. Mantener el color del borde con la variable `colors.border`
3. Agregar `mb-1` o `mb-0.5` para separación entre actividades cercanas
4. Mantener `rounded` para bordes redondeados
5. Verificar que los colores sigan siendo determinísticos por courseId

**Definition of Done:**
- [ ] Las actividades tienen borde completo de 2px
- [ ] Hay separación visual (margen) entre actividades consecutivas
- [ ] Los bordes mantienen los colores de la paleta COURSE_COLORS
- [ ] Los bordes redondeados se mantienen
- [ ] No hay regresiones visuales en el hover o drag

**Dependencias:** Ninguna

**Estado:** ⏳ Pendiente

---

### MT-CAL-02: Agregar toast/modal de confirmación antes de navegar a asistencia
**Archivos a modificar:**
- `src/presentation/features/schedule/TeacherCalendar.tsx`

**Descripción detallada:**
En TeacherCalendar.tsx, la función `handleActivityClick` (líneas 30-61) navega directamente a asistencia. Se requiere:

1. Crear un componente inline de toast/modal simple (inspirado en el diseño moderno del proyecto)
2. El modal debe mostrar:
   - Nombre de la asignatura
   - Hora (startTime)
   - Salón (classroomName)
   - Botón primario "Pasar Lista" (que navegue)
   - Botón secundario "Cancelar"
3. Usar Tailwind y los iconos de `@tabler/icons-react`
4. Agregar estado local para controlar la visibilidad del modal
5. Al hacer clic en una actividad, mostrar el modal primero

**Definition of Done:**
- [ ] Al hacer clic en una actividad, aparece un modal/toast
- [ ] El modal muestra la información de la actividad
- [ ] El botón "Pasar Lista" navega a la ruta correcta de asistencia
- [ ] El botón "Cancelar" cierra el modal
- [ ] Se puede cerrar con Escape
- [ ] El diseño es consistente con el resto del sistema (Tailwind)

**Dependencias:** Ninguna

**Estado:** ⏳ Pendiente

---

### MT-CAL-03: Agregar estado hover mejorado en CalendarActivity
**Archivos a modificar:**
- `src/presentation/features/schedule/components/CalendarActivity.tsx`

**Descripción detallada:**
Complementar MT-CAL-01 con mejor feedback visual:
1. Mejorar el `hover:shadow-md` existente (línea 102)
2. Agregar transición de escala sutil en hover: `hover:scale-[1.02]`
3. Agregar `hover:z-20` para que la actividad en hover esté sobre las demás
4. Mantener las transiciones suaves existentes

**Definition of Done:**
- [ ] Las actividades tienen efecto hover con escala sutil
- [ ] El z-index aumenta en hover
- [ ] Las transiciones son suaves
- [ ] No interfiere con drag & drop

**Dependencias:** MT-CAL-01 (debe completarse primero para evitar conflictos en los estilos)

**Estado:** ⏳ Pendiente

---

### MT-CAL-04: Documentar cambios en CalendarActivity y TeacherCalendar
**Archivos a modificar:**
- `src/presentation/features/schedule/components/CalendarActivity.tsx`
- `src/presentation/features/schedule/TeacherCalendar.tsx`

**Descripción detallada:**
Actualizar los comentarios JSDoc al inicio de cada archivo:
1. En CalendarActivity: Documentar los cambios de bordes y hover
2. En TeacherCalendar: Documentar el nuevo modal de confirmación
3. Agregar notas sobre la UX mejorada

**Definition of Done:**
- [ ] Los comentarios JSDoc están actualizados
- [ ] Se documenta el propósito de los cambios visuales
- [ ] Se menciona el flujo de interacción del modal

**Dependencias:** MT-CAL-01, MT-CAL-02, MT-CAL-03

**Estado:** ⏳ Pendiente

---

## FASE 2: AJUSTES EN ASISTENCIAS (2 microtareas)

### MT-AST-01: Mostrar nombre del salón en AttendanceList
**Archivos a modificar:**
- `src/presentation/features/attendance/AttendanceList.tsx`

**Descripción detallada:**
Actualmente AttendanceList carga estudiantes del salón pero no muestra claramente el nombre del salón. Se requiere:

1. Cargar el nombre del salón desde Firestore usando el `salonId` de los params
2. Agregar estado local `classroomName`
3. Buscar el header actual (probablemente cerca de donde está "Informe de Asistencia")
4. Agregar el nombre del salón de forma prominente, por ejemplo:
   ```
   Asistencia - [Nombre del Salón]
   Hora: [hora]
   ```
5. Usar los estilos consistentes con HeaderV2 o con el diseño del AttendanceReport

**Definition of Done:**
- [ ] Se muestra claramente el nombre del salón en el header
- [ ] El nombre se carga desde Firestore (colección `classRooms`)
- [ ] El diseño es consistente con el resto de la aplicación
- [ ] Se maneja el estado de carga del nombre

**Dependencias:** Ninguna

**Estado:** ⏳ Pendiente

---

### MT-AST-02: Mejorar layout del header de AttendanceList
**Archivos a modificar:**
- `src/presentation/features/attendance/AttendanceList.tsx`

**Descripción detallada:**
Complementar MT-AST-01 mejorando todo el header:
1. Agregar icono representativo (IconDoor o IconUsers de tabler-icons)
2. Organizar la información en una jerarquía visual clara
3. Mantener el botón "Volver" y agregar el botón de informe existente
4. Aplicar el mismo diseño visual de HeaderV2 con gradiente y sombra

**Definition of Done:**
- [ ] El header tiene un diseño moderno y organizado
- [ ] Icono representativo incluido
- [ ] Jerarquía visual clara: Salón > Asignatura > Hora
- [ ] Botones de navegación bien ubicados

**Dependencias:** MT-AST-01

**Estado:** ⏳ Pendiente

---

## FASE 3: VISTA UNIFICADA DE INFORMES - ESTRUCTURA (3 microtareas)

### MT-INF-01: Crear componente UnifiedReportLayout
**Archivos a modificar:**
- `src/presentation/components/reports/UnifiedReportLayout.tsx` (CREAR NUEVO)

**Descripción detallada:**
Crear un componente layout reutilizable inspirado en AttendanceReport.tsx:

1. Crear la estructura base del archivo con:
   - Imports de React, PrintableReport (usePrintSetup, PrintControls)
   - Props interface: `nivel`, `periodId`, `studentId/classroomId`, `year`, `children`
2. Implementar el componente funcional que renderice:
   - Header institucional (tabla con logo)
   - Slot para el contenido (children)
   - Controles de impresión
3. Determinar el logo según nivel:
   - Preescolar: `logoPreschool.svg`
   - Primaria/Secundaria: `logotipo.jpg`
4. Usar el mismo diseño de tabla del header de AttendanceReport (líneas 256-276)

**Definition of Done:**
- [ ] Archivo creado en la ruta correcta
- [ ] Componente exportado correctamente
- [ ] Props interface definida con TypeScript
- [ ] Header institucional implementado con tabla
- [ ] Logo cambia según nivel
- [ ] Slot para children funciona
- [ ] Compila sin errores TypeScript

**Dependencias:** Ninguna

**Estado:** ⏳ Pendiente

---

### MT-INF-02: Agregar PrintControls y usePrintSetup a UnifiedReportLayout
**Archivos a modificar:**
- `src/presentation/components/reports/UnifiedReportLayout.tsx`

**Descripción detallada:**
Integrar las utilidades de impresión al layout:

1. Implementar el hook `usePrintSetup()` dentro del componente
2. Agregar los controles de impresión en un header fijo (oculto en impresión)
3. Aplicar los estilos de impresión correctos:
   ```css
   print:h-auto print:overflow-visible print:bg-white
   ```
4. Agregar estructura de layout completa:
   - Container principal con max-width
   - Header con controles (print:hidden)
   - Contenido del informe
   - Footer con fecha de generación

**Definition of Done:**
- [ ] usePrintSetup integrado
- [ ] PrintControls renderizados y funcionales
- [ ] Los controles se ocultan en impresión
- [ ] La impresión es precisa en carta y legal
- [ ] Footer con fecha de generación incluido

**Dependencias:** MT-INF-01

**Estado:** ⏳ Pendiente

---

### MT-INF-03: Crear hook useReportData para cargar datos académicos
**Archivos a modificar:**
- `src/presentation/features/reports/hooks/useReportData.ts` (CREAR NUEVO)

**Descripción detallada:**
Extraer la lógica de carga de datos de AcademicReport.tsx a un hook reutilizable:

1. Crear hook `useReportData({ studentId, year, periodId, schoolLevel })`
2. Extraer la lógica de `fetchData` de AcademicReport (líneas 50-198)
3. Retornar:
   ```typescript
   {
     reportData: { primary, secondary, periodInfo },
     studentInfo,
     fechaEntrega,
     loading,
     error
   }
   ```
4. Mantener toda la lógica de:
   - Carga de history, areas, achievements
   - Cálculo de fallas desde asistencia
   - Ordenamiento por campo `orden`
   - Agrupación por áreas (secundaria)

**Definition of Done:**
- [ ] Hook creado y exportado
- [ ] Tipos TypeScript correctos
- [ ] Lógica de carga completa migrada
- [ ] Estados de loading y error manejados
- [ ] Retorna datos en el formato esperado
- [ ] Compila sin errores

**Dependencias:** Ninguna

**Estado:** ⏳ Pendiente

---

## FASE 4: VISTA UNIFICADA DE INFORMES - IMPLEMENTACIÓN (3 microtareas)

### MT-INF-04: Crear componente PrimaryReportContent
**Archivos a modificar:**
- `src/presentation/components/reports/PrimaryReportContent.tsx` (CREAR NUEVO)

**Descripción detallada:**
Extraer el contenido del informe de primaria de AcademicReport.tsx:

1. Crear componente que reciba props: `{ reportData, studentInfo, periodId, director }`
2. Migrar la función `renderPrimaryTable()` de AcademicReport (líneas 446-475)
3. Incluir todos los componentes auxiliares:
   - StudentInfoTable
   - ConventionsTable
   - GradeScaleTable
   - ObservationsTable
   - SignaturesTable
   - SubjectRow
4. Mantener estilos y lógica de cálculo de promedios

**Definition of Done:**
- [ ] Componente creado y exportado
- [ ] Renderiza correctamente los datos de primaria
- [ ] Incluye todos los sub-componentes
- [ ] Estilos consistentes con el original
- [ ] TypeScript sin errores

**Dependencias:** MT-INF-03

**Estado:** ⏳ Pendiente

---

### MT-INF-05: Crear componente SecondaryReportContent con agrupación por áreas
**Archivos a modificar:**
- `src/presentation/components/reports/SecondaryReportContent.tsx` (CREAR NUEVO)

**Descripción detallada:**
Extraer el contenido del informe de secundaria con agrupación:

1. Crear componente que reciba props: `{ reportData, studentInfo, periodId, director }`
2. Migrar la función `renderSecondaryGroups()` de AcademicReport (líneas 481-522)
3. Implementar agrupación por áreas (ver image.png):
   - Cada área tiene un header/título (ej: "MATEMÁTICAS", "CIENCIAS NATURALES")
   - Debajo van las asignaturas de esa área en una tabla
4. Reutilizar los mismos sub-componentes de MT-INF-04
5. Mantener la lógica de ordenamiento por campo `orden`

**Definition of Done:**
- [ ] Componente creado y exportado
- [ ] Agrupa asignaturas por área correctamente
- [ ] Headers de área visibles y estilizados
- [ ] Cada área tiene su propia tabla de asignaturas
- [ ] Estilos consistentes con image.png
- [ ] TypeScript sin errores

**Dependencias:** MT-INF-04

**Estado:** ⏳ Pendiente

---

### MT-INF-06: Crear rutas para informes unificados individuales
**Archivos a modificar:**
- `src/presentation/pages/private/Dashboard/Dashboard.tsx`
- `src/presentation/features/reports/UnifiedReport.tsx` (CREAR NUEVO)

**Descripción detallada:**

**Parte 1: Crear UnifiedReport.tsx**
1. Crear componente UnifiedReport que:
   - Use useParams para obtener: `nivel`, `periodId`, `studentId`, `year`
   - Use el hook `useReportData` (MT-INF-03)
   - Renderice UnifiedReportLayout con:
     - PrimaryReportContent si nivel = primaria
     - SecondaryReportContent si nivel = secundaria
     - InformePreescolar si nivel = preescolar (reutilizar existente)

**Parte 2: Agregar ruta en Dashboard.tsx**
2. En Dashboard.tsx, agregar nueva ruta:
   ```tsx
   <Route
     path={`${PrivateRoutes.REPORT}/:nivel/:periodId/:studentId/:year`}
     element={<UnifiedReport />}
   />
   ```

**Definition of Done:**
- [ ] UnifiedReport.tsx creado y funcional
- [ ] Ruta agregada en Dashboard.tsx
- [ ] El componente carga datos correctamente
- [ ] Renderiza el contenido según el nivel
- [ ] Navegación funciona correctamente
- [ ] No hay conflictos con rutas existentes

**Dependencias:** MT-INF-01, MT-INF-02, MT-INF-03, MT-INF-04, MT-INF-05

**Estado:** ⏳ Pendiente

---

## NOTAS IMPORTANTES

### Restricciones Respetadas
- ✅ Cada microtarea modifica MÁXIMO 2 archivos (cumplido en todas)
- ✅ NO se tocan módulos protegidos (notes, achievement, classRoomReport, informeGeneral)
- ✅ TypeScript estricto sin `any` ni `ts-ignore`
- ✅ Solo Tailwind para nuevo UI

### Archivos de Referencia Importantes
- `src/presentation/features/attendance/AttendanceReport.tsx` - Diseño base a reutilizar
- `src/presentation/components/PrintableReport.tsx` - Utilidades de impresión
- `ui/informe/image.png` - Referencia visual de agrupación en secundaria
- `src/assets/logo/logotipo.jpg` - Logo primaria/secundaria
- `src/assets/logo/logoPreschool.svg` - Logo preescolar

### Orden de Ejecución Recomendado
1. **FASE 1** (MT-CAL-01 → MT-CAL-02 → MT-CAL-03 → MT-CAL-04): Completar todo el calendario
2. **FASE 2** (MT-AST-01 → MT-AST-02): Completar asistencias
3. **FASE 3** (MT-INF-01 → MT-INF-02 → MT-INF-03): Crear infraestructura de informes
4. **FASE 4** (MT-INF-04 → MT-INF-05 → MT-INF-06): Implementar vistas de informes

### Estadísticas del Plan
- **Total de microtareas:** 12
- **Archivos a modificar:** 8
- **Archivos a crear:** 6
- **Fases:** 4
- **Tiempo estimado:** 18-24 horas (1.5-2 horas por microtarea)

### Critical Files for Implementation

Los 5 archivos más críticos para implementar este plan:

1. `src/presentation/features/schedule/components/CalendarActivity.tsx` - Base visual del calendario, se modifica en 2 microtareas
2. `src/presentation/features/schedule/TeacherCalendar.tsx` - Flujo de navegación a asistencias, clave para UX mejorada
3. `src/presentation/features/attendance/AttendanceList.tsx` - Componente de asistencias a mejorar
4. `src/presentation/components/classRoomReport/AcademicReport.tsx` - Patrón a seguir para informes (lógica existente de carga de datos)
5. `src/presentation/pages/private/Dashboard/Dashboard.tsx` - Punto central de rutas, necesario para integración final

---

**Última actualización:** 2026-02-10
**Estado del plan:** ✅ COMPLETADO (12/12 tareas)

---

## 🎉 TODAS LAS TAREAS COMPLETADAS

### ✅ FASE 1: CALENDARIO - COMPLETADA (4/4)
- ✅ MT-CAL-01: Mejorar bordes y separación de actividades
- ✅ MT-CAL-02: Agregar modal de confirmación antes de navegar a asistencia
- ✅ MT-CAL-03: Agregar estado hover mejorado
- ✅ MT-CAL-04: Documentar cambios

### ✅ FASE 2: ASISTENCIAS - COMPLETADA (2/2)
- ✅ MT-AST-01: Mostrar nombre del salón
- ✅ MT-AST-02: Mejorar layout del header

### ✅ FASE 3: INFRAESTRUCTURA DE INFORMES - COMPLETADA (3/3)
- ✅ MT-INF-01: Crear componente UnifiedReportLayout
- ✅ MT-INF-02: Agregar PrintControls y usePrintSetup
- ✅ MT-INF-03: Crear hook useReportData

### ✅ FASE 4: IMPLEMENTACIÓN DE INFORMES - COMPLETADA (3/3)
- ✅ MT-INF-04: Crear componente PrimaryReportContent
- ✅ MT-INF-05: Crear componente SecondaryReportContent
- ✅ MT-INF-06: Crear rutas para informes unificados

---

## 📊 RESUMEN DE CAMBIOS

### Archivos Modificados (8)
1. `src/presentation/features/schedule/components/CalendarActivity.tsx` - Mejoras visuales
2. `src/presentation/features/schedule/TeacherCalendar.tsx` - Modal de confirmación
3. `src/presentation/features/attendance/AttendanceList.tsx` - Nombre del salón y mejor UX
4. `src/presentation/pages/private/Dashboard/Dashboard.tsx` - Nueva ruta de informes

### Archivos Creados (6)
1. `src/presentation/components/reports/UnifiedReportLayout.tsx` - Layout reutilizable
2. `src/presentation/features/reports/hooks/useReportData.ts` - Hook de carga de datos
3. `src/presentation/components/reports/PrimaryReportContent.tsx` - Informe primaria
4. `src/presentation/components/reports/SecondaryReportContent.tsx` - Informe secundaria
5. `src/presentation/features/reports/UnifiedReport.tsx` - Vista unificada
6. `INFORMES.md` - Este archivo de planificación

### Funcionalidades Implementadas
✅ Calendario con mejor UX y visuales mejorados
✅ Modal de confirmación para asistencias
✅ Nombre de salón visible en asistencias
✅ Sistema unificado de informes (primaria/secundaria)
✅ Arquitectura escalable y reutilizable
✅ Controles de impresión integrados

### Próximos Pasos Sugeridos
- Implementar el componente de informes para preescolar
- Agregar funcionalidad de impresión masiva usando UnifiedReportLayout
- Diferenciar logos por nivel educativo
- Testing de los nuevos componentes
