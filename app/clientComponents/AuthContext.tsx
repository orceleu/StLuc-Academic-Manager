"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/config"; // On garde Firebase pour l'Auth
import { getUserRoleAndFiliere } from "../neon/request";

type AuthContextType = {
  user: User | null;
  role: string | null;
  currentFiliere: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  currentFiliere: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [currentFiliere, setCurrentFiliere] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Remplacement de fetchRole pour utiliser Neon via la Server Action
  const fetchRoleFromNeon = async (uid: string) => {
    try {
      const data = await getUserRoleAndFiliere(uid);

      if (data) {
        setRole(data.role);
        setCurrentFiliere(data.filiere);
        console.log(data.role);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du profil Neon:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Firebase donne l'UID, on va chercher le reste dans Neon
        await fetchRoleFromNeon(currentUser.uid);
      } else {
        setRole(null);
        setCurrentFiliere(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, currentFiliere }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
