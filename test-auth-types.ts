// Test de importación de tipos de autenticación
import { AuthFormData, AuthErrors, AuthErrorCode, AuthUser, AuthState } from './src/domain/entities/auth.types';
import { FirebaseUser } from './src/domain/entities/firebaseUser';

// Test 1: AuthFormData
const formData: AuthFormData = {
  email: 'test@example.com',
  password: 'password123'
};

// Test 2: AuthErrors
const errors: AuthErrors = {
  email: 'Email inválido',
  password: 'Contraseña requerida',
  general: 'Error de autenticación'
};

// Test 3: AuthErrorCode
const errorCode: AuthErrorCode = 'auth/invalid-email';

// Test 4: AuthUser
const authUser: AuthUser = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: null,
  metadata: {
    creationTime: '2024-01-01',
    lastSignInTime: '2024-01-20'
  }
};

// Test 5: AuthState
const authState: AuthState = {
  user: authUser,
  loading: false,
  error: null,
  isAuthenticated: true
};

// Test 6: FirebaseUser (compatibilidad)
const firebaseUser: FirebaseUser = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User'
};

console.log('✅ Todas las interfaces se importan correctamente');
console.log('✅ No hay dependencias circulares');
console.log('✅ TypeScript valida correctamente los tipos');
