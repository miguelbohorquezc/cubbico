# PLAN DE IMPLEMENTACIÓN: Sistema de Gestión de Estados de Estudiantes

**Fecha**: 2026-02-12
**Agente**: Arquitecto
**Estado**: 🟡 EN PROGRESO - 8/13 microtareas completadas (61%)
**Tiempo Estimado Total**: 8.5 horas
**Total Microtareas**: 13

## 📈 Progreso Actual
- ✅ Fase 1: CAPA DE DOMINIO (2/2) - COMPLETADA
- ✅ Fase 2: CAPA DE INFRAESTRUCTURA (3/3) - COMPLETADA
- ✅ Fase 3: CAPA DE PRESENTACIÓN - GESTIÓN (3/3) - COMPLETADA
- ⏳ Fase 4: CAPA DE PRESENTACIÓN - FILTRADO (0/4)
- ⏳ Fase 5: DOCUMENTACIÓN (0/1)

---

## 🎯 Objetivo General

Implementar un sistema de gestión de estados para estudiantes que permita marcar estudiantes como `retirado`, `expulsado`, `inactivo`, `suspendido`, etc., y que estos no aparezcan en vistas operativas (notas, promoción, informes), pero sí en el historial académico.

---

## ❌ Problema Actual

Los estudiantes que están retirados, expulsados o inactivos:
- ❌ No tienen forma de ser gestionados
- ❌ Siguen apareciendo en la vista de notas: `/private/dashboard/notes/:periodId/:classroomId/:areaId`
- ❌ Siguen apareciendo en promoción: `/private/dashboard/classrooms`
- ❌ Siguen apareciendo en informes académicos: `/private/dashboard/informe/salon/:level/:periodId/:classroomId/:year`

---

## ✅ Requisitos Funcionales

1. **Agregar campo de estado al estudiante**
   - Estados posibles: `activo`, `retirado`, `expulsado`, `inactivo`, `suspendido`, `graduado`, `transferido`
   - Estado por defecto: `activo`

2. **Vista de gestión de estudiantes** (`/private/dashboard/createstudent`)
   - Agregar un select en el modal de edición para cambiar el estado del estudiante
   - Agregar columna "Estado" en la tabla de estudiantes

3. **Filtrado automático por estado**
   - Estudiantes con estado diferente a `activo` NO deben aparecer en:
     - Vista de notas
     - Promoción de estudiantes
     - Informes académicos actuales
     - Vista de profesores
     - Lista de asistencia
   - Estudiantes con cualquier estado SÍ deben aparecer en:
     - Historial académico (`/private/dashboard/academic-history`)
     - Gestión de estudiantes (para poder editarlos)

---

## 🔒 Restricciones Críticas

### MÓDULOS PROTEGIDOS (NO TOCAR sin extremo cuidado)
- ❌ `src/presentation/components/notes/`
- ❌ `src/presentation/components/achievement/`
- ❌ `src/presentation/components/classRoomReport/`
- ❌ `src/presentation/components/informeGeneral/`

### REGLAS OBLIGATORIAS (AGENTS.md)
- ✅ Dividir en microtareas de 1-2 horas
- ✅ Máximo 2 archivos por microtarea
- ✅ Arquitectura de 3 capas (Domain → Infrastructure → Presentation)
- ✅ TypeScript estricto, no `any`

---

## 📊 Análisis del Código Actual

### Hallazgos Clave

1. **Entidad de dominio** (`src/domain/entities/studentInfo.ts`):
   - ✅ Ya existe un campo `status?: StudentStatus`
   - ✅ Ya hay tipos `'activo' | 'retirado' | 'graduado' | 'transferido'`
   - ❌ Faltan estados: `expulsado`, `inactivo`, `suspendido`

2. **Servicio de infraestructura** (`src/infrastructure/student.service.ts`):
   - ❌ `addStudent()` NO persiste el campo `status`
   - ⚠️ `updateStudent()` usa merge, podría funcionar
   - ❌ `fetchStudents()` y `fetchStudentsByClassroom()` NO filtran por estado

