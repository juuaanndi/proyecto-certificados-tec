import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

const esperarUsuarioFirebase = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

api.interceptors.request.use(
  async (config) => {
    let user = auth.currentUser;

    if (!user) {
      user = await esperarUsuarioFirebase();
    }

    if (user) {
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem("firebaseToken", token);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;