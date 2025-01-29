import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'hoodlink-64bdb',
        appId: '1:289130921884:web:bf2819f1961e39d9ef5259',
        storageBucket: 'hoodlink-64bdb.firebasestorage.app',
        apiKey: 'AIzaSyBaH2LpgO0V4fgEooTeGmgA6sCldcDIarM',
        authDomain: 'hoodlink-64bdb.firebaseapp.com',
        messagingSenderId: '289130921884',
        measurementId: 'G-MRQSWTTSDZ',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