3. **Componente de gestión** (`src/presentation/features/students/StudentsList.tsx`):
   - ❌ NO muestra columna de estado
   - ❌ NO hay filtrado por estado

4. **Formulario** (`src/presentation/components/studentForm/StudentFormV2.tsx`):
   - ❌ NO tiene campo para editar estado

5. **Puntos de uso de `fetchStudentsByClassroom()`**:
   - `GradeManager.tsx` (notas) - línea 65
   - `PromotionManager.tsx` (promoción) - línea 74
   - `ClassroomStudents.tsx` (profesores)
   - `AttendanceList.tsx` (asistencia)

---

## 🏗️ Arquitectura de 3 Capas

```
1. DOMAIN → Definir tipos de estado extendidos
2. INFRASTRUCTURE → Servicios de persistencia y filtrado
3. PRESENTATION → UI para gestionar estados
```

---

## 📋 MICROTAREAS

### FASE 1: CAPA DE DOMINIO

#### **Microtarea 1.1: Extender tipos de estado en entidad studentInfo**
**Tiempo estimado**: 30 minutos

**Objetivo**: Actualizar la definición de `StudentStatus` para incluir todos los estados requeridos

**Archivos a modificar**:
1. `src/domain/entities/studentInfo.ts`

**Cambios específicos**:
- Modificar el tipo `StudentStatus`:
  ```typescript
  export type StudentStatus =
    | 'activo'
    | 'retirado'
    | 'expulsado'
    | 'inactivo'
    | 'suspendido'
    | 'graduado'
    | 'transferido';
  ```
- Verificar que el campo `status?: StudentStatus` en `studentInfo` se mantenga opcional

**Definition of Done**:
- ✅ TypeScript compila sin errores
- ✅ El tipo `StudentStatus` incluye los 7 estados
- ✅ Campo `status` sigue siendo opcional en `studentInfo`

---

#### **Microtarea 1.2: Crear tipos compartidos para UI de estados**
**Tiempo estimado**: 30 minutos

**Objetivo**: Definir constantes y tipos para etiquetas y colores de estados

**Archivos a modificar**:
1. `src/shared/types/studentManagementTypes.ts`

**Cambios específicos**:
- Agregar al final del archivo (después de línea 363):
  ```typescript
  /**
   * Etiquetas de estado de estudiante para UI
   */
  export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
    activo: 'Activo',
    retirado: 'Retirado',
    expulsado: 'Expulsado',
    inactivo: 'Inactivo',
    suspendido: 'Suspendido',
    graduado: 'Graduado',
    transferido: 'Transferido',
  };

  /**
   * Colores para badges de estado (Tailwind)
   */
  export const STUDENT_STATUS_COLORS: Record<StudentStatus, string> = {
    activo: 'bg-green-100 text-green-800 border-green-200',
    retirado: 'bg-gray-100 text-gray-800 border-gray-200',
    expulsado: 'bg-red-100 text-red-800 border-red-200',
    inactivo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    suspendido: 'bg-orange-100 text-orange-800 border-orange-200',
    graduado: 'bg-blue-100 text-blue-800 border-blue-200',
    transferido: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  ```
- Importar `StudentStatus` desde `domain/entities/studentInfo`

**Definition of Done**:
- ✅ TypeScript compila sin errores
- ✅ Constantes exportadas correctamente
- ✅ Importación de `StudentStatus` funciona

---

### FASE 2: CAPA DE INFRAESTRUCTURA

#### **Microtarea 2.1: Actualizar servicio de persistencia para incluir status**
**Tiempo estimado**: 30 minutos

**Objetivo**: Modificar `addStudent` para persistir el campo `status`

**Archivos a modificar**:
1. `src/infrastructure/student.service.ts`

