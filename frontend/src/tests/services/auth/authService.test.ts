import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getSession,
  getStoredUser,
  isAuthenticated,
  loginUser,
  logoutUser,
  registerUser,
  updateUserBalance,
} from "../../../services/auth/authService";

describe("Auth Service", () => {
  it("should register a user with valid data", async () => {
    const user = await registerUser(
      "Luis Eduardo Gonzalez",
      "TEST@EXAMPLE.COM",
      "123456",
    );

    expect(user.fullName).toBe(
      "Luis Eduardo Gonzalez",
    );

    expect(user.email).toBe(
      "test@example.com",
    );

    expect(user.balance).toBe(0);

    expect(user.id).toEqual(
      expect.any(String),
    );

    expect(user.password).not.toBe(
      "123456",
    );
  });

  it("should persist the registered user in localStorage", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    const storedUser =
      getStoredUser();

    expect(storedUser).not.toBeNull();

    expect(storedUser?.email).toBe(
      "test@example.com",
    );

    expect(storedUser?.balance).toBe(
      0,
    );
  });

  it("should normalize the user email before storing it", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "  TEST@EXAMPLE.COM  ",
      "123456",
    );

    const storedUser =
      getStoredUser();

    expect(storedUser?.email).toBe(
      "test@example.com",
    );
  });

  it("should reject registration when the email is already registered", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    await expect(
      registerUser(
        "Another User",
        "TEST@EXAMPLE.COM",
        "654321",
      ),
    ).rejects.toThrow(
      "Ya existe un usuario con ese correo",
    );
  });

  it("should login a registered user with valid credentials", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    const session =
      await loginUser(
        "test@example.com",
        "123456",
      );

    expect(session.email).toBe(
      "test@example.com",
    );

    expect(session.userId).toEqual(
      expect.any(String),
    );

    expect(
      isAuthenticated(),
    ).toBe(true);
  });

  it("should reject login when no user is registered", async () => {
    await expect(
      loginUser(
        "test@example.com",
        "123456",
      ),
    ).rejects.toThrow(
      "Correo o contraseña incorrectos",
    );
  });

  it("should reject login when the password is incorrect", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    await expect(
      loginUser(
        "test@example.com",
        "wrong-password",
      ),
    ).rejects.toThrow(
      "Correo o contraseña incorrectos",
    );
  });

  it("should reject login when the email is incorrect", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    await expect(
      loginUser(
        "another@example.com",
        "123456",
      ),
    ).rejects.toThrow(
      "Correo o contraseña incorrectos",
    );
  });

  it("should persist the active session in localStorage", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    await loginUser(
      "test@example.com",
      "123456",
    );

    const session =
      getSession();

    expect(session).not.toBeNull();

    expect(session?.email).toBe(
      "test@example.com",
    );
  });

  it("should return true when the stored session matches the stored user", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    await loginUser(
      "test@example.com",
      "123456",
    );

    expect(
      isAuthenticated(),
    ).toBe(true);
  });

  it("should return false when there is no active session", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    expect(
      isAuthenticated(),
    ).toBe(false);
  });

  it("should remove the active session on logout", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    await loginUser(
      "test@example.com",
      "123456",
    );

    logoutUser();

    expect(
      getSession(),
    ).toBeNull();

    expect(
      isAuthenticated(),
    ).toBe(false);
  });

  it("should return null and remove a corrupted stored user", () => {
    localStorage.setItem(
      "snail_user",
      "{invalid-json",
    );

    expect(
      getStoredUser(),
    ).toBeNull();

    expect(
      localStorage.getItem(
        "snail_user",
      ),
    ).toBeNull();
  });

  it("should return null and remove a corrupted stored session", () => {
    localStorage.setItem(
      "snail_session",
      "{invalid-json",
    );

    expect(
      getSession(),
    ).toBeNull();

    expect(
      localStorage.getItem(
        "snail_session",
      ),
    ).toBeNull();
  });

  it("should return false when the stored session is corrupted", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    localStorage.setItem(
      "snail_session",
      "{invalid-json",
    );

    expect(
      isAuthenticated(),
    ).toBe(false);

    expect(
      localStorage.getItem(
        "snail_session",
      ),
    ).toBeNull();
  });

  it("should return false when the stored user is corrupted", () => {
    localStorage.setItem(
      "snail_user",
      "{invalid-json",
    );

    localStorage.setItem(
      "snail_session",
      JSON.stringify({
        userId: "user-123",
        email:
          "test@example.com",
      }),
    );

    expect(
      isAuthenticated(),
    ).toBe(false);

    expect(
      localStorage.getItem(
        "snail_user",
      ),
    ).toBeNull();

    expect(
      localStorage.getItem(
        "snail_session",
      ),
    ).toBeNull();
  });

  it("should invalidate the session when the userId does not match the stored user", async () => {
    const user =
      await registerUser(
        "Luis Eduardo Gonzalez",
        "test@example.com",
        "123456",
      );

    localStorage.setItem(
      "snail_session",
      JSON.stringify({
        userId:
          "different-user-id",
        email:
          user.email,
      }),
    );

    expect(
      isAuthenticated(),
    ).toBe(false);

    expect(
      getSession(),
    ).toBeNull();
  });

  it("should invalidate the session when the email does not match the stored user", async () => {
    const user =
      await registerUser(
        "Luis Eduardo Gonzalez",
        "test@example.com",
        "123456",
      );

    localStorage.setItem(
      "snail_session",
      JSON.stringify({
        userId:
          user.id,
        email:
          "another@example.com",
      }),
    );

    expect(
      isAuthenticated(),
    ).toBe(false);

    expect(
      getSession(),
    ).toBeNull();
  });

  it("should invalidate the session when the stored user does not exist", () => {
    localStorage.setItem(
      "snail_session",
      JSON.stringify({
        userId:
          "user-123",
        email:
          "test@example.com",
      }),
    );

    expect(
      isAuthenticated(),
    ).toBe(false);

    expect(
      getSession(),
    ).toBeNull();
  });

  it("should update and persist the user balance", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    const updatedUser =
      updateUserBalance(500);

    expect(
      updatedUser.balance,
    ).toBe(500);

    expect(
      getStoredUser()?.balance,
    ).toBe(500);
  });

  it("should accumulate multiple balance updates", async () => {
    await registerUser(
      "Luis Eduardo Gonzalez",
      "test@example.com",
      "123456",
    );

    updateUserBalance(500);

    const updatedUser =
      updateUserBalance(250);

    expect(
      updatedUser.balance,
    ).toBe(750);
  });

  it("should throw an error when updating balance without a registered user", () => {
    expect(() =>
      updateUserBalance(500),
    ).toThrow(
      "No existe un usuario registrado",
    );
  });
});