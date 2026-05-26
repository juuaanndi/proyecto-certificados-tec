import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtG4o_Ogs_vLufPpL76Dmc-z7Spj1t1t0",
  authDomain: "air-tec.firebaseapp.com",
  projectId: "air-tec",
  storageBucket: "air-tec.firebasestorage.app",
  messagingSenderId: "228937302523",
  appId: "1:228937302523:web:bd288aa94bf9e66a404b5e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);