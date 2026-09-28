import type { Session } from "../../types/auth/session";
import type { User } from "../../types/auth/user";


const USER_KEY = "snail_user";
const SESSION_KEY = "snail_session";

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data,
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
): Promise<User> {
  const existingUser = getStoredUser();

  if (
    existingUser &&
    existingUser.email.toLowerCase() === email.toLowerCase()
  ) {
    throw new Error("Ya existe un usuario con ese correo");
  }

  const passwordHash = await hashPassword(password);

  const user: User = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password: passwordHash,
    balance: 0,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<Session> {
  const user = getStoredUser();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const passwordHash = await hashPassword(password);

  if (
    user.email !== email.trim().toLowerCase() ||
    user.password !== passwordHash
  ) {
    throw new Error("Correo o contraseña incorrectos");
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

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser) as User;
}

export function getSession(): Session | null {
  const storedSession = localStorage.getItem(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  return JSON.parse(storedSession) as Session;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function updateUserBalance(
  amount: number,
): User {
  const user = getStoredUser();

  if (!user) {
    throw new Error(
      "No existe un usuario registrado",
    );
  }

  const updatedUser: User = {
    ...user,
    balance: user.balance + amount,
  };

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(updatedUser),
  );

  return updatedUser;
}