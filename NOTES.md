# PLAN DE MICROTAREAS - MEJORA UX/UI MÓDULO PREESCOLAR

**Fecha de creación:** 2026-02-09
**Última actualización:** 2026-02-09 (8 tareas completadas)
**Estado:** En progreso ⏳
**Agente:** Arquitecto (Plan)
**Total microtareas:** 18
**Tiempo estimado:** 24-30 horas

## 📊 PROGRESO ACTUAL: 8/18 COMPLETADAS (44%)

### ✅ Completadas (8)
- MT-01: NotesPreschool.tsx - Layout
- MT-02: ConfigIndicadores.tsx - Layout
- MT-03: ClassroomStudents.tsx - Layout
- MT-04: EvaluadorPreescolar.tsx - Layout
- MT-05: InformeConfigurador.tsx - Cards
- MT-06: GestorIndicadores.tsx - Layout tabs/tabla
- MT-07: GestorIndicadores.tsx - Tipografía
- MT-08: GestorIndicadores.tsx - Estados

### ⏭️ Próxima: MT-10 (MT-09 pospuesta al final)

---

## CONTEXTO DEL PROYECTO

### Vistas a Mejorar
1. `/notespreschool/1/jwHDLP1RAT9DX5SbKA3p` → NotesPreschool.tsx
2. `/indicadores/1/jwHDLP1RAT9DX5SbKA3p` → ConfigIndicadores.tsx
3. `/student/1/jwHDLP1RAT9DX5SbKA3p/students` → ClassroomStudents.tsx
4. `/evaluadorpreescolar/1/jwHDLP1RAT9DX5SbKA3p/1016755537/2025` → EvaluadorPreescolar.tsx
5. `/print/1/jwHDLP1RAT9DX5SbKA3p/1016755537/2025` → InformePreescolar.tsx

### Problemas Identificados
- Todo se ve corrido sin márgenes apropiados
- No hay jerarquía visual en textos y componentes
- Cards y layouts desorganizados
- Sidebar se superpone al header al expandir (debe comportarse como dashboard)
- Vista de propósitos necesita funcionalidad para crear/agregar/quitar áreas

### Requisitos de Diseño
- **Layout:** Márgenes correctos, cards bien estructuradas, espaciado consistente
- **Tipografía:** Jerarquía visual clara, textos en negro, sin colores fuertes
- **Tablas:** Diseño minimalista y moderno, márgenes correctos
- **Informe Impreso:** Cabecera estructurada y alineada, ajustarse a hoja legal/carta
- **Responsividad:** Uso de Tailwind con enfoque mobile-first
- **Sidebar:** Comportamiento correcto sin superponerse al header

### Reglas Obligatorias (AGENTS.md)
✅ Máximo 2 archivos por microtarea
✅ Microtareas de 1-2 horas máximo
✅ Declarar archivos explícitamente
✅ NO tocar módulos protegidos (notes/, achievement/, classRoomReport/, informeGeneral/)
✅ Respetar arquitectura de 3 capas
✅ TypeScript estricto: tipos explícitos, no `any`
✅ Tailwind solo para UI nueva

---

## FASE 1: AJUSTES DE LAYOUT Y ESTRUCTURA BASE
**Microtareas:** 5
**Tiempo estimado:** 6-8 horas

### ✅ MT-01: Ajustar márgenes y espaciado en NotesPreschool.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/pages/private/Dashboard/components/NotesPreschool.tsx`

**Descripción:**
Corregir el espaciado superior del contenido principal para que no se superponga con HeaderV2. Actualmente hay un `div` con `h-16` que genera el espaciado, pero necesita ajuste para alinearse correctamente con el header fijo.

**Cambios específicos:**
- Eliminar el `div` spacer de `h-16` actual
- Ajustar padding-top en el `main` para compensar header fijo (16 de altura)
- Verificar que el contenido comience después del header sin superposición

**Definition of Done:**
- El contenido no se superpone al header
- Espaciado consistente de 24px entre header y contenido
- Vista responsive correcta

---

