"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserRoleAndFiliere } from "../neon/request";

type AuthContextType = {
  user: User | null;
  role: string | null;
  userName: string | null;
  currentFiliereId: string | null;
  filiereName: string | null; // Contient "Accès Total" ou le nom de la filière
  durationYears: number | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  userName: null,
  currentFiliereId: null,
  filiereName: null,
  durationYears: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentFiliereId, setCurrentFiliereId] = useState<string | null>(null);
  const [filiereName, setFiliereName] = useState<string | null>(null);
  const [durationYears, setDurationYears] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoleFromNeon = async (uid: string) => {
    try {
      const data = await getUserRoleAndFiliere(uid);

      if (data) {
        setRole(data.role);
        setUserName(data.userName);
        setCurrentFiliereId(data.filiereId);
        setFiliereName(data.filiereName);
        setDurationYears(data.durationYears);
        console.log(
          `Profil chargé : ${data.userName} [${data.role}] -> ${data.filiereName}`,
        );
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du profil Neon:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchRoleFromNeon(currentUser.uid);
      } else {
        // Réinitialisation complète en cas de déconnexion
        setRole(null);
        setUserName(null);
        setCurrentFiliereId(null);
        setFiliereName(null);
        setDurationYears(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        userName,
        currentFiliereId,
        filiereName,
        durationYears,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
