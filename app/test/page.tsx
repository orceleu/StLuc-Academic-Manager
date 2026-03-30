"use client";

import { v4 as uuidv4 } from "uuid"; // Génération côté client
import { createUser } from "../neon/request";

export default function RegisterForm() {
  const handleSubmit = async (formData: FormData) => {
    // 1. Génération de l'ID sur le client
    const newId = uuidv4();

    // 2. Préparation des données
    const userData = {
      id: newId,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: "teacher" as const,
    };

    // 3. Envoi à la Server Action
    const result = await createUser(userData);

    if (result.success) {
      console.log("Utilisateur créé avec l'ID:", newId);
    }
  };

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="Nom" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Créer</button>
    </form>
  );
}