**Cambios específicos**:
- En función `addStudent()` (líneas 35-49), agregar `status` al objeto de setDoc:
  ```typescript
  await setDoc(doc(db, "student", student.id), {
    id: student.id,
    document: student.document,
    name: student.name,
    lastName: student.lastName,
    classRoom: student.classRoom,
    className: student.className,
    caracter: student.caracter,
    classroomId: student.classroomId,
    status: student.status || 'activo', // ← NUEVO: default 'activo'
  }, {merge: true});
  ```

**Definition of Done**:
- ✅ Campo `status` se guarda en Firestore
- ✅ Si no se proporciona, default a `'activo'`
- ✅ TypeScript compila sin errores
- ✅ No se afecta funcionalidad existente

---

#### **Microtarea 2.2: Crear servicio de filtrado de estudiantes activos**
**Tiempo estimado**: 45 minutos

**Objetivo**: Crear función auxiliar para filtrar estudiantes por estado

**Archivos a modificar**:
1. `src/infrastructure/student.service.ts`

**Cambios específicos**:
- Al final del archivo (después de `deleteStudent`), agregar:
  ```typescript
  /**
   * Filtra estudiantes por estado
   * Por defecto retorna solo estudiantes activos
   * @param students - Lista de estudiantes a filtrar
   * @param status - Estado a filtrar (default: 'activo')
   * @returns Estudiantes filtrados
   */
  export const filterStudentsByStatus = (
    students: Student[],
    status: 'activo' | 'all' = 'activo'
  ): Student[] => {
    if (status === 'all') return students;
    return students.filter(s => (s.status || 'activo') === status);
  };

  /**
   * Obtiene estudiantes activos de un salón
   * Wrapper de fetchStudentsByClassroom que filtra solo activos
   */
  export const fetchActiveStudentsByClassroom = async (
    classroomId: string
  ): Promise<Student[]> => {
    const allStudents = await fetchStudentsByClassroom(classroomId);
    return filterStudentsByStatus(allStudents, 'activo');
  };
  ```
- Agregar import de `StudentStatus` si es necesario

**Definition of Done**:
- ✅ Funciones exportadas correctamente
- ✅ TypeScript compila sin errores
- ✅ Lógica de filtrado correcta (default a 'activo' si status es undefined)

---

#### **Microtarea 2.3: Actualizar mapeo en fetchStudents para incluir status**
**Tiempo estimado**: 30 minutos

**Objetivo**: Asegurar que el campo `status` se mapee correctamente al leer de Firestore

**Archivos a modificar**:
1. `src/infrastructure/student.service.ts`

**Cambios específicos**:
- En `fetchStudentsByClassroom()` (líneas 51-73), actualizar el mapeo:
  ```typescript
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    lastName: doc.data().lastName,
    document: doc.data().document,
    classroomId: doc.data().classroomId,
    caracter: doc.data().caracter,
    className: doc.data().className,
    classRoom: doc.data().classRoom,
    status: doc.data().status || 'activo' // ← NUEVO
  }));
  ```
- Hacer lo mismo en `fetchStudents()` (líneas 75-96)

**Definition of Done**:
- ✅ Campo `status` se lee correctamente
- ✅ Default a `'activo'` si no existe
- ✅ TypeScript compila sin errores

---

### FASE 3: CAPA DE PRESENTACIÓN - GESTIÓN

#### **Microtarea 3.1: Agregar campo status al formulario de estudiante**
**Tiempo estimado**: 1 hora

**Objetivo**: Agregar select de estado en `StudentFormV2`

**Archivos a modificar**:
1. `src/presentation/components/studentForm/StudentFormV2.tsx`

