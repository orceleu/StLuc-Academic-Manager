"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./util";
import { v4 as uuidv4 } from "uuid"; // Génération côté client

interface UserInput {
  id: string; // Ajout de l'ID ici
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: "admin" | "responsable" | "teacher";
}

interface FiliereInput {
  id: string;
  name: string;
}

interface ResponsableInput {
  id: string;
  user_id: string;
  filiere_id: string;
}

export async function createUser(data: UserInput) {
  try {
    // On utilise directement data.id reçu du frontend
    await sql`
      INSERT INTO users (id, name, email, phone, password, role)
      VALUES (
        ${data.id}, 
        ${data.name}, 
        ${data.email}, 
        ${data.phone || null}, 
        ${data.password || null}, 
        ${data.role}
      )
    `;

    return { success: true, message: "Utilisateur créé avec succès" };
  } catch (error) {
    console.error("Erreur d'insertion Neon:", error);
    return { success: false, message: "Erreur lors de la création" };
  }
}
/*export async function createFiliere(data: FiliereInput) {
  try {
    await sql`
      INSERT INTO filieres (id, name)
      VALUES (${data.id}, ${data.name})
    `;

    return { success: true, message: "Filière créée avec succès" };
  } catch (error) {
    console.error("Erreur insertion filière:", error);
    return {
      success: false,
      message: "Erreur lors de la création de la filière",
    };
  }
}*/
export async function createResponsable(data: ResponsableInput) {
  try {
    await sql`
      INSERT INTO responsables (id, user_id, filiere_id)
      VALUES (
        ${data.id}, 
        ${data.user_id}, 
        ${data.filiere_id}
      )
    `;

    return { success: true, message: "Responsable assigné avec succès" };
  } catch (error) {
    // Gestion spécifique si l'ID utilisateur ou filière n'existe pas
    console.error("Erreur insertion responsable:", error);
    return {
      success: false,
      message: "Erreur : vérifiez que l'utilisateur et la filière existent.",
    };
  }
}
export async function getUserRoleAndFiliere(uid: string) {
  try {
    // IMPORTANT : Pas de guillemets autour de ${uid}
    // On fait une jointure pour récupérer la filière si l'utilisateur est un responsable
    const result = await sql`
      SELECT u.role, r.filiere_id 
      FROM users u
      LEFT JOIN responsables r ON u.id = r.user_id
      WHERE u.id = ${uid}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      console.log("Aucun utilisateur trouvé pour l'UID:", uid);
      return null;
    } else {
      console.log("ok");
    }

    return {
      role: result[0].role,
      filiere: result[0].filiere_id || null,
    };
  } catch (error) {
    console.error("Erreur fetch role Neon:", error);
    return null;
  }
}
// Fetch Filieres
export async function getFilieres() {
  return await sql`SELECT * FROM filieres ORDER BY name ASC`;
}

// Fetch Responsables (Users + Link to Filiere)
export async function getResponsables() {
  return await sql`
    SELECT u.*, r.filiere_id, f.name as filiere_name 
    FROM users u
    JOIN responsables r ON u.id = r.user_id
    JOIN filieres f ON r.filiere_id = f.id
    WHERE u.role = 'responsable'
  `;
}

// Add Filiere
export async function createFiliere(name: string) {
  const id = uuidv4();
  await sql`INSERT INTO filieres (id, name) VALUES (${id}, ${name})`;
}

// Add Responsable (SQL side)
export async function saveResponsable(data: {
  uid: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  filiereId: string;
}) {
  const respTableId = uuidv4();
  // On insère dans users
  await sql`
    INSERT INTO users (id, name, email, phone, password, role)
    VALUES (${data.uid}, ${data.name}, ${data.email}, ${data.phone}, ${data.password}, 'responsable')
  `;
  // On crée la liaison dans responsables
  await sql`
    INSERT INTO responsables (id, user_id, filiere_id)
    VALUES (${respTableId}, ${data.uid}, ${data.filiereId})
  `;
}

// Update
export async function updateResponsableData(
  uid: string,
  name: string,
  phone: string,
) {
  await sql`UPDATE users SET name = ${name}, phone = ${phone} WHERE id = ${uid}`;
}

// Delete
export async function deleteUser(uid: string) {
  await sql`DELETE FROM users WHERE id = ${uid}`;
}

export async function getTeachers(userFiliere: string) {
  try {
    // Si l'utilisateur est admin (directeur dans ton ancienne logique), on voit tout
    // Sinon, on filtre par la filière du responsable connecté
    if (userFiliere === "admin" || userFiliere === "directeur") {
      return await sql`SELECT * FROM users WHERE role = 'teacher' ORDER BY name ASC`;
    } else {
      // Note: Dans ta structure SQL, la filière du prof est gérée via course_assignments/offerings
      // Mais pour rester fidèle à ton code, on suppose qu'on filtre les profs
      return await sql`SELECT * FROM users WHERE role = 'teacher' AND phone LIKE ${"%" + userFiliere + "%"} ORDER BY name ASC`;
      // Ajustement : Si tu n'as pas de colonne filiere directe dans 'users',
      // il faudra adapter ta table ou faire une jointure.
    }
  } catch (error) {
    console.error("Erreur fetch teachers:", error);
    return [];
  }
}

export async function saveTeacher(data: any) {
  await sql`
    INSERT INTO users (id, name, email, phone, password, role)
    VALUES (${data.uid}, ${data.name}, ${data.email}, ${data.phone}, ${data.password}, 'teacher')
  `;
  revalidatePath("/teachers");
}

export async function updateTeacherData(
  uid: string,
  name: string,
  phone: string,
) {
  await sql`UPDATE users SET name = ${name}, phone = ${phone} WHERE id = ${uid}`;
  revalidatePath("/teachers");
}

export async function deleteTeacherDb(uid: string) {
  await sql`DELETE FROM users WHERE id = ${uid}`;
  revalidatePath("/teachers");
}
// --- ACADEMIC YEARS ---
export async function addAcademicYear(
  name: string,
  startDate: string,
  endDate: string,
) {
  try {
    const id = uuidv4();
    await sql`
      INSERT INTO academic_years (id, name, start_date, end_date)
      VALUES (${id}, ${name}, ${startDate}, ${endDate})
    `;
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de l'ajout de l'année" };
  }
}

// --- SESSIONS ---
export async function addSession(name: string) {
  try {
    const id = uuidv4();
    await sql`
      INSERT INTO sessions (id, name)
      VALUES (${id}, ${name})
    `;
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de l'ajout de la session" };
  }
}
export async function getAcademicYears() {
  try {
    return await sql`SELECT * FROM academic_years ORDER BY start_date DESC`;
  } catch (error) {
    console.error("Erreur fetch years:", error);
    return [];
  }
}

export async function getSessions() {
  try {
    return await sql`SELECT * FROM sessions ORDER BY name ASC`;
  } catch (error) {
    console.error("Erreur fetch sessions:", error);
    return [];
  }
}
export async function deleteSession(id: string) {
  try {
    await sql`DELETE FROM sessions WHERE id = ${id}`;
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error:
        "Impossible de supprimer : la session est peut-être utilisée ailleurs.",
    };
  }
}
