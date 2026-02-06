# PLAN DE MICROTAREAS - BUGS Y MEJORAS SIA COLINA

**Fecha de Creación:** 2026-02-06
**Estado:** En Progreso
**Metodología:** Una microtarea a la vez, máximo 2 archivos por tarea

---

## RESUMEN EJECUTIVO

- **Total de Microtareas:** 58
- **Bugs Críticos:** 11
- **Mejoras de Prioridad Alta:** 15
- **Mejoras de Prioridad Media:** 22
- **Mejoras de Prioridad Baja:** 10
- **Tiempo Estimado Total:** 85-115 horas
- **Fases:** 8 fases lógicas

---

## FASE 1: BUGS CRÍTICOS - GESTIÓN DE NOTAS Y LOGROS (Prioridad Máxima)

### MT-001: Corregir envío de notas a Firebase ✅ EN PROGRESO
- **Título:** Fix envío batch de notas a Firestore
- **Objetivo:** Solucionar el bug que impide que las notas se guarden correctamente en Firebase
- **Archivos a modificar:**
  1. `src/presentation/features/notesManager/useConstruirYEnviarLote.ts`
  2. `src/infrastructure/student.service.ts`
- **Tiempo estimado:** 2 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Las notas se guardan exitosamente en Firestore
  - Se mantiene el historial de notas por año/periodo/área
  - El mensaje de confirmación se muestra correctamente
  - Se valida que bulkSaveStudents() ejecuta correctamente
  - Tests manuales confirman persistencia de datos

### MT-002: Implementar carga automática de logros
- **Título:** Auto-cargar logros al seleccionar salón y área
- **Objetivo:** Los logros deben cargarse automáticamente sin necesidad de abrir el modal
- **Archivos a modificar:**
  1. `src/presentation/features/teacher/TeacherAchivement.tsx`
  2. `src/app/store/states/teacher.slice.ts`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Los logros se cargan automáticamente al montar el componente
  - Se actualiza el estado de Redux cuando cambian los parámetros
  - El indicador de carga se muestra correctamente
  - No es necesario abrir modal para ver logros
  - Tests confirman que useEffect dispara la carga

### MT-003: Validación de número de identidad en matrícula
- **Título:** Prevenir duplicados por documento de identidad
- **Objetivo:** Validar que el número de documento no exista antes de matricular
- **Archivos a modificar:**
  1. `src/infrastructure/student.service.ts`
  2. `src/presentation/features/aspirantes-admin/components/EnrollmentsTable.tsx`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Función de validación verifica existencia del documento en Firestore
  - Modal muestra error claro si el documento ya existe
  - Se previene la creación de estudiantes duplicados
  - Se mantiene UX fluida sin bloqueos innecesarios
  - Tests cubren casos de duplicados y no duplicados

### MT-004: Corregir bug de promoción en informes históricos
- **Título:** Preservar grado histórico en informes anteriores
- **Objetivo:** Al promover estudiantes, los informes antiguos deben mantener el grado original
- **Archivos a modificar:**
  1. `src/infrastructure/promotion.service.ts`
  2. `src/presentation/components/classRoomReport/AcademicReport.tsx`
- **Tiempo estimado:** 2 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - La estructura de datos preserva el grado por año escolar
  - Los informes históricos muestran el grado correcto del año respectivo
  - La promoción actualiza solo el año actual
  - Tests verifican que promoción no modifica historial
  - Documentación actualizada sobre estructura de datos

---

## FASE 2: BUGS CRÍTICOS - INFORMES E IMPRESIÓN

### MT-005: Optimizar informe final - reducir tamaño de textos
- **Título:** Ajustar tipografía del informe final para mejor legibilidad
- **Objetivo:** Reducir el tamaño de fuentes en el informe final para que quepa mejor en página
- **Archivos a modificar:**
  1. `src/presentation/components/PrintableReport.tsx`
  2. `src/presentation/components/informeGeneral/InformePorSalon.tsx`