**Cambios específicos**:
- En la línea 281 (después del campo "Modo de Evaluación"), agregar:
  ```tsx
  {/* Estado del Estudiante - Solo en modo edición */}
  {mode === 'edit' && (
    <div className="md:col-span-2">
      <Select
        name="status"
        label="Estado del Estudiante"
        placeholder="Seleccione estado"
        options={[
          { value: 'activo', label: 'Activo' },
          { value: 'retirado', label: 'Retirado' },
          { value: 'expulsado', label: 'Expulsado' },
          { value: 'inactivo', label: 'Inactivo' },
          { value: 'suspendido', label: 'Suspendido' },
          { value: 'graduado', label: 'Graduado' },
          { value: 'transferido', label: 'Transferido' },
        ]}
        value={formData.status || 'activo'}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.status ? errors.status : undefined}
      />
      <p className="mt-1.5 text-xs text-light-gray-500">
        Los estudiantes con estado diferente a <strong>Activo</strong> no aparecerán en las vistas operativas.
      </p>
    </div>
  )}
  ```

**Definition of Done**:
- ✅ Select de estado visible solo en modo edición
- ✅ Campo funciona con el hook del formulario
- ✅ Mensaje explicativo presente
- ✅ TypeScript compila sin errores

---

#### **Microtarea 3.2: Actualizar hook useStudentFormV2 para manejar status**
**Tiempo estimado**: 1 hora

**Objetivo**: Agregar validación y manejo del campo `status` en el hook del formulario

**Archivos a modificar**:
1. `src/presentation/components/studentForm/hooks/useStudentFormV2.ts`

**Cambios específicos**:
- Agregar `status` al estado inicial del formulario
- Agregar `status` a la interfaz `StudentFormData` si no existe
- Incluir `status` en el payload de creación/edición
- En modo `create`, establecer default `'activo'`
- En modo `edit`, cargar el status existente

**Definition of Done**:
- ✅ Campo `status` se maneja correctamente
- ✅ Validación no requerida (campo opcional)
- ✅ Default a `'activo'` en creación
- ✅ TypeScript compila sin errores

---

#### **Microtarea 3.3: Agregar columna de estado en tabla de estudiantes**
**Tiempo estimado**: 45 minutos

**Objetivo**: Mostrar estado actual en la lista de estudiantes

**Archivos a modificar**:
1. `src/presentation/features/students/StudentsList.tsx`

**Cambios específicos**:
- Después de la columna "Evaluación" (línea 152), agregar nueva columna:
  ```tsx
  {
    key: "status",
    label: "Estado",
    render: (row: Student) => {
      const status = row.status || 'activo';
      const colorMap = {
        activo: 'bg-green-50 text-green-700 border-green-200',
        retirado: 'bg-gray-50 text-gray-700 border-gray-200',
        expulsado: 'bg-red-50 text-red-700 border-red-200',
        inactivo: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        suspendido: 'bg-orange-50 text-orange-700 border-orange-200',
        graduado: 'bg-blue-50 text-blue-700 border-blue-200',
        transferido: 'bg-purple-50 text-purple-700 border-purple-200',
      };
      const labelMap = {
        activo: 'Activo',
        retirado: 'Retirado',
        expulsado: 'Expulsado',
        inactivo: 'Inactivo',
        suspendido: 'Suspendido',
        graduado: 'Graduado',
        transferido: 'Transferido',
      };

      return (
        <span className={`
          inline-flex items-center px-2.5 py-1
          text-xs font-semibold rounded-full border
          ${colorMap[status as keyof typeof colorMap]}
        `}>
          {labelMap[status as keyof typeof labelMap]}
        </span>
      );
    }
  },
  ```

**Definition of Done**:
- ✅ Columna "Estado" visible en la tabla
- ✅ Badge con color correcto según estado
- ✅ Default a 'activo' si no existe
- ✅ TypeScript compila sin errores

---

### FASE 4: CAPA DE PRESENTACIÓN - FILTRADO AUTOMÁTICO

#### **Microtarea 4.1: Aplicar filtro de activos en GradeManager (notas)**
**Tiempo estimado**: 30 minutos

**Objetivo**: Filtrar solo estudiantes activos en la vista de notas

**Archivos a modificar**:
1. `src/presentation/components/notes/GradeManager.tsx`