### ✅ MT-02: Ajustar márgenes y espaciado en ConfigIndicadores.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/pages/private/Dashboard/components/ConfigIndicadores.tsx`

**Descripción:**
Similar a MT-01, corregir el espaciado superior para evitar superposición con HeaderV2.

**Cambios específicos:**
- Eliminar el `div` spacer de `h-16` actual
- Ajustar padding-top en el `main`
- Mantener coherencia con NotesPreschool.tsx

**Definition of Done:**
- Espaciado consistente con NotesPreschool.tsx
- Sin superposición con header
- Vista responsive correcta

---

### ✅ MT-03: Ajustar layout en ClassroomStudents.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/teacher/ClassroomStudents.tsx`

**Descripción:**
Corregir espaciado superior y mejorar consistencia de márgenes en la tabla de estudiantes.

**Cambios específicos:**
- Eliminar el `div` spacer de `h-16`
- Ajustar padding del contenedor principal
- Mejorar espaciado del botón "Regresar" (actualmente mb-4, cambiar a mb-6)

**Definition of Done:**
- Layout consistente con otras vistas de preescolar
- Tabla con márgenes apropiados
- Botón regresar con espaciado visual correcto

---

### ✅ MT-04: Ajustar layout en EvaluadorPreescolar.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/pages/private/Dashboard/components/EvaluadorPreescolar.tsx`

**Descripción:**
Corregir espaciado y asegurar que EvaluadorCompleto tenga suficiente aire visual.

**Cambios específicos:**
- Eliminar el `div` spacer de `h-16`
- Ajustar padding del contenedor `main`
- Revisar que el componente hijo (EvaluadorCompleto) respire adecuadamente

**Definition of Done:**
- Sin superposición con header
- EvaluadorCompleto renderiza con márgenes apropiados
- Consistencia con otras páginas del módulo

---

### ✅ MT-05: Mejorar estructura de cards en InformeConfigurador.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Descripción:**
Mejorar la jerarquía visual de las cards de propósitos, agregando sombras sutiles y mejorando el espaciado interno.

**Cambios específicos:**
- Cambiar border de cards de `border-gray-200` a `border-gray-200 shadow-sm`
- Incrementar padding interno de cards de `p-6` a `p-8`
- Mejorar espaciado entre tabs y formulario (de `mb-6` a `mb-8`)

**Definition of Done:**
- Cards con mejor definición visual
- Espaciado interno más generoso
- Jerarquía visual clara entre elementos

---

## FASE 2: MEJORAS EN COMPONENTE GESTOR INDICADORES
**Microtareas:** 4
**Tiempo estimado:** 6-8 horas

### ✅ MT-06: Mejorar layout de tabs y tabla en GestorIndicadores.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/GestorIndicadores.tsx`

**Descripción:**
Mejorar el layout de dos columnas (tabla + panel lateral) para que tenga mejor balance visual y espaciado.

**Cambios específicos:**
- Cambiar contenedor principal de `flex gap-6` a `flex gap-8`
- Ajustar width del panel lateral de `w-96` a `w-[400px]`
- Mejorar padding de las tabs (de `px-3 py-2` a `px-4 py-2.5`)
- Agregar `shadow-sm` a la card de la tabla

**Definition of Done:**
- Layout balanceado visualmente
- Panel lateral con width consistente
- Tabs más prominentes y clickeables

---

### ✅ MT-07: Mejorar tipografía y jerarquía visual en GestorIndicadores.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/GestorIndicadores.tsx`

**Descripción:**
Mejorar la jerarquía de textos para mayor legibilidad, usando tamaños de fuente y pesos apropiados.

**Cambios específicos:**
- Headers de tabla: cambiar de `text-xs` a `text-[11px]` y `font-semibold` a `font-bold`
- Texto de indicadores en tabla: cambiar de `text-sm` a `text-sm leading-relaxed`
- Label del formulario lateral: mantener `text-xs` pero agregar `font-semibold`
- Título del panel lateral: cambiar de `text-sm` a `text-base font-bold`

