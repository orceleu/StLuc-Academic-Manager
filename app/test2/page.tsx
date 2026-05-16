"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../clientComponents/AuthContext";
import { getFiliereByResponsable } from "../neon/request";

export default function Page() {
  const [filiere, setFiliere] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, durationYears, userName, filiereName } = useAuth();

  useEffect(() => {
    // Si l'utilisateur n'est pas encore chargé, on attend
    if (!user?.uid) return;

    const fetchFiliere = async () => {
      try {
        setLoading(true);
        // 1. On attend la réponse de la fonction asynchrone
        const data = await getFiliereByResponsable(user.uid);
        setFiliere(data);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiliere();
  }, [user?.uid]); // 2. On re-déclenche dès que l'ID de l'utilisateur est disponible

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  if (!filiere) {
    return (
      <div className="p-6 text-center text-red-500">
        Aucune filière associée à ce responsable.
      </div>
    );
  }

  // 3. On affiche la propriété spécifique (.name) au lieu de l'objet entier
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border my-6">
      <h1 className="text-xl font-bold text-gray-800">Filière gérée :</h1>
      <p className="text-lg text-blue-600 font-semibold">{filiereName}</p>
      <p className="text-sm text-gray-500">{userName}</p>
      <p className="text-sm text-gray-500">
        Durée du cycle : {durationYears} ans
      </p>
    </div>
  );
}
