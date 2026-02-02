# Sistema de Bloques Horarios Personalizables

## Descripción General

El sistema de bloques horarios personalizables permite al Coordinador configurar bloques de tiempo con:

- **Hora de inicio flexible**: intervalos de 10 minutos (8:10, 8:20, 8:30, etc.)
- **Duración variable**: 40, 45, 50 o 60 minutos
- **Bloques específicos por día**: diferentes bloques para viernes vs lunes-jueves
- **Visualización mejorada**: celdas más grandes (72px) en el horario

## Acceso

1. Iniciar sesión como **Coordinador**
2. Ir al menú lateral → **Horario** → **Configurar Bloques**

## Configuración de Bloques

### Vista de Bloques por Defecto (Lunes - Jueves)

Esta vista muestra los bloques que aplican de lunes a jueves.

#### Agregar un Bloque

1. En el formulario de la izquierda, configure:
   - **Hora de inicio**: seleccione la hora (ej: 08:10)
   - **Duración**: seleccione 40, 45, 50 o 60 minutos
   - **Etiqueta** (opcional): ej: "Bloque 1", "Primera Hora"
   - **Días aplicables**: seleccione uno o más días (L, M, Mi, J, V)
   - **Es descanso**: marque si es un bloque de descanso (no asignable)

2. Vea la **vista previa** del bloque en tiempo real

3. Haga clic en **Agregar**

#### Validaciones Automáticas

El sistema valida:
- ✓ Formato de hora correcto
- ✓ Duración válida
- ✓ Al menos un día seleccionado
- ✓ **No hay solapamientos** con otros bloques

Si hay un error, verá un mensaje explicativo en rojo.

#### Editar un Bloque

1. En la lista de bloques configurados (columna derecha), haga clic en el ícono **Editar** (lápiz)
2. Modifique los campos necesarios
3. Haga clic en **Actualizar**

#### Eliminar un Bloque

1. Haga clic en el ícono **Eliminar** (papelera)
2. Confirme la eliminación

### Vista de Bloques Especiales (Viernes)

Esta pestaña permite configurar bloques diferentes para el día viernes.

**Ejemplo de uso**: Si los viernes tienen horario reducido o bloques de diferente duración.

### Vista Previa Semanal

En la parte inferior de la página, encontrará una tabla que muestra:
- Todos los bloques configurados
- Organización por día de la semana
- Hora de inicio y fin de cada bloque
- Duración de cada bloque

Esta vista previa le permite verificar que no hay conflictos antes de usar los bloques en el horario.

## Uso en el Editor de Horarios

Una vez configurados los bloques:

1. Vaya a **Horario** → **Editor de Horarios**
2. El sistema detectará automáticamente sus bloques personalizados
3. Verá las horas configuradas en la columna izquierda de la tabla
4. Junto a cada hora aparecerá la duración: **(45min)**
5. Las celdas serán más grandes (72px) para mejor legibilidad

### Compatibilidad Total

✓ Los bloques se convierten automáticamente al formato compatible con asistencias
✓ Las URLs de navegación funcionan correctamente
✓ Las asistencias existentes **NO se afectan**
✓ El sistema soporta tanto bloques personalizados como el formato anterior

## Migración Automática

Si es la primera vez que accede al gestor de bloques:

1. El sistema generará automáticamente bloques por defecto basados en `TIME_SLOTS`
2. Cada bloque tendrá 45 minutos de duración
3. Se aplicarán de lunes a viernes
4. Puede editarlos o eliminarlos según necesidad

## Guardado Automático

Los cambios se guardan automáticamente en Firestore después de 2 segundos de inactividad.

Verá mensajes de confirmación:
- ✓ **"Configuración guardada exitosamente"** (verde)
- ✗ **"Error al guardar configuración"** (rojo)

## Ejemplos de Configuración

### Ejemplo 1: Bloques de 45 minutos con intervalos de 10 minutos

```
8:10 - 8:55 (45 min) - Bloque 1
9:05 - 9:50 (45 min) - Bloque 2
10:30 - 11:15 (45 min) - Bloque 3 (después de descanso)
```

### Ejemplo 2: Viernes con horario reducido

**Lunes - Jueves:**
```
7:30 - 8:20 (50 min)
8:30 - 9:20 (50 min)
...
```

**Viernes:**
```
7:30 - 8:10 (40 min)
8:20 - 9:00 (40 min)
...
```

### Ejemplo 3: Bloques con descansos

```
8:00 - 8:45 (45 min) - Bloque 1
8:55 - 9:40 (45 min) - Bloque 2
9:40 - 10:00 (20 min) - DESCANSO (marcado como "es descanso")
10:00 - 10:45 (45 min) - Bloque 3
```

## Solución de Problemas

### "Conflicto: se solapa con..."

**Causa**: Está intentando crear un bloque que se solapa en tiempo con otro bloque existente en los mismos días.

**Solución**:
1. Verifique la hora de inicio y duración
2. Asegúrese de que no se solapen
3. O modifique los días aplicables

### "Duración debe ser una de: 40, 45, 50, 60 minutos"

**Causa**: La duración seleccionada no es válida.

**Solución**: Use solo las duraciones permitidas en el selector.

### "Debe seleccionar al menos un día de la semana"

**Causa**: No hay días seleccionados.

**Solución**: Haga clic en al menos uno de los botones: L, M, Mi, J, V

## Arquitectura Técnica

### Compatibilidad con Sistema Existente

El campo `hora: string` en `ScheduleSlot` y `AttendanceRecord` **NO se modifica**.

**Conversión transparente**:
```
TimeBlock { startTime: "08:10", duration: 45 }
    ↓
ScheduleSlot.hora = "8:10"
    ↓
AttendanceRecord.hora = "8:10"
    ↓
URL: /asistencia/.../8:10 (encodeURIComponent)
```

### Estructura de Datos

```typescript
interface TimeBlock {
  id: string;              // UUID único
  startTime: string;       // "08:10"
  duration: number;        // 45
  label?: string;          // "Bloque 1"
  isBreak?: boolean;       // false
  daysOfWeek: number[];    // [0,1,2,3,4] = L-V
}
```

### Almacenamiento

- **Colección Firestore**: `time-blocks`
- **Documento por año**: `time-blocks/2025`
- **Permisos**:
  - Lectura: todos los usuarios autenticados
  - Escritura: solo Coordinador

## Preguntas Frecuentes

### ¿Puedo tener bloques de diferentes duraciones el mismo día?

Sí, siempre que no se solapen en tiempo.

### ¿Qué pasa con las asistencias ya registradas?

Las asistencias existentes **NO se afectan**. El sistema es 100% compatible hacia atrás.

### ¿Puedo volver al sistema anterior?

Sí, simplemente elimine todos los bloques personalizados y el sistema usará `TIME_SLOTS` por defecto.

### ¿Cuántos bloques puedo crear?

No hay límite técnico, pero se recomienda máximo 15-20 bloques por día para mantener la legibilidad.

### ¿Los docentes pueden modificar los bloques?

No, solo el Coordinador tiene acceso al gestor de bloques. Los docentes solo ven el horario resultante.

## Soporte

Para reportar problemas o solicitar funcionalidades adicionales, contacte al equipo de desarrollo de Cubbico SIA.
