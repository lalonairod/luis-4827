import type { Session } from "../../types/auth/session";
import type { User } from "../../types/auth/user";

/**
 * Clave utilizada para almacenar la información
 * del usuario en localStorage.
 */
const USER_KEY = "snail_user";

/**
 * Clave utilizada para almacenar la sesión activa
 * del usuario en localStorage.
 */
const SESSION_KEY = "snail_session";

/**
 * Genera un hash SHA-256 a partir de una contraseña.
 *
 * Esta función se utiliza únicamente para la simulación
 * local de autenticación de la aplicación.
 *
 * @param password - Contraseña en texto plano.
 * @returns El hash SHA-256 de la contraseña en formato hexadecimal.
 */
async function hashPassword(
  password: string,
): Promise<string> {
  const data =
    new TextEncoder().encode(
      password,
    );

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data,
    );

  return Array.from(
    new Uint8Array(hashBuffer),
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
}

/**
 * Obtiene y convierte un valor almacenado en localStorage.
 *
 * Si el valor no existe o contiene información inválida,
 * devuelve null. En caso de JSON corrupto, elimina la
 * entrada correspondiente para evitar errores posteriores.
 *
 * @param key - Clave del valor almacenado.
 * @returns El valor convertido al tipo solicitado o null.
 */
function parseStoredValue<T>(
  key: string,
): T | null {
  const storedValue =
    localStorage.getItem(key);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(
      storedValue,
    ) as T;
  } catch {
    localStorage.removeItem(key);

    return null;
  }
}

/**
 * Registra un nuevo usuario en el almacenamiento local.
 *
 * Normaliza el correo electrónico, genera un identificador
 * único y almacena la contraseña mediante un hash SHA-256.
 *
 * El usuario inicia con saldo igual a cero.
 *
 * @param fullName - Nombre completo del usuario.
 * @param email - Correo electrónico del usuario.
 * @param password - Contraseña utilizada para el registro.
 * @returns El usuario registrado.
 * @throws Error cuando ya existe un usuario con el mismo correo.
 */
export async function registerUser(
  fullName: string,
  email: string,
  password: string,
): Promise<User> {
  const existingUser =
    getStoredUser();

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  if (
    existingUser &&
    existingUser.email.toLowerCase() ===
      normalizedEmail
  ) {
    throw new Error(
      "Ya existe un usuario con ese correo",
    );
  }

  const passwordHash =
    await hashPassword(
      password,
    );

  const user: User = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: passwordHash,
    balance: 0,
  };

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );

  return user;
}

/**
 * Inicia sesión utilizando las credenciales proporcionadas.
 *
 * Verifica el correo y la contraseña contra el usuario
 * almacenado localmente. Cuando las credenciales son válidas,
 * crea y persiste una sesión asociada al usuario.
 *
 * @param email - Correo electrónico del usuario.
 * @param password - Contraseña del usuario.
 * @returns La sesión creada.
 * @throws Error cuando las credenciales no son válidas.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<Session> {
  const user =
    getStoredUser();

  if (!user) {
    throw new Error(
      "Correo o contraseña incorrectos",
    );
  }

  const passwordHash =
    await hashPassword(
      password,
    );

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  if (
    user.email !== normalizedEmail ||
    user.password !== passwordHash
  ) {
    throw new Error(
      "Correo o contraseña incorrectos",
    );
  }

  const session: Session = {
    userId: user.id,
    email: user.email,
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session),
  );

  return session;
}

/**
 * Cierra la sesión activa del usuario.
 *
 * Elimina únicamente la información de sesión y conserva
 * los datos del usuario registrado.
 */
export function logoutUser(): void {
  localStorage.removeItem(
    SESSION_KEY,
  );
}

/**
 * Obtiene el usuario almacenado localmente.
 *
 * @returns El usuario registrado o null cuando no existe
 * información válida.
 */
export function getStoredUser():
  User | null {
  return parseStoredValue<User>(
    USER_KEY,
  );
}

/**
 * Obtiene la sesión activa almacenada localmente.
 *
 * @returns La sesión activa o null cuando no existe
 * información válida.
 */
export function getSession():
  Session | null {
  return parseStoredValue<Session>(
    SESSION_KEY,
  );
}

/**
 * Verifica si existe una sesión válida para el usuario
 * actualmente almacenado.
 *
 * La sesión se considera válida cuando:
 * - Existe un usuario registrado.
 * - Existe una sesión activa.
 * - El identificador de la sesión coincide con el usuario.
 * - El correo de la sesión coincide con el usuario.
 *
 * Si la sesión es inconsistente, se elimina del almacenamiento.
 *
 * @returns true cuando la sesión es válida; false en caso contrario.
 */
export function isAuthenticated():
  boolean {
  const user =
    getStoredUser();

  const session =
    getSession();

  if (!user || !session) {
    if (session) {
      localStorage.removeItem(
        SESSION_KEY,
      );
    }

    return false;
  }

  const validSession =
    session.userId === user.id &&
    session.email === user.email;

  if (!validSession) {
    localStorage.removeItem(
      SESSION_KEY,
    );

    return false;
  }

  return true;
}

/**
 * Actualiza el saldo del usuario almacenado.
 *
 * El monto recibido se suma al saldo actual y el resultado
 * se persiste nuevamente en localStorage.
 *
 * @param amount - Monto que será agregado al saldo.
 * @returns El usuario con el saldo actualizado.
 * @throws Error cuando no existe un usuario registrado.
 */
export function updateUserBalance(
  amount: number,
): User {
  const user =
    getStoredUser();

  if (!user) {
    throw new Error(
      "No existe un usuario registrado",
    );
  }

  const updatedUser: User = {
    ...user,
    balance:
      user.balance + amount,
  };

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(updatedUser),
  );

  return updatedUser;
}