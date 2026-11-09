import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'id';
export const db = getDatabase(app);
export function userSiap() {
    return new Promise(function (ok) { var off = onAuthStateChanged(auth, function (u) { off(); ok(u); }); });
}
export { ref, get, query, orderByChild, limitToLast, update, set, remove, push, increment, onValue, onDisconnect, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, verifyPasswordResetCode, confirmPasswordReset, updateProfile, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
