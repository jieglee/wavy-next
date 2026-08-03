export interface RegisterPayload {
    name: string;
    email: string;
    phone?: string;
    password: string;
}

export interface LoginResult {
    ok: boolean;
    role?: string;
    error?: string;
}

export interface VerifyResult {
    verified: boolean;
    message?: string;
}

export interface ResetResult {
    ok: boolean;
    message?: string;
}

interface StoredUser {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
}

const STORAGE_KEY = "wavy_users";
const SESSION_KEY = "wavy_session";

function getUsers(): StoredUser[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredUser[]) : [];
    } catch {
        return [];
    }
}

function saveUsers(users: StoredUser[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function registerUser(
    payload: RegisterPayload
): Promise<{ ok: boolean; message?: string }> {
    const users = getUsers();
    const email = payload.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) {
        return { ok: false, message: "Email sudah terdaftar." };
    }
    users.push({
        name: payload.name.trim(),
        email,
        phone: payload.phone?.trim() ?? "",
        password: payload.password,
        role: "user",
    });
    saveUsers(users);
    return { ok: true, message: "Registrasi berhasil." };
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
    const users = getUsers();
    const found = users.find(
        (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: "Email atau password salah." };
    window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ email: found.email, role: found.role })
    );
    return { ok: true, role: found.role };
}

export async function verifyIdentity(email: string, name: string): Promise<VerifyResult> {
    const users = getUsers();
    const found = users.find(
        (u) =>
            u.email === email.trim().toLowerCase() &&
            u.name.toLowerCase() === name.trim().toLowerCase()
    );
    return found
        ? { verified: true, message: "Identitas terverifikasi." }
        : { verified: false, message: "Email dan nama tidak cocok." };
}

export async function resetPasswordByName(
    email: string,
    name: string,
    password: string
): Promise<ResetResult> {
    const users = getUsers();
    const found = users.find(
        (u) =>
            u.email === email.trim().toLowerCase() &&
            u.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (!found) return { ok: false, message: "Akun tidak ditemukan." };
    found.password = password;
    saveUsers(users);
    return { ok: true, message: "Password berhasil diubah." };
}
