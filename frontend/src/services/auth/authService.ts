import type { Session } from "../../types/auth/session";
import type { User } from "../../types/auth/user";

const USER_KEY = "snail_user";
const SESSION_KEY = "snail_session";

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

export function logoutUser(): void {
  localStorage.removeItem(
    SESSION_KEY,
  );
}

export function getStoredUser():
  User | null {
  return parseStoredValue<User>(
    USER_KEY,
  );
}

export function getSession():
  Session | null {
  return parseStoredValue<Session>(
    SESSION_KEY,
  );
}

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