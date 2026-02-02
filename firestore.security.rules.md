# Reglas de Seguridad de Firestore para Time Blocks

## Reglas a Agregar

Agregue las siguientes reglas a su archivo `firestore.rules` en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ... (reglas existentes) ...

    // ================================================
    // TIME BLOCKS - Configuración de bloques horarios
    // ================================================

    /**
     * Colección: time-blocks
     * Documento: año académico (ej: "2025")
     *
     * Permisos:
     * - Lectura: Todos los usuarios autenticados
     * - Escritura: Solo Coordinador
     */
    match /time-blocks/{year} {
      // Permitir lectura a todos los usuarios autenticados
      allow read: if request.auth != null;

      // Permitir escritura solo a coordinadores
      allow write: if request.auth != null
                   && exists(/databases/$(database)/documents/users/$(request.auth.uid))
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Coordinador';
    }
  }
}
```

## Explicación de las Reglas

### Lectura (read)
- **Requisito**: Usuario autenticado (`request.auth != null`)
- **Razón**: Tanto docentes como coordinadores necesitan leer la configuración de bloques para mostrar el horario correctamente

### Escritura (write)
- **Requisitos**:
  1. Usuario autenticado
  2. Documento del usuario existe en la colección `users`
  3. El campo `role` del usuario es `'Coordinador'`
- **Razón**: Solo el coordinador debe poder modificar la configuración de bloques horarios

## Validación de Datos (Opcional - Recomendado)

Para mayor seguridad, puede agregar validaciones de esquema:

```javascript
match /time-blocks/{year} {
  allow read: if request.auth != null;

  allow create, update: if request.auth != null
                        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Coordinador'
                        && request.resource.data.keys().hasAll(['year', 'blocks', 'defaultBlocks', 'specialDayBlocks', 'createdAt', 'updatedAt'])
                        && request.resource.data.year is string
                        && request.resource.data.blocks is list
                        && request.resource.data.defaultBlocks is list
                        && request.resource.data.specialDayBlocks is map
                        && request.resource.data.createdAt is string
                        && request.resource.data.updatedAt is string;

  allow delete: if request.auth != null
                && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Coordinador';
}
```

## Validación de Bloques Individuales (Avanzado)

Si desea validar cada bloque dentro del array:

```javascript
// Función auxiliar para validar un bloque
function isValidBlock(block) {
  return block.keys().hasAll(['id', 'startTime', 'duration', 'daysOfWeek'])
      && block.id is string
      && block.startTime is string
      && block.startTime.matches('^[0-2][0-9]:[0-5][0-9]$')  // Formato HH:mm
      && block.duration is int
      && block.duration in [40, 45, 50, 60]
      && block.daysOfWeek is list
      && block.daysOfWeek.size() > 0
      && block.daysOfWeek.size() <= 5;
}

match /time-blocks/{year} {
  allow read: if request.auth != null;

  allow write: if request.auth != null
               && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Coordinador'
               && request.resource.data.blocks.hasAll(isValidBlock);  // Validar todos los bloques
}
```

## Testing de Reglas

Puede probar las reglas en Firebase Console:

### Test 1: Usuario No Autenticado
```javascript
// Debe FALLAR
get(/databases/(default)/documents/time-blocks/2025)
Auth: null
```

### Test 2: Docente Autenticado (Lectura)
```javascript
// Debe PASAR
get(/databases/(default)/documents/time-blocks/2025)
Auth: { uid: 'docente-123' }
```

### Test 3: Docente Intentando Escribir
```javascript
// Debe FALLAR
update(/databases/(default)/documents/time-blocks/2025, {...})
Auth: { uid: 'docente-123' }
```

### Test 4: Coordinador Escribiendo
```javascript
// Debe PASAR
update(/databases/(default)/documents/time-blocks/2025, {...})
Auth: { uid: 'coordinador-123' }
(Assuming users/coordinador-123 has role: 'Coordinador')
```

## Aplicar las Reglas

### Opción 1: Firebase Console
1. Ir a Firebase Console → Firestore Database
2. Click en pestaña "Rules"
3. Agregar las reglas arriba
4. Click en "Publish"

### Opción 2: Firebase CLI
```bash
# Editar firestore.rules
nano firestore.rules

# Desplegar
firebase deploy --only firestore:rules
```

## Notas Importantes

⚠️ **IMPORTANTE**: Antes de aplicar en producción:

1. **Backup**: Descargue una copia de sus reglas actuales
2. **Testing**: Pruebe las reglas en el simulador de Firebase Console
3. **Staging**: Si tiene un entorno de staging, pruebe allí primero
4. **Monitor**: Después de desplegar, monitoree los logs de Firebase por 24 horas para detectar accesos denegados inesperados

## Compatibilidad

Estas reglas son compatibles con:
- Firebase Firestore v9+
- Firestore Security Rules v2
- Todas las versiones del SDK de Firebase usado en Cubbico

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Causa**: El usuario no cumple con los requisitos de la regla

**Soluciones**:
1. Verificar que el usuario esté autenticado
2. Verificar que el documento `users/{uid}` exista
3. Verificar que el campo `role` sea `'Coordinador'`

### Error: "Property X is undefined"

**Causa**: La validación de esquema espera un campo que no está presente

**Solución**: Asegúrese de que todos los campos requeridos estén en `request.resource.data`

## Recursos Adicionales

- [Documentación Oficial de Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Guía de Testing de Reglas](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Ejemplos de Reglas Comunes](https://firebase.google.com/docs/firestore/security/rules-conditions)
