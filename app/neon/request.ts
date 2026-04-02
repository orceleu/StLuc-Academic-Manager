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
export async function addStudent(name: string, matricule: string) {
  try {
    // Génération d'un ID unique (si tu n'utilises pas SERIAL en SQL)
    const id = crypto.randomUUID();

    await sql`
      INSERT INTO students (id, name, matricule)
      VALUES (${id}, ${name}, ${matricule})
    `;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur ajout étudiant:", error);
    // Gestion spécifique de l'erreur d'unicité du matricule
    if (error.message.includes("unique constraint")) {
      return { success: false, error: "Ce matricule est déjà utilisé." };
    }
    return {
      success: false,
      error: "Une erreur est survenue lors de l'ajout.",
    };
  }
}
export async function registerAndEnrollStudent(formData: {
  name: string;
  matricule: string;
  filiere_id: string;
  academic_year_id: string;
  session_id: string;
}) {
  const studentId = crypto.randomUUID();
  const enrollmentId = crypto.randomUUID();
  // Si le matricule est vide, on envoie null à la DB
  const cleanMatricule =
    formData.matricule?.trim() === "" ? null : formData.matricule;
  try {
    // 1. Ouvrir la transaction
    await sql`BEGIN`;

    // 2. Création de l'étudiant
    await sql`
      INSERT INTO students (id, name, matricule)
      VALUES (${studentId}, ${formData.name}, ${cleanMatricule})
    `;

    // 3. Création de l'enrôlement
    await sql`
      INSERT INTO enrollments (id, student_id, filiere_id, academic_year_id, session_id)
      VALUES (${enrollmentId}, ${studentId}, ${formData.filiere_id}, ${formData.academic_year_id}, ${formData.session_id})
    `;

    // 4. Valider la transaction
    await sql`COMMIT`;

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: any) {
    // 5. En cas d'erreur, on annule TOUT ce qui a été fait au-dessus
    await sql`ROLLBACK`;

    console.error("Erreur Transaction:", error);

    if (error.message.includes("unique constraint")) {
      return { success: false, error: "Le matricule existe déjà." };
    }

    return {
      success: false,
      error: "Échec de l'inscription. Les données n'ont pas été enregistrées.",
    };
  }
}
export async function getTotalStudentsCount() {
  try {
    // La requête renvoie un tableau d'objets, ex: [{ count: "42" }]
    const result = await sql`SELECT COUNT(*) as count FROM students`;

    // On convertit le résultat en nombre (Neon renvoie souvent le count en string)
    return parseInt(result[0].count, 10);
  } catch (error) {
    console.error("Erreur lors du comptage des étudiants:", error);
    return 0;
  }
}
export async function getTotalResponsablesCount() {
  try {
    // La requête renvoie un tableau d'objets, ex: [{ count: "42" }]
    const result = await sql`SELECT COUNT(*) as count FROM responsables`;

    // On convertit le résultat en nombre (Neon renvoie souvent le count en string)
    return parseInt(result[0].count, 10);
  } catch (error) {
    console.error("Erreur lors du comptage des responsables:", error);
    return 0;
  }
}
export async function getTotalCourses() {
  try {
    // La requête renvoie un tableau d'objets, ex: [{ count: "42" }]
    const result = await sql`SELECT COUNT(*) as count FROM courses`;

    // On convertit le résultat en nombre (Neon renvoie souvent le count en string)
    return parseInt(result[0].count, 10);
  } catch (error) {
    console.error("Erreur lors du comptage des responsables:", error);
    return 0;
  }
}
export async function getTotalTeachers() {
  try {
    // La requête renvoie un tableau d'objets, ex: [{ count: "42" }]
    const result =
      await sql`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`;

    // On convertit le résultat en nombre (Neon renvoie souvent le count en string)
    return parseInt(result[0].count, 10);
  } catch (error) {
    console.error("Erreur lors du comptage des responsables:", error);
    return 0;
  }
}
export async function getDetailedStudents() {
  try {
    return await sql`
      SELECT 
        s.id,
        s.name,
        s.matricule,
        s.created_at,
        f.name as filiere_name,
        ay.name as year_name,
        sess.name as session_name
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      LEFT JOIN sessions sess ON e.session_id = sess.id
      ORDER BY s.created_at DESC
    `;
  } catch (error) {
    console.error("Erreur fetch students:", error);
    return [];
  }
}
// 1. Ajouter un Cours de base
export async function addCourse(name: string) {
  const id = crypto.randomUUID();
  await sql`INSERT INTO courses (id, name) VALUES (${id}, ${name})`;
  revalidatePath("/admin/courses");
}