- **Tiempo estimado:** 1 hora
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Tamaños de fuente optimizados (reducidos 10-15%)
  - El informe completo cabe en una página sin truncarse
  - Mantiene legibilidad profesional
  - Compatible con tamaño carta y legal
  - Pruebas de impresión en ambos tamaños

### MT-006: Mostrar nombre del director de grupo en informe final
- **Título:** Reemplazar UID por displayName del director
- **Objetivo:** En el informe final debe aparecer el nombre legible del director, no el UID
- **Archivos a modificar:**
  1. `src/presentation/components/informeGeneral/InformePorSalon.tsx`
  2. `src/infrastructure/user.service.ts`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Se consulta getUserByUid() para obtener displayName
  - El informe muestra nombre completo del director
  - Se maneja caso cuando no existe director asignado
  - Loading state mientras se obtiene el nombre
  - Tests confirman resolución correcta del nombre

### MT-007: Corregir colores en informe final (solo promedio general)
- **Título:** Aplicar color solo al promedio general del informe
- **Objetivo:** Los colores de rendimiento deben aparecer únicamente en el promedio general
- **Archivos a modificar:**
  1. `src/presentation/components/informeGeneral/InformePorSalon.tsx`
- **Tiempo estimado:** 0.5 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** MT-005
- **Definition of Done:**
  - Colores solo en promedio general (rojo/amarillo/verde/azul según escala)
  - Promedios por asignatura sin color de fondo
  - Consistente con escala de valoración institucional
  - Impresión conserva colores correctamente
  - CSS print optimizado

### MT-008: Confirmar orden de asignaturas en informes
- **Título:** Validar que orden de áreas se respeta en informes
- **Objetivo:** Los informes deben mostrar las asignaturas en el orden configurado
- **Archivos a modificar:**
  1. `src/presentation/components/classRoomReport/AcademicReport.tsx`
  2. `src/presentation/features/reports/BulkReportPrinter.tsx`
- **Tiempo estimado:** 1 hora
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Asignaturas se ordenan por campo "orden" de la colección areas
  - Ordenamiento consistente en todos los tipos de informes
  - Se maneja caso de áreas sin orden definido
  - Tests confirman ordenamiento correcto
  - Documentación de lógica de ordenamiento

### MT-009: Sincronizar estilos de impresión masiva con informes individuales
- **Título:** Unificar estilos entre informes masivos e individuales
- **Objetivo:** Los informes del BulkReportPrinter deben tener exactamente los mismos estilos que los individuales
- **Archivos a modificar:**
  1. `src/presentation/features/reports/BulkReportPrinter.tsx`
  2. `src/presentation/components/classRoomReport/AcademicReport.tsx`
- **Tiempo estimado:** 2 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** MT-005, MT-006, MT-007
- **Definition of Done:**
  - Estilos idénticos en impresión masiva e individual
  - Tipografía, colores, espaciados consistentes
  - Page breaks correctos entre estudiantes
  - Tamaños carta y legal funcionan correctamente
  - Tests de regresión visual

### MT-010: Crear informe de secundaria agrupado por áreas
- **Título:** Implementar formato de informe específico para secundaria
- **Objetivo:** El informe de secundaria debe agrupar asignaturas por áreas académicas
- **Archivos a modificar:**
  1. `src/presentation/features/reports/BulkReportPrinter.tsx`
  2. `src/presentation/components/classRoomReport/AcademicReport.tsx`
- **Tiempo estimado:** 2.5 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** MT-008
- **Definition of Done:**
  - Lógica de agrupación por campo "area" de asignaturas
  - Encabezado de área visible antes de las asignaturas
  - Respeta orden configurado de asignaturas dentro de cada área
  - Compatible con impresión masiva
  - Tests confirman agrupación correcta

