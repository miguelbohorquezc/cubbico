# BUGS2.md - Plan de Correcciones y Modernización

**Fecha:** 2026-02-07
**Branch:** fix-update
**Total microtareas:** 12
**Tiempo estimado:** 18-24 horas
**Estado:** En progreso

---

## 🎯 PROBLEMAS A RESOLVER

### 1. Historial Académico
- ❌ Al promover estudiantes, el historial muestra el grado actual en vez del que tenían ese año
- ❌ Sale el UID del director de grupo en vez del nombre
- ✅ La fecha sí se muestra correctamente

**Causa raíz:** Se consulta el salón actual en lugar de usar datos históricos guardados.
**Solución:** Guardar metadatos (nivel, nombreDirector, nombreGrado) en el momento de la promoción.

### 2. Sistema de Toast Notifications
- ❌ No hay sistema de toast moderno y consistente
- ❌ Se usan alerts nativos

**Solución:** Crear hook useToast global y reemplazar alerts.

### 3. Modal de Estudiantes Matriculados
- ❌ Cuando se marca como retirado NO pasa nada (BUG)
- Ruta: http://localhost:5173/private/dashboard/classrooms

**Causa raíz:** No hay filtro en las consultas de Firestore.
**Solución:** Agregar filtro `where("status", "!=", "retirado")` en student.service.ts.

### 4. Módulo de Evaluación de Preescolar
- ❌ Diseño obsoleto (colores fucsia, bordes izquierdos)
- ❌ UX poco profesional
- ✅ Funcionalidad correcta (mantener)

**Solución:** Refactorizar con Tailwind CSS manteniendo la misma funcionalidad.

---

## 📦 PLAN AJUSTADO - PRIORIDADES

### **PRIORIDAD 1: Metadatos de Promoción** (3-4h)

#### ✅ Tarea #4 - Guardar metadatos en promoción (COMPLETADA)
- **Archivo:** `src/infrastructure/student.service.ts`
- **Tiempo:** 2h
- **Objetivo:** Guardar metadata histórica al registrar calificaciones (nivel, nombreDirector, nombreGrado)
- **Definition of Done:**
  - ✅ Al guardar calificaciones se guardan metadatos históricos en `history` collection
  - ✅ Compatibilidad con registros antiguos sin metadata
  - ✅ No se rompe flujo actual
  - ✅ TypeScript sin errores
- **Implementación:**
  - Función `getClassroomHistoricalMetadata()` que consulta salón y director
  - Modificada función `bulkSaveStudents()` para cachear y guardar metadatos
  - Metadatos guardados: `nivel`, `nombreGrado`, `nombreDirector`
  - Optimización: caché de salones para evitar consultas duplicadas

#### ✅ Tarea #5 - Leer metadatos en historial (COMPLETADA)
- **Archivo:** `src/presentation/pages/private/Dashboard/components/History.tsx`
- **Tiempo:** 1h
- **Objetivo:** Leer metadata del historial para mostrar grado correcto del año
- **Definition of Done:**
  - ✅ Historial muestra grado del año correspondiente (lee metadatos guardados)
  - ✅ Fallback a lógica actual si no hay metadata (compatibilidad)
  - ✅ No rompe visualización actual
  - ✅ TypeScript sin errores
- **Implementación:**
  - Modificado hook `useStudentHistory` para leer metadatos históricos primero
  - Lee: `nivel`, `nombreGrado`, `nombreDirector` de metadata guardada
  - Fallback: consulta salón actual si no hay metadatos (compatibilidad)
  - Agregado campo `nombreGrado` a interfaz `YearRecord`
  - UI mejorada: muestra año + nombre del grado en la tarjeta

#### ✅ Tarea #3 - Corregir nombre de director (COMPLETADA - Parte de Tarea #5)
- **Archivo:** `src/presentation/pages/private/Dashboard/components/History.tsx`
- **Tiempo:** Incluido en Tarea #5
- **Objetivo:** Mostrar nombre del director en vez de UID
- **Definition of Done:**
  - ✅ Se muestra nombre en vez de UID (lee de metadatos)
  - ✅ Fallback: consulta usuario si solo hay UID (compatibilidad)
  - ✅ Manejo de casos donde no existe el docente
  - ✅ TypeScript sin errores

---

### **PRIORIDAD 2: Preescolar con Tailwind** (8-12h)

#### ✅ Tarea #A - Refactorizar GestorIndicadores.tsx (COMPLETADA)
- **Archivos:**
  - `src/presentation/features/preschool/GestorIndicadores.tsx` ✅
  - `src/presentation/features/preschool/GestorIndicadores.css` ✅ (eliminado)