// 2. Offrir un cours (Course Offering)
export async function addCourseOffering(data: {
  course_id: string;
  filiere_id: string;
  year_id: string;
  session_id: string;
  coefficient: number;
}) {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO course_offerings (id, course_id, filiere_id, academic_year_id, session_id, coefficient)
    VALUES (${id}, ${data.course_id}, ${data.filiere_id}, ${data.year_id}, ${data.session_id}, ${data.coefficient})
  `;
  revalidatePath("/admin/courses");
}

// 3. Assigner un professeur
/*export async function assignTeacher(offering_id: string, teacher_id: string) {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO course_assignments (id, course_offering_id, teacher_id)
    VALUES (${id}, ${offering_id}, ${teacher_id})
  `;
  revalidatePath("/admin/courses");
}*/
export async function getCourses() {
  try {
    const courses = await sql`
      SELECT id, name 
      FROM courses 
      ORDER BY name ASC
    `;
    return courses;
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    return []; // Retourne un tableau vide en cas d'erreur pour éviter le crash du .map()
  }
}
export async function getCourseOfferings() {
  try {
    const offerings = await sql`
      SELECT 
        co.id,
        co.coefficient,
        c.name AS course_name,
        f.name AS filiere_name,
        ay.name AS year_name,
        s.name AS session_name
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.id
      JOIN filieres f ON co.filiere_id = f.id
      JOIN academic_years ay ON co.academic_year_id = ay.id
      JOIN sessions s ON co.session_id = s.id
      ORDER BY ay.name DESC, f.name ASC, c.name ASC
    `;

    return offerings;
  } catch (error) {
    console.error("Erreur lors de la récupération des offres de cours:", error);
    // Retourne un tableau vide pour éviter l'erreur .map() sur undefined
    return [];
  }
}
// Dans ton fichier d'actions/requêtes
export async function getTeachers2(userFiliere?: string) {
  // Le '?' rend l'argument optionnel

  return await sql`SELECT * FROM users WHERE role = 'teacher'`;
}
/*export async function assignTeacher(data: {
  offering_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}) {
  // Génération des IDs uniques
  const assignmentId = crypto.randomUUID();
  const scheduleId = crypto.randomUUID();

  try {
    // Début de la transaction
    await sql`BEGIN`;

    // 1. Insertion dans course_assignments
    await sql`
      INSERT INTO course_assignments (id, course_offering_id, teacher_id)
      VALUES (${assignmentId}, ${data.offering_id}, ${data.teacher_id})
    `;

    // 2. Insertion dans course_schedules (liée à l'assignment par assignmentId)
    await sql`
      INSERT INTO course_schedules (
        id, 
        course_assignment_id, 
        day_of_week, 
        start_time, 
        end_time, 
        room
      )
      VALUES (
        ${scheduleId}, 
        ${assignmentId}, 
        ${data.day_of_week.toLowerCase()}, 
        ${data.start_time}, 
        ${data.end_time}, 
        ${data.room}
      )
    `;

    // Validation de la transaction
    await sql`COMMIT`;

    // Rafraîchir les données de la page
    revalidatePath("/dashboard/cours");

    return { success: true };
  } catch (error: any) {
    // En cas d'erreur (ex: conflit d'horaire, erreur réseau), on annule tout
    await sql`ROLLBACK`;

    console.error("Erreur lors de l'assignation:", error);

    return {
      success: false,
      error:
        "L'opération a échoué. Vérifiez que les données sont correctes (ex: l'heure de fin doit être après l'heure de début).",
    };
  }
}
*/
/*export async function assignTeacher(data: {
  offering_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}) {
  const assignmentId = crypto.randomUUID();
  const scheduleId = crypto.randomUUID();

  try {
    // --- ÉTAPE 1 : VÉRIFICATION DES CONFLITS ---

    // On vérifie si le PROF ou la SALLE est déjà pris sur ce créneau
    const conflicts = await sql`
      SELECT s.room, u.name as teacher_name, c.name as course_name
      FROM course_schedules s
      JOIN course_assignments a ON s.course_assignment_id = a.id
      JOIN users u ON a.teacher_id = u.id
      JOIN course_offerings co ON a.course_offering_id = co.id
      JOIN courses c ON co.course_id = c.id
      WHERE s.day_of_week = ${data.day_of_week.toLowerCase()}
      AND (
        (a.teacher_id = ${data.teacher_id}) OR (s.room = ${data.room})
      )
      AND (
        (s.start_time, s.end_time) OVERLAPS (${data.start_time}::TIME, ${data.end_time}::TIME)
      )
    `;

    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      const reason =
        conflict.room === data.room
          ? `la salle ${data.room}`
          : `le professeur ${conflict.teacher_name}`;
      return {
        success: false,
        error: `Conflit détecté : ${reason} est déjà occupé pour le cours "${conflict.course_name}" sur ce créneau.`,
      };
    }

    // --- ÉTAPE 2 : TRANSACTION ---
    await sql`BEGIN`;

    await sql`
      INSERT INTO course_assignments (id, course_offering_id, teacher_id)
      VALUES (${assignmentId}, ${data.offering_id}, ${data.teacher_id})
    `;

    await sql`
      INSERT INTO course_schedules (id, course_assignment_id, day_of_week, start_time, end_time, room)
      VALUES (${scheduleId}, ${assignmentId}, ${data.day_of_week.toLowerCase()}, ${data.start_time}, ${data.end_time}, ${data.room})
    `;

    await sql`COMMIT`;
    revalidatePath("/dashboard/cours");
    return { success: true };
  } catch (error: any) {
    await sql`ROLLBACK`;
    console.error("Erreur assignation:", error);
    return { success: false, error: "Une erreur technique est survenue." };
  }
}*/
export async function assignTeacher(data: {
  offering_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}) {
  const assignmentId = crypto.randomUUID();
  const scheduleId = crypto.randomUUID();

  try {
    // --- ÉTAPE 1 : VÉRIFIER SI UN PROF EST DÉJÀ ASSIGNÉ À CE COURS ---
    const existingAssignment = await sql`
      SELECT id 
      FROM course_assignments 
      WHERE course_offering_id = ${data.offering_id}
      LIMIT 1
    `;

    if (existingAssignment.length > 0) {
      return {
        success: false,
        error: "Ce cours a déjà un professeur assigné.",
      };
    }

    // --- ÉTAPE 2 : VÉRIFICATION DES CONFLITS (prof / salle / horaire) ---
    const conflicts = await sql`
      SELECT s.room, u.name as teacher_name, c.name as course_name
      FROM course_schedules s
      JOIN course_assignments a ON s.course_assignment_id = a.id
      JOIN users u ON a.teacher_id = u.id
      JOIN course_offerings co ON a.course_offering_id = co.id
      JOIN courses c ON co.course_id = c.id
      WHERE s.day_of_week = ${data.day_of_week.toLowerCase()}
      AND (
        (a.teacher_id = ${data.teacher_id}) OR (s.room = ${data.room})
      )
      AND (
        (s.start_time, s.end_time) OVERLAPS (${data.start_time}::TIME, ${data.end_time}::TIME)
      )
    `;

    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      const reason =
        conflict.room === data.room
          ? `la salle ${data.room}`
          : `le professeur ${conflict.teacher_name}`;

      return {
        success: false,
        error: `Conflit détecté : ${reason} est déjà occupé pour le cours "${conflict.course_name}" sur ce créneau.`,
      };
    }

    // --- ÉTAPE 3 : TRANSACTION ---
    await sql`BEGIN`;

    // insertion assignment
    await sql`
      INSERT INTO course_assignments (id, course_offering_id, teacher_id)
      VALUES (${assignmentId}, ${data.offering_id}, ${data.teacher_id})
    `;

    // insertion schedule
    await sql`
      INSERT INTO course_schedules (
        id, 
        course_assignment_id, 
        day_of_week, 
        start_time, 
        end_time, 
        room
      )
      VALUES (
        ${scheduleId}, 
        ${assignmentId}, 
        ${data.day_of_week.toLowerCase()}, 
        ${data.start_time}, 
        ${data.end_time}, 
        ${data.room}
      )
    `;

    await sql`COMMIT`;

    // refresh UI
    revalidatePath("/dashboard/cours");

    return { success: true };
  } catch (error: any) {
    await sql`ROLLBACK`;

    // --- GESTION ERREUR UNIQUE (sécurité DB) ---
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce cours a déjà un professeur assigné.",
      };
    }

    console.error("Erreur assignation:", error);

    return {
      success: false,
      error: "Une erreur technique est survenue.",
    };
  }
}