### MT-011: Generar reporte de asistencia por salón y periodo
- **Título:** Crear reporte consolidado de asistencia
- **Objetivo:** Generar documento imprimible con todas las fallas de un salón en periodo específico
- **Archivos a modificar:**
  1. `src/infrastructure/attendance.service.ts`
  2. `src/presentation/features/attendance/AttendanceReport.tsx` (crear si no existe)
- **Tiempo estimado:** 2.5 horas
- **Prioridad:** CRÍTICO
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Consulta consolida fallas de todos los docentes del salón
  - Formato hoja legal con encabezado institucional
  - Incluye espacio para firma de coordinación
  - Filtra por periodo específico
  - Exportable a PDF e imprimible

---

## FASE 3: SISTEMA DE TOAST UNIFICADO Y MEJORAS UX/UI BÁSICAS

### MT-012: Crear sistema de Toast unificado
- **Título:** Implementar componente Toast global
- **Objetivo:** Reemplazar alerts con sistema de notificaciones moderno
- **Archivos a modificar:**
  1. Crear: `src/presentation/components/toast/Toast.tsx`
  2. Crear: `src/presentation/components/toast/useToast.ts`
- **Tiempo estimado:** 2 horas
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Componente Toast con variantes: success, error, warning, info
  - Hook useToast para invocación global
  - Auto-dismiss configurable
  - Animaciones suaves de entrada/salida
  - Stacking de múltiples toasts
  - Documentación de uso

### MT-013: Reemplazar alerts en módulo de notas con Toast
- **Título:** Migrar alerts de GradeManager a Toast
- **Objetivo:** Usar nuevo sistema de Toast en lugar de alert() en gestión de notas
- **Archivos a modificar:**
  1. `src/presentation/features/notesManager/useConstruirYEnviarLote.ts`
  2. `src/presentation/features/notesManager/GradeManager.tsx`
- **Tiempo estimado:** 1 hora
- **Prioridad:** ALTA
- **Dependencias:** MT-012
- **Definition of Done:**
  - Todos los alert() reemplazados por toast
  - Mensajes claros y descriptivos
  - Success toast al guardar correctamente
  - Error toast con detalles del problema
  - UX mejorada sin bloqueos

### MT-014: Cambiar icono y capitalizar letra en TeacherClassrooms
- **Título:** Mejorar UI de acciones en lista de salones
- **Objetivo:** Actualizar icono de acciones y capitalizar primera letra
- **Archivos a modificar:**
  1. `src/presentation/features/teacher/TeacherClassrooms.tsx`
- **Tiempo estimado:** 0.5 horas
- **Prioridad:** MEDIA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Icono más intuitivo (ej: IconChevronRight en lugar de libro)
  - Primera letra del nombre del salón en mayúscula
  - Hover state mejorado
  - Accesibilidad (aria-labels) actualizada
  - Consistente con diseño Academix

### MT-015: Remover input de búsqueda en HeaderV2 para docentes
- **Título:** Ocultar SearchBar en HeaderV2 cuando role = 'Docente'
- **Objetivo:** Los docentes no necesitan búsqueda global en el header
- **Archivos a modificar:**
  1. `src/presentation/components/headerV2/HeaderV2.tsx`
- **Tiempo estimado:** 0.5 horas
- **Prioridad:** MEDIA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - SearchBar solo visible si role !== 'Docente'
  - Lógica basada en estado de Redux user.role
  - Layout responsivo se ajusta correctamente sin SearchBar
  - Tests confirman visibilidad condicional
  - Documentación actualizada

### MT-016: Mejorar modal de alerta al ingresar a salón
- **Título:** Confirmar ingreso al salón seleccionado
- **Objetivo:** Modal de confirmación antes de navegar a vista de asignaturas
- **Archivos a modificar:**
  1. `src/presentation/features/teacher/TeacherClassrooms.tsx`
- **Tiempo estimado:** 1 hora
- **Prioridad:** MEDIA
- **Dependencias:** MT-012
- **Definition of Done:**
  - Modal de confirmación con info del salón
  - Botones: "Cancelar" y "Ingresar"
  - Incluye nombre del salón y nivel
  - Animación suave
  - Opción "No volver a mostrar" (localStorage)