**Definition of Done:**
- Textos más legibles
- Jerarquía visual clara entre headers y contenido
- Consistencia tipográfica

---

### ✅ MT-08: Optimizar estado vacío y feedback en GestorIndicadores.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/GestorIndicadores.tsx`

**Descripción:**
Mejorar los estados vacíos y de carga para una mejor experiencia de usuario.

**Cambios específicos:**
- Estado de carga: cambiar spinner de `border-t-emerald-500` a `border-t-gray-900`
- Empty state de tabla: mejorar texto y agregar más contexto visual
- Toast de notificación: ajustar posición de `top-24` a `top-20`

**Definition of Done:**
- Estados vacíos informativos
- Feedback visual claro durante acciones
- Animaciones y transiciones suaves

---

### ⚠️ MT-09: Agregar funcionalidad de creación de áreas en GestorIndicadores
**Estado:** Pendiente (DISEÑO SOLAMENTE)
**Archivos involucrados:**
- `src/presentation/features/preschool/GestorIndicadores.tsx`
- `src/infrastructure/area.service.ts`

**Descripción:**
⚠️ **NOTA:** Esta microtarea requiere acceso a Firebase y creación de nueva funcionalidad. Por ser READ-ONLY en planificación, solo se documenta el diseño.

**Cambios específicos (DISEÑO):**
- Agregar botón "+ Nueva Área" después de las tabs de asignaturas
- Crear modal para formulario de nueva área (nombre, nivel=preescolar, IHS, orden)
- Conectar con `area.service.ts` para persistencia
- Actualizar lista local después de crear

**Definition of Done (cuando se implemente):**
- Modal funcional para crear áreas
- Validación de campos requeridos
- Actualización inmediata de tabs al crear área
- Feedback visual de éxito/error

---

## FASE 3: MEJORAS EN EVALUADOR COMPLETO E INFORME
**Microtareas:** 5
**Tiempo estimado:** 6-8 horas

### ✅ MT-10: Mejorar estructura visual de propósitos en EvaluadorCompleto.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`

**Descripción:**
Mejorar la jerarquía y espaciado de las cards de propósitos para mejor legibilidad.

**Cambios específicos:**
- Cambiar espaciado entre propósitos de `space-y-6` a `space-y-8`
- Agregar sombra a cards: `border border-gray-200 shadow-md`
- Incrementar padding del contenido de `p-5` a `p-6`
- Header del propósito: mantener bg-emerald-500 pero agregar `shadow-sm`

**Definition of Done:**
- Cards con mejor definición visual
- Espaciado generoso entre secciones
- Jerarquía clara de información

---

### ✅ MT-11: Mejorar formularios de selección en EvaluadorCompleto.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`

**Descripción:**
Mejorar la UX de los selectores de indicadores por asignatura.

**Cambios específicos:**
- Select: incrementar padding de `py-3` a `py-3.5`
- Mejorar label visual: de `text-sm font-semibold` a `text-sm font-bold text-gray-800`
- Espaciado entre selects: de `space-y-2` a `space-y-4`
- Agregar transición visual al hacer hover en selects

**Definition of Done:**
- Selects más fáciles de interactuar
- Labels más prominentes
- Feedback visual en hover/focus

---

### ✅ MT-12: Optimizar botón de guardar y feedback en EvaluadorCompleto.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx`

**Descripción:**
Mejorar la barra de acción inferior con el botón de guardar.

**Cambios específicos:**
- Barra de acción: cambiar de `mt-8 p-4` a `mt-10 p-6`
- Botón guardar: incrementar padding de `px-6 py-3` a `px-8 py-3.5`
- Agregar sombra a la barra: `shadow-lg border-t-2 border-gray-100`
- Mensaje de éxito: mejorar transición de entrada/salida

**Definition of Done:**
- Botón más prominente y fácil de clickear
- Barra de acción visualmente separada del contenido
- Feedback de éxito claro y satisfactorio

---

### ✅ MT-13: Mejorar cabecera oficial en InformePreescolar.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/Evaluador/InformePreescolar.tsx`