export async function getFullSchedules() {
  try {
    const schedules = await sql`
      SELECT 
        s.id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.room,
        u.name as teacher_name,
        c.name as course_name,
        f.name as filiere_name,
        sess.name as session_name
      FROM course_schedules s
      JOIN course_assignments a ON s.course_assignment_id = a.id
      JOIN users u ON a.teacher_id = u.id
      JOIN course_offerings co ON a.course_offering_id = co.id
      JOIN courses c ON co.course_id = c.id
      JOIN filieres f ON co.filiere_id = f.id
      JOIN sessions sess ON co.session_id = sess.id
      ORDER BY 
        CASE s.day_of_week
          WHEN 'lundi' THEN 1
          WHEN 'mardi' THEN 2
          WHEN 'mercredi' THEN 3
          WHEN 'jeudi' THEN 4
          WHEN 'vendredi' THEN 5
        END,
        s.start_time ASC
    `;
    return schedules;
  } catch (error) {
    console.error("Erreur fetch schedules:", error);
    return [];
  }
}
export async function getAssignmentsWithSchedules() {
  try {
    return await sql`
      SELECT 
        a.id as assignment_id,
        u.name as teacher_name,
        c.name as course_name,
        f.name as filiere_name,
        ay.name as year_name,
        s.name as session_name,
        sch.day_of_week,
        sch.start_time,
        sch.end_time,
        sch.room
      FROM course_assignments a
      JOIN users u ON a.teacher_id = u.id
      JOIN course_offerings co ON a.course_offering_id = co.id
      JOIN courses c ON co.course_id = c.id
      JOIN filieres f ON co.filiere_id = f.id
      JOIN academic_years ay ON co.academic_year_id = ay.id
      JOIN sessions s ON co.session_id = s.id
      LEFT JOIN course_schedules sch ON sch.course_assignment_id = a.id
      ORDER BY ay.name DESC, f.name ASC, sch.day_of_week ASC
    `;
  } catch (error) {
    console.error("Erreur SQL assignments:", error);
    return [];
  }
}
export async function deleteAssignment(id: string) {
  await sql`DELETE FROM course_assignments WHERE id = ${id}`;
  revalidatePath("/dashboard/cours");
}
export async function getDetailedOfferings() {
  try {
    return await sql`
      SELECT 
        co.id as offering_id,
        c.name as course_name,
        f.name as filiere_name,
        ay.name as year_name,
        s.name as session_name,
        co.coefficient
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.id
      JOIN filieres f ON co.filiere_id = f.id
      JOIN academic_years ay ON co.academic_year_id = ay.id
      JOIN sessions s ON co.session_id = s.id
      ORDER BY ay.name DESC, f.name ASC, s.name ASC
    `;
  } catch (error) {
    console.error("Erreur fetch offerings:", error);
    return [];
  }
}