---

## FASE 4: MEJORAS DE UI MODERNA Y CONSISTENCIA VISUAL

### MT-017: Modernizar card de reporte de promedios
- **Título:** Rediseñar card de reporte con botón de vista previa
- **Objetivo:** Card más moderno con botón de preview estilo Academix
- **Archivos a modificar:**
  1. `src/presentation/components/classRoomReport/AcademicReport.tsx`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Card con sombra sutil, bordes redondeados
  - Botón "Vista Previa" con icono IconEye
  - Hover states modernos
  - Gradientes sutiles en header
  - Responsive design
  - Accesibilidad mejorada

### MT-018: Aplicar colores dinámicos a promedios en tabla
- **Título:** Colorear celdas de promedio según rango de desempeño
- **Objetivo:** Aplicar esquema de colores: rojo (bajo), amarillo (básico), verde (alto), azul (superior)
- **Archivos a modificar:**
  1. `src/presentation/features/notesManager/GradeManager.tsx`
  2. `src/presentation/components/classRoomReport/AcademicReport.tsx`
- **Tiempo estimado:** 1 hora
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Función getGradeColor(average) con rangos definidos
  - Colores: bajo < 3.0 (rojo), básico 3.0-3.9 (amarillo), alto 4.0-4.5 (verde), superior >= 4.6 (azul)
  - Aplicado en tablas de GradeManager y AcademicReport
  - print-color-adjust: exact para impresión
  - Tests de rangos de colores

### MT-019: Unificar fondo grisáceo en layouts
- **Título:** Aplicar bg-gray-50 consistente en todas las vistas
- **Objetivo:** Fondo grisáceo uniforme para mejor contraste con cards blancos
- **Archivos a modificar:**
  1. `src/presentation/pages/private/Dashboard.tsx`
  2. `src/presentation/components/layout/MainLayout.tsx` (si existe)
- **Tiempo estimado:** 1 hora
- **Prioridad:** MEDIA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - bg-gray-50 en contenedor principal de todas las vistas
  - Cards con bg-white destacan correctamente
  - Consistencia visual en toda la app
  - No afecta módulos protegidos
  - Tests visuales de contraste

### MT-020: Modernizar colores y UI del modal de promoción
- **Título:** Actualizar PromotionModal con estilo Academix
- **Objetivo:** Modal de promoción con colores, gradientes y UX modernos
- **Archivos a modificar:**
  1. `src/presentation/features/students/components/PromotionModal.tsx`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Header con gradiente azul moderno
  - Botones con hover states suaves
  - Badges de estado con colores actualizados
  - Loading spinners elegantes
  - Transiciones fluidas
  - Responsive mejorado

### MT-021: Mejorar UX/UI de fechas de entrega
- **Título:** Modernizar selector y visualización de fechas de entrega
- **Objetivo:** Interfaz más intuitiva para configurar fechas límite de carga de notas
- **Archivos a modificar:**
  1. `src/presentation/features/settings/PeriodConfigManager.tsx`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Date picker moderno (react-datepicker o similar)
  - Visualización clara de fechas configuradas
  - Indicadores visuales de fechas vencidas
  - Validación de fechas lógicas
  - Toast de confirmación al guardar

### MT-022: Implementar notificaciones de fechas de entrega
- **Título:** Sistema de alertas para docentes sobre fechas límite
- **Objetivo:** Notificar a docentes cuando se acerque la fecha de entrega de notas
- **Archivos a modificar:**
  1. `src/presentation/components/headerV2/HeaderV2.tsx`
  2. `src/infrastructure/periodConfig.service.ts` (extender)
- **Tiempo estimado:** 2 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-021
- **Definition of Done:**
  - Badge en NotificationButton con count de alertas
  - Panel dropdown con lista de fechas próximas
  - Lógica calcula días restantes
  - Notificaciones 7 días antes, 3 días antes, día de
  - Persistencia de notificaciones vistas

