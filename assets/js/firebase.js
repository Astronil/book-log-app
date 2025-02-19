import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  remove,
  update,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Load environment variables
async function loadEnvVariables() {
  try {
    const response = await fetch("/.env");
    const text = await response.text();

    // Parse .env file
    const env = {};
    text.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    return env;
  } catch (error) {
    console.error("Error loading environment variables:", error);
    return {};
  }
}

// Initialize Firebase with environment variables
async function initializeFirebase() {
  const env = await loadEnvVariables();

  const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    databaseURL: env.FIREBASE_DATABASE_URL,
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const booksRef = ref(db, "books");

  return { db, booksRef };
}

// Export the initialized Firebase instance
export const firebaseInstance = initializeFirebase();
export { push, onValue, remove, update, ref };
