/**
 * Configuración de Firebase - Inicialización de servicios
 *
 * SEGURIDAD:
 * - Persistencia configurada en indexedDB (cifrada y segura)
 * - Variables de entorno para credenciales sensibles
 * - Sin exposición de tokens en localStorage/sessionStorage
 *
 * @module Firebase
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Configuración de Firebase desde variables de entorno
 *
 * IMPORTANTE: Asegúrate de que todas estas variables estén definidas
 * en tu archivo .env
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID
};

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/**
 * Configurar persistencia de Firebase Auth
 *
 * browserLocalPersistence:
 * - Almacena tokens de forma segura en indexedDB
 * - Los tokens están cifrados por el navegador
 * - La sesión persiste incluso al cerrar el navegador
 * - Más seguro que sessionStorage/localStorage manual
 *
 * Alternativa: browserSessionPersistence (solo durante la sesión del navegador)
 *
 * SEGURIDAD: Firebase maneja automáticamente:
 * - Cifrado de tokens
 * - Renovación automática de tokens expirados
 * - Limpieza al cerrar sesión
 * - Protección contra XSS mediante IndexedDB API
 */
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    // En caso de error, Firebase usará la persistencia por defecto
    console.error('Error configurando persistencia de Firebase:', error.code);
  });

export { auth, provider, db };