---

## FASE 5: GESTIÓN DE ESTUDIANTES INACTIVOS Y EXPORTACIÓN CSV

### MT-023: Implementar flag de estudiante inactivo
- **Título:** Agregar campo isActive a entidad Student
- **Objetivo:** Marcar estudiantes como inactivos sin eliminarlos
- **Archivos a modificar:**
  1. `src/domain/entities/studentInfo.ts`
  2. `src/infrastructure/student.service.ts`
- **Tiempo estimado:** 1 hora
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Campo isActive: boolean en interfaz studentInfo
  - Función toggleStudentStatus(studentId, isActive)
  - Actualización en Firestore preserva datos históricos
  - Migration script para estudiantes existentes (isActive = true por defecto)
  - Tests unitarios

### MT-024: Filtrar estudiantes inactivos en listas de calificaciones
- **Título:** Ocultar estudiantes inactivos en GradeManager
- **Objetivo:** Solo mostrar estudiantes activos en vistas de notas
- **Archivos a modificar:**
  1. `src/presentation/features/notesManager/useCargarEstudiantesYNotas.ts`
- **Tiempo estimado:** 0.5 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-023
- **Definition of Done:**
  - Query fetchStudentsByClassroom filtra isActive === true
  - Estudiantes inactivos no aparecen en tablas de notas
  - Contadores de estudiantes excluyen inactivos
  - Tests confirman filtrado correcto

### MT-025: Filtrar estudiantes inactivos en informes
- **Título:** Excluir estudiantes inactivos de generación de informes
- **Objetivo:** Informes masivos solo incluyen estudiantes activos
- **Archivos a modificar:**
  1. `src/presentation/features/reports/BulkReportPrinter.tsx`
- **Tiempo estimado:** 0.5 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-023
- **Definition of Done:**
  - Filtro isActive en query de estudiantes
  - Checkbox opcional "Incluir estudiantes retirados"
  - Lista de selección solo muestra activos por defecto
  - Tests de filtrado

### MT-026: Mantener estudiantes inactivos en historial académico
- **Título:** Vista de historial muestra todos los estudiantes
- **Objetivo:** El módulo de historial académico debe permitir consultar estudiantes inactivos
- **Archivos a modificar:**
  1. `src/presentation/pages/private/History.tsx`
- **Tiempo estimado:** 1 hora
- **Prioridad:** ALTA
- **Dependencias:** MT-023
- **Definition of Done:**
  - Query de historial no filtra por isActive
  - Badge visual indica estado (Activo/Retirado)
  - Filtro opcional para ver solo activos o solo inactivos
  - Búsqueda funciona con todos los estudiantes
  - Tests de visualización

### MT-027: Modal de exportación CSV moderno
- **Título:** Crear modal para exportar datos a CSV
- **Objetivo:** Interfaz moderna para exportar estudiantes, salones y docentes
- **Archivos a modificar:**
  1. Crear: `src/presentation/features/export/ExportModal.tsx`
  2. `src/presentation/components/sidebarV2/config/sidebarNavConfig.ts`
- **Tiempo estimado:** 2 horas
- **Prioridad:** MEDIA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Modal con opciones: Estudiantes, Salones, Docentes
  - Filtros: Año escolar, Salón específico, Estado (activo/inactivo)
  - Preview de datos antes de exportar
  - Genera CSV con formato correcto
  - Loading state durante generación
  - Toast de confirmación

### MT-028: Modal para activar estudiantes en año escolar
- **Título:** Gestión masiva de estudiantes matriculados
- **Objetivo:** Modal para secretaría para activar estudiantes en nuevo año escolar
- **Archivos a modificar:**
  1. Crear: `src/presentation/features/students/components/StudentActivationModal.tsx`
  2. `src/infrastructure/student.service.ts`
