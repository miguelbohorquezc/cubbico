  export interface FirebaseUser {
    id?: string;
    accessToken?: string;
    auth?: {
      providerId?: string;
      reloadUserInfo?: {
        localId?: string;
        email?: string;
        passwordHash?: string;
        emailVerified?: boolean;
        passwordUpdatedAt?: number;
      };
      stsTokenManager?: {
        refreshToken?: string;
        accessToken?: string;
        expirationTime?: number;
      };
      tenantId?: string | null;
      uid?: string;
    };
    displayName?: string | null;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    metadata?: {
      createdAt?: string;
      lastLoginAt?: string;
      lastSignInTime?: string;
      creationTime?: string;
    };
    phoneNumber?: string | null;
    photoURL?: string | null;
    proactiveRefresh?: {
      user?: {};
      isRunning?: boolean;
      timerId?: number | null;
      errorBackoff?: number;
    };
    providerData?: Array<{
    }>;
    providerId?: string;
    reloadListener?: null;
    reloadUserInfo?: {
      localId?: string;
      email?: string;
      passwordHash?: string;
      emailVerified?: boolean;
      passwordUpdatedAt?: number;
    };
    stsTokenManager?: {
      refreshToken?: string;
      accessToken?: string;
      expirationTime?: number;
    };
    tenantId?: string | null;
    uid?: string;
    
  }