**Descripción:**
Optimizar la tabla de cabecera institucional para mejor alineación y legibilidad en impresión.

**Cambios específicos:**
- Ajustar padding de celdas para mejor balance visual
- Logo institucional: mantener `w-24` pero mejorar alineación vertical
- Texto central: mejorar line-height de `leading-relaxed` a `leading-normal`
- Asegurar que la tabla se imprima correctamente en hoja legal

**Definition of Done:**
- Cabecera alineada correctamente
- Logos con tamaño apropiado
- Texto institucional legible y balanceado
- Impresión sin cortes

---

### ✅ MT-14: Optimizar tablas de propósitos en InformePreescolar.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/Evaluador/InformePreescolar.tsx`

**Descripción:**
Mejorar el diseño de las tablas de propósitos/referentes para impresión óptima.

**Cambios específicos:**
- Incrementar padding de celdas de referentes de `p-4` a `p-5`
- Mejorar padding de items individuales de `px-3 py-2` a `px-4 py-3`
- Ajustar width de columna referentes de `w-[30%]` a `w-[35%]`
- Mejorar espaciado entre propósitos de `space-y-4` a `space-y-6`

**Definition of Done:**
- Tablas balanceadas visualmente
- Texto legible en impresión
- Distribución apropiada de columnas
- Sin desbordamientos en página legal

---

## FASE 4: MEJORAS EN INFORME CONFIGURADOR Y PULIDO FINAL
**Microtareas:** 4
**Tiempo estimado:** 6-8 horas

### ✅ MT-15: Mejorar barra de progreso en InformeConfigurador.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Descripción:**
Mejorar la visualización de la barra de progreso para mayor impacto visual.

**Cambios específicos:**
- Card de progreso: agregar `shadow-sm` al border
- Incrementar altura de barra de `h-2` a `h-2.5`
- Mejorar textos de progreso: de `text-sm` a `text-sm font-semibold`
- Agregar animación más suave a la transición de progreso

**Definition of Done:**
- Barra de progreso más visible
- Textos de porcentaje destacados
- Animación fluida

---

### ✅ MT-16: Optimizar formulario de referentes en InformeConfigurador.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Descripción:**
Mejorar la UX del formulario de referentes con mejor espaciado y feedback visual.

**Cambios específicos:**
- Incrementar espaciado entre inputs de referentes de `space-y-3` a `space-y-4`
- Textarea de propósito: incrementar padding de `px-4 py-2.5` a `px-4 py-3`
- Labels: cambiar de `text-sm` a `text-sm font-semibold text-gray-800`
- Inputs: mejorar focus ring con `focus:ring-2 focus:ring-emerald-500`

**Definition of Done:**
- Formulario más espacioso y respirable
- Labels más legibles
- Focus states claros en todos los inputs

---

### ✅ MT-17: Mejorar sección de asignaturas asociadas en InformeConfigurador.tsx
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/features/preschool/InformeConfigurador.tsx`

**Descripción:**
Optimizar la UI de selección y gestión de asignaturas por propósito.

**Cambios específicos:**
- Botones de asignaturas disponibles: cambiar a diseño de chips más compacto
- Grid de asignaturas: de `grid-cols-2 md:grid-cols-3` a `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Items seleccionados: mejorar hover state con `hover:bg-gray-100`
- Espaciado entre secciones de disponibles/seleccionadas de `mb-4` a `mb-6`

**Definition of Done:**
- Asignaturas más fáciles de agregar/quitar
- Diseño responsive mejorado
- Estados hover claros

---

### ✅ MT-18: Pulido final de consistencia visual en todo el módulo
**Estado:** Pendiente
**Archivos involucrados:**
- `src/presentation/components/PageHeader/PageHeader.tsx`

**Descripción:**
Revisar y ajustar PageHeader para consistencia con el módulo de preescolar.

**Cambios específicos:**
- Asegurar que el ícono circular mantenga `bg-emerald-500` consistente
- Verificar que breadcrumbs usen `text-emerald-600` para links activos
- Ajustar espaciado inferior de `mb-6` a `mb-8` para más aire
- Título: mantener `text-2xl font-bold` pero asegurar color `text-gray-900`