- **Tiempo estimado:** 2.5 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-023
- **Definition of Done:**
  - Lista de estudiantes con checkboxes
  - Marcar como retirados (isActive = false)
  - Activar estudiantes para año actual
  - Filtros por grado y estado
  - Acción masiva con confirmación
  - Servicio updateStudentsStatus(studentIds[], isActive)
  - Tests de actualización masiva

---

## FASE 6: OPTIMIZACIÓN MÓDULO PREESCOLAR

### MT-029: Refactor EvaluadorCompleto - eliminar colores fucsias
- **Título:** Modernizar esquema de colores del evaluador de preescolar
- **Objetivo:** Reemplazar colores fucsias por paleta moderna y profesional
- **Archivos a modificar:**
  1. `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.css`
- **Tiempo estimado:** 1 hora
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Paleta de colores consistente con Academix
  - Azules, verdes, grises modernos
  - Eliminación completa de fucsias
  - Contraste accesible (WCAG AA)
  - Tests visuales de regresión

### MT-030: Eliminar bordes izquierdos de tarjetas en preescolar
- **Título:** Simplificar UI de cards en módulo de preescolar
- **Objetivo:** Remover border-left excesivos y simplificar diseño
- **Archivos a modificar:**
  1. `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.css`
- **Tiempo estimado:** 0.5 horas
- **Prioridad:** MEDIA
- **Dependencias:** MT-029
- **Definition of Done:**
  - Bordes izquierdos removidos
  - Cards con sombra sutil en su lugar
  - Diseño más limpio y moderno
  - Mantiene jerarquía visual
  - CSS optimizado

