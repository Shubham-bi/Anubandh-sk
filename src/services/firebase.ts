import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const databaseURL =
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
  'https://anubandh-90d1f-default-rtdb.firebaseio.com';

const app = getApps().length === 0
  ? initializeApp({ databaseURL })
  : getApp();

export const rtdb: Database = getDatabase(app);
export { databaseURL };