**Definition of Done:**
- PageHeader consistente en todas las vistas
- Colores emerald aplicados correctamente
- Espaciado uniforme

---

## RESUMEN EJECUTIVO

### Estadísticas
- **Total de microtareas:** 18
- **Fases:** 4
- **Tiempo estimado total:** 24-30 horas
- **Archivos únicos afectados:** 8

### Distribución por Fase
| Fase | Microtareas | Horas Estimadas | Enfoque |
|------|-------------|-----------------|---------|
| 1 | 5 | 6-8h | Layout y estructura base |
| 2 | 4 | 6-8h | Gestor de indicadores |
| 3 | 5 | 6-8h | Evaluador e informe |
| 4 | 4 | 6-8h | Configurador y pulido |

### Archivos Críticos

1. **NotesPreschool.tsx** - Página de notas (MT-01)
2. **ConfigIndicadores.tsx** - Página de configuración de indicadores (MT-02)
3. **ClassroomStudents.tsx** - Página de estudiantes del salón (MT-03)
4. **EvaluadorPreescolar.tsx** - Página del evaluador (MT-04)
5. **InformeConfigurador.tsx** - Configurador de propósitos (MT-05, MT-15, MT-16, MT-17)
6. **GestorIndicadores.tsx** - Gestor de indicadores (MT-06, MT-07, MT-08, MT-09)
7. **EvaluadorCompleto.tsx** - Evaluador completo (MT-10, MT-11, MT-12)
8. **InformePreescolar.tsx** - Informe imprimible (MT-13, MT-14)
9. **PageHeader.tsx** - Componente compartido (MT-18)

### Prioridades de Implementación

#### ALTA PRIORIDAD (Implementar primero)
- MT-01 a MT-04: Corregir superposición de header en todas las vistas
- MT-06, MT-07: Mejorar layout y tipografía del gestor de indicadores

#### MEDIA PRIORIDAD
- MT-05, MT-15, MT-16, MT-17: Mejoras en formularios y cards
- MT-10, MT-11, MT-12: Optimización del evaluador

#### BAJA PRIORIDAD (Pulido)
- MT-08, MT-18: Estados vacíos y consistencia final
- MT-13, MT-14: Ajustes de impresión

### Notas Importantes

1. **MT-09 está marcada como "DISEÑO SOLAMENTE"** porque requiere creación de nuevos componentes (modal) y lógica de persistencia. Debe implementarse con cuidado siguiendo la arquitectura de 3 capas.

2. **Todas las microtareas respetan AGENTS.md:**
   - ✅ Máximo 2 archivos por tarea
   - ✅ Tiempo estimado 1-2 horas
   - ✅ No tocan módulos protegidos
   - ✅ Usan Tailwind CSS
   - ✅ TypeScript estricto

3. **HeaderV2 y SidebarV2 NO se modifican** - Son componentes compartidos del sistema

4. **Enfoque en diseño minimalista:**
   - Textos en negro/gris oscuro
   - Colores fuertes solo en emerald para acciones principales
   - Sombras sutiles (shadow-sm, shadow-md)
   - Espaciado generoso

5. **Informe impreso requiere atención especial:**
   - Debe ajustarse a hoja legal
   - Cabecera institucional bien alineada
   - Tablas sin desbordamiento
   - Uso de media queries para print

---

## PRÓXIMOS PASOS

1. **Revisar y aprobar este plan** con el equipo/usuario
2. **Comenzar con FASE 1** - ajustes de layout base
3. **Implementar una microtarea a la vez** siguiendo el orden establecido
4. **Validar cada Definition of Done** antes de pasar a la siguiente
5. **Documentar cambios** y mantener NOTES.md actualizado con el progreso

---

**Fin del plan de microtareas**
**Generado por:** Agente Arquitecto (Plan)
**ID del agente:** af41d3e
**Fecha:** 2026-02-09