### MT-031: Modernizar modales de confirmación en preescolar
- **Título:** Reemplazar alerts con modales modernos en evaluador
- **Objetivo:** Usar componentes de modal consistentes con el resto del sistema
- **Archivos a modificar:**
  1. `src/presentation/features/preschool/Evaluador/useEvaluadorCompleto.ts`
  2. `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-012, MT-029
- **Definition of Done:**
  - Alerts reemplazados por Toast
  - Modal de confirmación antes de guardar
  - Loading states durante guardado
  - Success/error feedback visual
  - UX consistente con resto del sistema

### MT-032: Optimizar UX del gestor de indicadores
- **Título:** Mejorar flujo de creación y edición de indicadores
- **Objetivo:** Interfaz más intuitiva para gestionar indicadores de preescolar
- **Archivos a modificar:**
  1. `src/presentation/features/preschool/GestorIndicadores.tsx`
  2. `src/presentation/features/preschool/GestorIndicadores.css`
- **Tiempo estimado:** 2 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-029, MT-030
- **Definition of Done:**
  - Formulario con validación en tiempo real
  - Preview de indicador antes de guardar
  - Drag & drop para reordenar (opcional)
  - Búsqueda y filtros mejorados
  - Botones de acción claros
  - Loading states

### MT-033: Corregir bugs específicos del evaluador de preescolar
- **Título:** Fix bugs reportados en evaluación de preescolar
- **Objetivo:** Resolver errores funcionales sin cambiar lógica de evaluación
- **Archivos a modificar:**
  1. `src/presentation/features/preschool/Evaluador/useEvaluadorPreescolar.ts`
  2. `src/presentation/features/preschool/Evaluador/useEvaluadorCompleto.ts`
- **Tiempo estimado:** 2 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-031
- **Definition of Done:**
  - Bugs identificados y documentados
  - Fixes aplicados sin cambiar lógica de negocio
  - Tests de regresión para prevenir re-aparición
  - Validaciones robustas
  - Error handling mejorado

---

## FASE 7: GESTIÓN DE USUARIOS Y LIMPIEZA DE CÓDIGO

### MT-034: Optimizar modal de creación de usuarios
- **Título:** Modernizar UI/UX del modal de usuarios
- **Objetivo:** Interfaz más clara y profesional para crear usuarios
- **Archivos a modificar:**
  1. Crear: `src/presentation/features/settings/components/UserModal.tsx`
- **Tiempo estimado:** 2 horas
- **Prioridad:** ALTA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Form con validación robusta
  - Secciones colapsables para organizar campos
  - Preview de permisos asignados
  - Loading state durante creación
  - Error handling claro
  - Accesibilidad mejorada

### MT-035: Implementar edición de usuarios
- **Título:** Permitir editar salones y asignaturas de usuarios existentes
- **Objetivo:** Funcionalidad completa CRUD para usuarios
- **Archivos a modificar:**
  1. `src/infrastructure/user.service.ts`
  2. Reutilizar: `src/presentation/features/settings/components/UserModal.tsx`
- **Tiempo estimado:** 1.5 horas
- **Prioridad:** ALTA
- **Dependencias:** MT-034
- **Definition of Done:**
  - Función updateUser() con merge de datos
  - Asignar/quitar salones dinámicamente
  - Asignar/quitar asignaturas dinámicamente
  - Cambiar director de grupo
  - Validación de conflictos (ej: director ya asignado)
  - Tests de actualización

### MT-036: Limpiar componentes Sidebar y Header antiguos
- **Título:** Eliminar archivos obsoletos de Sidebar y Header
- **Objetivo:** Remover código legacy una vez confirmado que SidebarV2 y HeaderV2 están estables
- **Archivos a modificar:**
  1. Eliminar: `src/presentation/components/sidebar/Sidebar.tsx`
  2. Eliminar: `src/presentation/components/sidebar/Sidebar.css`
- **Tiempo estimado:** 1 hora
- **Prioridad:** BAJA
- **Dependencias:** Ninguna (requiere aprobación del usuario)
- **Definition of Done:**
  - Archivos viejos eliminados
  - Imports actualizados en toda la app
  - No hay referencias a componentes antiguos
  - Tests pasan sin componentes viejos
  - Documentación actualizada

**⚠️ NOTA:** Esta tarea requiere confirmación explícita que SidebarV2 y HeaderV2 están 100% funcionales.

### MT-037: Mejorar input de búsqueda con vista detallada de historial
- **Título:** Búsqueda global con resultados detallados y modernos
- **Objetivo:** Resultados de búsqueda llevan a vista de historial elegante
- **Archivos a modificar:**
  1. `src/presentation/components/headerV2/SearchBar.tsx`
  2. Crear: `src/presentation/pages/private/StudentHistoryView.tsx`
- **Tiempo estimado:** 3 horas
- **Prioridad:** MEDIA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - SearchBar con autocomplete
  - Resultados muestran: nombre, documento, salón actual
  - Click lleva a vista de historial académico completo
  - Vista de historial moderna con cards por año
  - Timeline visual de progreso académico
  - Gráficos de promedios por periodo
  - Exportable a PDF

---

## FASE 8: MEJORAS MENORES Y PULIDO FINAL

### MT-038: Mejorar mensajes cuando no existen datos
- **Título:** Estados vacíos más claros y profesionales
- **Objetivo:** Reemplazar mensajes de "error" por estados empty descriptivos
- **Archivos a modificar:**
  1. Crear: `src/presentation/components/common/EmptyState.tsx`
  2. Aplicar en múltiples componentes (uno a la vez en microtareas)
- **Tiempo estimado:** 2 horas (por cada componente 0.5h)
- **Prioridad:** MEDIA
- **Dependencias:** Ninguna
- **Definition of Done:**
  - Icono ilustrativo para estado vacío
  - Mensaje claro: "No hay X disponibles"
  - Sugerencia de acción (ej: "Crea tu primer X")
  - Consistente en todos los módulos
  - No confundir ausencia de datos con error

### MT-039: Agregar opción "Impresión de informes" en SidebarV2
- **Título:** Link directo a BulkReportPrinter desde sidebar
- **Objetivo:** Acceso rápido a impresión masiva para coordinadores
- **Archivos a modificar:**
  1. `src/presentation/components/sidebarV2/config/sidebarNavConfig.ts`
- **Tiempo estimado:** 0.5 horas
- **Prioridad:** MEDIA
- **Dependencias:** MT-009
- **Definition of Done:**
  - Nuevo item en navItems con IconPrinter
  - Solo visible para role: 'Coordinador'
  - Link a ruta de BulkReportPrinter
  - Descripción clara
  - Tests de visibilidad por rol

---

## MICROTAREAS ADICIONALES (BACKLOG - PRIORIDAD BAJA)

### MT-040 a MT-058: Refactors y mejoras incrementales

**Estas microtareas incluyen:**
- Optimización de consultas Firebase
- Mejoras de performance en renderizado de listas
- Implementación de lazy loading en rutas
- Mejoras de accesibilidad (ARIA labels, navegación por teclado)
- Tests unitarios y de integración faltantes
- Documentación de componentes con JSDoc
- Migraciones de datos para nuevos campos
- Auditoría de seguridad de reglas de Firestore
- Optimización de bundle size
- Implementación de error boundaries
- Logging y monitoreo de errores
- Mejoras de SEO (meta tags)
- PWA features (offline mode, service workers)
- Internacionalización (i18n) preparación
- Temas oscuros (dark mode) preparación
- Onboarding para nuevos usuarios
- Analytics y tracking de uso
- Backup automático de datos
- Versionado de esquema de base de datos

*Estas microtareas se planificarán detalladamente en una segunda iteración.*

---

## RESTRICCIONES Y NOTAS IMPORTANTES

### ✅ Restricciones Respetadas
- Cada microtarea modifica **MÁXIMO 2 ARCHIVOS**
- Cuando se crea un componente nuevo, cuenta como 1 archivo
- **NO SE TOCAN** los módulos protegidos:
  - `src/presentation/components/notes/`
  - `src/presentation/components/achievement/`
  - `src/presentation/components/classRoomReport/` (solo extensión)
  - `src/presentation/components/informeGeneral/` (solo extensión)

### ⚠️ Tareas que Requieren Aprobación Especial
- **MT-036**: Eliminar Sidebar y Header antiguos (confirmar estabilidad de V2)
- **MT-004**: Cambios en estructura de datos históricos (backup previo)
- **MT-023**: Agregar campo isActive (migración de datos existentes)

### 📂 Archivos Más Críticos

1. **`src/infrastructure/student.service.ts`**
   - Servicios de persistencia de notas
   - Validación de duplicados
   - Gestión de estado activo/inactivo

2. **`src/presentation/features/notesManager/useConstruirYEnviarLote.ts`**
   - Lógica crítica de guardado de notas que actualmente falla

3. **`src/presentation/features/reports/BulkReportPrinter.tsx`**
   - Múltiples mejoras de impresión
   - Estilos
   - Informe de secundaria

4. **`src/presentation/components/toast/Toast.tsx`** (CREAR)
   - Sistema de notificaciones global que afecta toda la UX

5. **`src/infrastructure/user.service.ts`**
   - Gestión de usuarios
   - Permisos
   - Resolución de nombres de directores

---

## ORDEN RECOMENDADO DE EJECUCIÓN

1. **FASE 1** (MT-001 a MT-004): Bugs críticos de funcionalidad
2. **FASE 2** (MT-005 a MT-011): Bugs críticos de informes
3. **FASE 3** (MT-012 a MT-016): Toast y UX básicas
4. **FASE 4** (MT-017 a MT-022): Mejoras visuales
5. **FASE 5** (MT-023 a MT-028): Gestión de inactivos
6. **FASE 6** (MT-029 a MT-033): Preescolar
7. **FASE 7** (MT-034 a MT-039): Usuarios y limpieza
8. **FASE 8** (MT-040+): Backlog

---

**Última actualización:** 2026-02-06
**Agente Arquitecto ID:** a125f3a