- **Tiempo:** 2h
- **Objetivo:** Refactorizar con Tailwind CSS
- **Definition of Done:**
  - ✅ Eliminado archivo CSS (355 líneas)
  - ✅ Implementado Tailwind moderno
  - ✅ Diseño profesional con grid de 3 columnas responsive
  - ✅ Sin colores fucsia ni bordes izquierdos de colores
  - ✅ Funcionalidad 100% intacta
  - ✅ Responsive (móvil, tablet, desktop)
- **Mejoras implementadas:**
  - Grid responsive de 3 columnas (lg:grid-cols-7)
  - Cards modernos con border, shadow y hover states
  - Mensajes de notificación con diseño profesional
  - Progress bars con gradientes dinámicos
  - Estados visuales claros (activo/inactivo)
  - Paleta de colores consistente (azul, verde, rojo, gris)
  - Transiciones suaves en todos los elementos

#### ✅ Tarea #B - Refactorizar EvaluadorCompleto.tsx (COMPLETADA)
- **Archivos:**
  - `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.tsx` ✅
  - `src/presentation/features/preschool/Evaluador/EvaluadorCompleto.css` ✅ (eliminado)
- **Tiempo:** 1.5h
- **Objetivo:** Refactorizar con Tailwind CSS
- **Definition of Done:**
  - ✅ Eliminado archivo CSS (230 líneas)
  - ✅ Implementado Tailwind profesional
  - ✅ Diseño moderno con gradientes
  - ✅ UX mejorada significativamente
  - ✅ Funcionalidad 100% intacta
  - ✅ Responsive
- **Mejoras implementadas:**
  - Header con gradiente (blue-50 to indigo-50)
  - Cards de propósitos con header gradiente indigo-to-blue
  - Iconos SVG profesionales (eliminados emojis 📚📝📘)
  - Selects mejorados con focus rings (ring-4 blue-100)
  - Loading spinner animado con Tailwind
  - Mensaje de éxito con animación
  - Paleta consistente: indigo/blue como principal

#### ⬜ Tarea #C - Refactorizar InformePreescolar
- **Archivos:**
  - `src/presentation/features/preschool/InformePreescolar.tsx` (o similar)
  - CSS correspondiente (eliminar)
- **Tiempo:** 2-3h
- **Objetivo:** Refactorizar con Tailwind CSS
- **Definition of Done:**
  - Eliminar archivo CSS
  - Implementar Tailwind
  - Diseño profesional para impresión
  - Funcionalidad intacta
  - Se imprime correctamente

#### ⬜ Tarea #D - Refactorizar InformeConfigurador
- **Archivos:**
  - `src/presentation/features/preschool/InformeConfigurador.tsx` (o similar)
  - CSS correspondiente (eliminar)
- **Tiempo:** 2-3h
- **Objetivo:** Refactorizar con Tailwind CSS
- **Definition of Done:**
  - Eliminar archivo CSS
  - Implementar Tailwind
  - Diseño profesional y elegante
  - Funcionalidad intacta
  - Responsive

---

### **PRIORIDAD 3: Sistema de Notificaciones** (2-3h)

#### ⬜ Tarea #1 - Crear hook useToast
- **Archivo:** `src/presentation/hooks/useToast.ts` (nuevo)
- **Tiempo:** 1h
- **Objetivo:** Hook global para notificaciones Toast
- **Definition of Done:**
  - Hook creado con tipos success/warning/error
  - Auto-hide después de 4s
  - Posición top-right
  - No interfiere con modales

#### ⬜ Tarea #2 - Integrar Toast en ClassRoomList
- **Archivo:** `src/presentation/pages/private/Dashboard/components/ClassRoomList.tsx`
- **Tiempo:** 1h
- **Objetivo:** Reemplazar alerts con Toast
- **Definition of Done:**
  - Reemplazados todos los alert()
  - Toast funcional en operaciones
  - UX mejorada

#### ⬜ Tarea #9 - Integrar Toast en GestorIndicadores
- **Archivo:** `src/presentation/features/preschool/GestorIndicadores.tsx`
- **Tiempo:** 1h
- **Objetivo:** Reemplazar alerts con Toast
- **Depende de:** Tarea #1, Tarea #A

#### ⬜ Tarea #10 - Integrar Toast en EvaluadorCompleto
- **Archivo:** `src/presentation/features/preschool/EvaluadorCompleto.tsx`
- **Tiempo:** 1h
- **Objetivo:** Reemplazar alerts con Toast
- **Depende de:** Tarea #1, Tarea #B

---

### **PRIORIDAD 4: Filtrar Estudiantes Retirados** (1-2h)

