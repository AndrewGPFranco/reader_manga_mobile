import { User } from "@/app/class/User";
import { UserSession } from "@/app/class/UserSession";
import { UserRegister } from "@/app/class/UserRegister";

interface AuthStore {
    user: User;
    removeToken(): Promise<void>;
    getUser(): Promise<UserSession>;
    usuarioLogado: UserSession | null;
    getRoleUser: () => Promise<string>;
    efetuarLogout: () => Promise<void>;
    getToken(): Promise<string | null>;
    getUserId(): Promise<string | null>;
    getUserAutenticado: () => Promise<User>;
    isUserAutenticado: () => Promise<boolean>;
    getIdUsuario: () => Promise<string | null>;
    changePassword: (
        oldPassword: string,
        newPassword: string
    ) => Promise<Map<boolean, string>>;
    validateToken(token: string): Promise<boolean>;
    register: (user: UserRegister) => Promise<string>;
    setToken(token: string, id: string): Promise<void>;
    efetuarLogin: (email: string, password: string) => Promise<void>;
}

export default AuthStore;