**Cambios específicos**:
- Cambiar import en línea 4:
  ```typescript
  import {
    fetchActiveStudentsByClassroom, // ← CAMBIO
    bulkSaveStudents
  } from '../../../infrastructure/student.service';
  ```
- Cambiar línea 65:
  ```typescript
  // Solo cargar estudiantes activos (excluye retirados, expulsados, etc.)
  const data = await fetchActiveStudentsByClassroom(classroomId);
  ```

**Definition of Done**:
- ✅ Vista de notas muestra solo estudiantes activos
- ✅ No se afectan otras funcionalidades
- ✅ TypeScript compila sin errores
- ✅ **CRÍTICO**: No tocar lógica de guardado de notas

---

#### **Microtarea 4.2: Aplicar filtro de activos en PromotionManager**
**Tiempo estimado**: 30 minutos

**Objetivo**: Filtrar solo estudiantes activos en la promoción

**Archivos a modificar**:
1. `src/presentation/features/students/PromotionManager.tsx`

**Cambios específicos**:
- Cambiar import en línea 4:
  ```typescript
  import { fetchActiveStudentsByClassroom } from '../../../infrastructure/student.service';
  ```
- Cambiar línea 74:
  ```typescript
  // Solo contar estudiantes activos para promoción
  const students = await fetchActiveStudentsByClassroom(classroom.id);
  ```

**Definition of Done**:
- ✅ Promoción cuenta solo estudiantes activos
- ✅ Lógica de promoción no afectada
- ✅ TypeScript compila sin errores

---

#### **Microtarea 4.3: Aplicar filtro de activos en vistas de profesores**
**Tiempo estimado**: 30 minutos

**Objetivo**: Filtrar estudiantes activos en vistas de profesores

**Archivos a modificar**:
1. `src/presentation/features/teacher/ClassroomStudents.tsx`

**Cambios específicos**:
- Localizar el import de `fetchStudentsByClassroom`
- Cambiar a `fetchActiveStudentsByClassroom`
- Actualizar la llamada correspondiente
- Agregar comentario explicativo

**Definition of Done**:
- ✅ Profesores ven solo estudiantes activos
- ✅ No se afecta funcionalidad existente
- ✅ TypeScript compila sin errores

---

#### **Microtarea 4.4: Aplicar filtro de activos en lista de asistencia**
**Tiempo estimado**: 30 minutos

**Objetivo**: Filtrar estudiantes activos en asistencia

**Archivos a modificar**:
1. `src/presentation/features/attendance/AttendanceList.tsx`

**Cambios específicos**:
- Localizar el import de `fetchStudentsByClassroom`
- Cambiar a `fetchActiveStudentsByClassroom`
- Actualizar la llamada correspondiente
- Agregar comentario explicativo

**Definition of Done**:
- ✅ Asistencia muestra solo estudiantes activos
- ✅ No se afecta funcionalidad existente
- ✅ TypeScript compila sin errores

---

### FASE 5: DOCUMENTACIÓN Y VALIDACIÓN

#### **Microtarea 5.1: Documentar cambios y crear guía de uso**
**Tiempo estimado**: 1 hora

**Objetivo**: Crear documentación clara del sistema de estados

**Archivos a modificar**:
1. Crear nuevo archivo: `STUDENT_STATUS_GUIDE.md`

**Cambios específicos**:
- Documentar todos los estados disponibles
- Explicar dónde aparecen/no aparecen estudiantes según estado
- Casos de uso para cada estado
- Instrucciones para cambiar estado
- Advertencias sobre datos históricos

**Definition of Done**:
- ✅ Documento markdown completo
- ✅ Ejemplos claros
- ✅ Guía de migración si es necesario

---

## 📊 RESUMEN DE ESTIMACIONES

