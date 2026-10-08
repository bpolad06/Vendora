import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export type Role = 'admin' | 'seller' | 'buyer';
export interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  sellerId?: string;
  salt: string;
  hash: string;
}
interface AuthState {
  accounts: Account[];
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: 'buyer' | 'seller',
    sellerId?: string,
  ) => Promise<void>;
  logout: () => void;
}
async function digest(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: [],
      userId: null,
      login: async (email, password) => {
        const account = get().accounts.find((a) => a.email === email.trim().toLowerCase());
        if (!account || account.hash !== (await digest(password, account.salt)))
          throw new Error('E-poçt və ya şifrə yanlışdır.');
        set({ userId: account.id });
      },
      signup: async (name, email, password, role, sellerId) => {
        email = email.trim().toLowerCase();
        if (!name.trim() || password.length < 8)
          throw new Error('Adınızı və ən azı 8 simvolluq şifrəni daxil edin.');
        if (get().accounts.some((a) => a.email === email))
          throw new Error('Bu e-poçt artıq qeydiyyatdan keçib.');
        const salt = crypto.randomUUID();
        const hash = await digest(password, salt);
        if (get().accounts.some((a) => a.email === email))
          throw new Error('Bu e-poçt artıq qeydiyyatdan keçib.');
        const account = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email,
          role,
          sellerId,
          salt,
          hash,
        };
        set((state) => ({ accounts: [...state.accounts, account], userId: account.id }));
      },
      logout: () => set({ userId: null }),
    }),
    { name: 'vendora-auth-v1' },
  ),
);
export function currentUser() {
  const s = useAuth.getState();
  return s.accounts.find((a) => a.id === s.userId);
}
export const roleHome = (role?: Role) =>
  role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/buyer';
export async function initializeDemo(sellerId: string) {
  for (const [role, name] of [
    ['admin', 'Vendora Admin'],
    ['seller', 'Vüqar Məmmədov'],
    ['buyer', 'Aysel Əliyeva'],
  ] as const) {
    const email = `${role}@vendora.az`;
    if (useAuth.getState().accounts.some((a) => a.email === email)) continue;
    const salt = crypto.randomUUID();
    const hash = await digest('Vendora123!', salt);
    useAuth.setState((s) => ({
      accounts: [
        ...s.accounts,
        {
          id: crypto.randomUUID(),
          name,
          email,
          role,
          sellerId: role === 'seller' ? sellerId : undefined,
          salt,
          hash,
        },
      ],
    }));
  }
}
