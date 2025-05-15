import { User } from "@/class/User";
import { UserSession } from "@/class/UserSession";
import { UserRegister } from "@/class/UserRegister";

interface AuthStore {
    user: User;
    isAdmin(): Promise<boolean>;
    removeToken(): Promise<void>;
    getUser(): Promise<UserSession>;
    usuarioLogado: UserSession | null;
    getRoleUser: () => Promise<string>;
    efetuarLogout: () => Promise<void>;
    getToken(): Promise<string | null>;
    getProfilePhoto(): Promise<string>;
    getUserId(): Promise<string | null>;
    getUserAutenticado: () => Promise<User>;
    isUserAutenticado: () => Promise<boolean>;
    getIdUsuario: () => Promise<string | null>;
    changePassword: (
        oldPassword: string,
        newPassword: string
    ) => Promise<Map<boolean, string>>;
    setIsAdmin(isAdmin: string): Promise<void>;
    validateToken(token: string): Promise<boolean>;
    register: (user: UserRegister) => Promise<string>;
    setToken(token: string, id: string): Promise<void>;
    efetuarLogin: (email: string, password: string) => Promise<void>;
}

export default AuthStore;