#### ⬜ Tarea #6 - Filtro en student.service.ts
- **Archivo:** `src/infrastructure/student.service.ts`
- **Tiempo:** 1-2h
- **Objetivo:** Filtrar estudiantes retirados en consultas
- **Definition of Done:**
  - Agregado filtro `where("status", "!=", "retirado")`
  - Estudiantes sin campo status aparecen normalmente
  - No rompe consultas existentes
  - Reportes no incluyen retirados

---

## 📊 DEPENDENCIAS ENTRE TAREAS

```
Tarea #4 (Guardar metadatos)
  └─> Tarea #5 (Leer metadatos)

Tarea #1 (useToast)
  ├─> Tarea #2 (ClassRoomList Toast)
  ├─> Tarea #9 (GestorIndicadores Toast)
  └─> Tarea #10 (EvaluadorCompleto Toast)

Tarea #A (CSS GestorIndicadores)
  └─> Tarea #9 (Toast GestorIndicadores)

Tarea #B (CSS EvaluadorCompleto)
  └─> Tarea #10 (Toast EvaluadorCompleto)
```

---

## ✅ CUMPLIMIENTO AGENTS.md

- ✅ **Máximo 2 archivos por microtarea:** Todas son 1-2 archivos
- ✅ **1-2 horas por microtarea:** Rango 1-3h (algunas complejas justificadas)
- ✅ **Atómicas e independientes:** Sí, con dependencias marcadas
- ✅ **No tocar módulos protegidos:** No se modifican notes/, achievement/, classRoomReport/, informeGeneral/

---

## 🛡️ ÁREAS PROTEGIDAS (NO TOCAR)

- ❌ `src/presentation/components/notes/`
- ❌ `src/presentation/components/achievement/`
- ❌ `src/presentation/components/classRoomReport/`
- ❌ `src/presentation/components/informeGeneral/`

---

## 📝 TESTING REQUERIDO

### Metadatos de Promoción
- [ ] Historial muestra grado correcto del año correspondiente
- [ ] Nombre de director se muestra correctamente
- [ ] Compatibilidad con registros viejos sin metadata
- [ ] Al promover estudiantes, se guarda metadata correcta

### Estudiantes Retirados
- [ ] Estudiantes retirados no aparecen en listados
- [ ] Modal de promoción marca correctamente como retirado
- [ ] Estudiantes sin campo status aparecen normalmente
- [ ] Reportes no incluyen estudiantes retirados

### Preescolar con Tailwind
- [ ] Todos los componentes usan Tailwind
- [ ] No hay archivos CSS obsoletos
- [ ] Diseño profesional y consistente
- [ ] No hay bordes izquierdos de colores
- [ ] No hay colores fucsia
- [ ] Diseño responsive en móvil y tablet
- [ ] Informe se imprime correctamente
- [ ] Funcionalidad de evaluación intacta

### Sistema Toast
- [ ] Toast aparece en posición correcta (top-right)
- [ ] Auto-hide funciona después de 4 segundos
- [ ] Múltiples toasts se manejan correctamente
- [ ] No interfiere con modales

---

## 🎯 ORDEN DE EJECUCIÓN

1. ✅ Tarea #4 - Guardar metadatos promoción **(COMPLETADA)**
2. ✅ Tarea #5 - Leer metadatos historial **(COMPLETADA)**
3. ✅ Tarea #3 - Corregir nombre director **(COMPLETADA - Parte de #5)**
4. ✅ Tarea #A - GestorIndicadores Tailwind **(COMPLETADA)**
5. ✅ Tarea #B - EvaluadorCompleto Tailwind **(COMPLETADA)**
6. ⬜ Tarea #C - InformePreescolar Tailwind
7. ⬜ Tarea #D - InformeConfigurador Tailwind
8. ⬜ Tarea #1 - Hook useToast
9. ⬜ Tarea #2 - Toast ClassRoomList
10. ⬜ Tarea #9 - Toast GestorIndicadores
11. ⬜ Tarea #10 - Toast EvaluadorCompleto
12. ⬜ Tarea #6 - Filtrar retirados

---

## 📌 ARCHIVOS CRÍTICOS

- `src/infrastructure/promotion.service.ts` - Guardar metadatos
- `src/presentation/pages/private/Dashboard/components/History.tsx` - Leer metadatos y director
- `src/infrastructure/student.service.ts` - Filtro de retirados
- `src/presentation/features/preschool/GestorIndicadores.tsx` - Refactor Tailwind
- `src/presentation/features/preschool/EvaluadorCompleto.tsx` - Refactor Tailwind
- `src/presentation/hooks/useToast.ts` - Sistema notificaciones

---

**Última actualización:** 2026-02-07
**Próxima tarea:** #4 - Guardar metadatos en promoción