| Fase | Microtareas | Tiempo Estimado |
|------|-------------|-----------------|
| **Fase 1**: Dominio | 2 tareas | 1 hora |
| **Fase 2**: Infraestructura | 3 tareas | 1.75 horas |
| **Fase 3**: Presentación (Gestión) | 3 tareas | 2.75 horas |
| **Fase 4**: Presentación (Filtrado) | 4 tareas | 2 horas |
| **Fase 5**: Documentación | 1 tarea | 1 hora |
| **TOTAL** | **13 tareas** | **8.5 horas** |

---

## 🔄 ORDEN DE EJECUCIÓN RECOMENDADO

1. ✅ Ejecutar **Fase 1** completa (Domain)
2. ✅ Ejecutar **Fase 2** completa (Infrastructure)
3. ✅ Ejecutar **Fase 3** completa (Presentation - Gestión)
4. ✅ Ejecutar **Fase 4** completa (Presentation - Filtrado)
5. ✅ Ejecutar **Fase 5** (Documentación)

**IMPORTANTE**: Cada microtarea debe completarse y validarse antes de pasar a la siguiente.

---

## ✅ VALIDACIÓN FINAL

Después de completar todas las microtareas, validar:

1. ✅ Estudiantes nuevos se crean con estado `'activo'` por defecto
2. ✅ Estado puede cambiarse desde el modal de edición
3. ✅ Columna "Estado" visible en tabla de estudiantes
4. ✅ Estudiantes no-activos NO aparecen en:
   - Vista de notas (`/notes`)
   - Promoción de estudiantes (`/classrooms`)
   - Vista de profesores
   - Lista de asistencia
5. ✅ Estudiantes no-activos SÍ aparecen en:
   - Historial académico (`/history`)
   - Gestión de estudiantes (para poder editarlos)
6. ✅ No se afectan módulos protegidos (notas, logros, reportes, informes)
7. ✅ TypeScript compila sin errores
8. ✅ No hay regresiones en funcionalidad existente

---

## 📁 ARCHIVOS CRÍTICOS

Los archivos más críticos para implementar este plan son:

| Archivo | Propósito | Criticidad |
|---------|-----------|------------|
| `src/domain/entities/studentInfo.ts` | Define los tipos de estado (base del sistema) | 🔴 ALTA |
| `src/infrastructure/student.service.ts` | Servicios de persistencia y filtrado (lógica central) | 🔴 ALTA |
| `src/presentation/components/studentForm/StudentFormV2.tsx` | UI para gestionar estados (punto de entrada del usuario) | 🟡 MEDIA |
| `src/presentation/components/notes/GradeManager.tsx` | Filtrado en notas (vista más crítica para profesores) | 🔴 ALTA |
| `src/shared/types/studentManagementTypes.ts` | Constantes para UI (consistencia visual) | 🟢 BAJA |

---

## 🚨 RIESGOS Y MITIGACIONES

### Riesgo 1: Afectar módulos protegidos
**Mitigación**: Solo modificar imports en `GradeManager.tsx`, no tocar lógica de guardado de notas

### Riesgo 2: Estudiantes antiguos sin campo status
**Mitigación**: Usar `status || 'activo'` en todos los puntos de lectura para default seguro

### Riesgo 3: Regresión en promoción de estudiantes
**Mitigación**: Solo cambiar la función de fetch, no tocar lógica de promoción

### Riesgo 4: Datos históricos inconsistentes
**Mitigación**: El historial académico sigue mostrando todos los estudiantes independientemente del estado

---

## 📝 NOTAS DEL ARQUITECTO

1. El campo `status` ya existe en la entidad, solo falta extender los tipos
2. La arquitectura actual es sólida y permite agregar esto sin refactorización mayor
3. El uso de `fetchActiveStudentsByClassroom` como wrapper es limpio y no invasivo
4. No se requiere migración de datos, ya que el default a `'activo'` maneja compatibilidad hacia atrás
5. Los módulos protegidos NO se tocan directamente, solo se cambia el import

---

**Fecha de creación**: 2026-02-12
**Agente ID para continuar**: a2b7e35
**Estado**: ✅ PLAN COMPLETO - LISTO PARA IMPLEMENTACIÓN