export async function deleteOffering(id: string) {
  try {
    // Note : Cela échouera si des assignations de profs existent déjà (Contrainte SQL)
    await sql`DELETE FROM course_offerings WHERE id = ${id}`;
    revalidatePath("/dashboard/cours");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        "Impossible de supprimer : ce cours est déjà assigné à un professeur.",
    };
  }
}

export async function getPalmaresData() {
  try {
    // 1. Récupérer tous les étudiants inscrits avec leur filière
    const students = await sql`
      SELECT e.id as enrollment_id, u.name as student_name, f.name as filiere_name, ay.name as year_name
      FROM enrollments e
      JOIN students u ON e.student_id = u.id
      JOIN filieres f ON e.filiere_id = f.id
      JOIN academic_years ay ON e.academic_year_id = ay.id
    `;

    // 2. Récupérer tous les cours (offres) pour créer les colonnes
    const courses = await sql`
      SELECT co.id as offering_id, c.name as course_name, co.coefficient, f.name as filiere_name
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.id
      JOIN filieres f ON co.filiere_id = f.id
    `;

    // 3. Récupérer toutes les notes existantes
    const grades =
      await sql`SELECT id, enrollment_id, course_offering_id, score FROM grades`;

    return { students, courses, grades };
  } catch (error) {
    console.error(error);
    return { students: [], courses: [], grades: [] };
  }
}

export async function saveGrade(
  enrollmentId: string,
  offeringId: string,
  score: number,
) {
  // On utilise ON CONFLICT pour soit insérer, soit mettre à jour la note
  // Note: Nécessite une contrainte UNIQUE(enrollment_id, course_offering_id) sur ta table grades
  await sql`
    INSERT INTO grades (id, enrollment_id, course_offering_id, score)
    VALUES (${crypto.randomUUID()}, ${enrollmentId}, ${offeringId}, ${score})
    ON CONFLICT (enrollment_id, course_offering_id) 
    DO UPDATE SET score = EXCLUDED.score
  `;
  revalidatePath("/dashboard/notes");
}
export async function saveBulkGrades(
  gradesToSave: {
    enrollment_id: string;
    course_offering_id: string;
    score: number;
  }[],
) {
  try {
    for (const item of gradesToSave) {
      await sql`
        INSERT INTO grades (id, enrollment_id, course_offering_id, score)
        VALUES (${crypto.randomUUID()}, ${item.enrollment_id}, ${item.course_offering_id}, ${item.score})
        ON CONFLICT (enrollment_id, course_offering_id) 
        DO UPDATE SET score = EXCLUDED.score
      `;
    }
    revalidatePath("/test");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
