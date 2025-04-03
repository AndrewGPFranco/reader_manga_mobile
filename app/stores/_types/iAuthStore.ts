import { User } from "@/app/class/User";
import { UserSession } from "@/app/class/UserSession";
import { UserRegister } from "@/app/class/UserRegister";

interface AuthStore {
    user: User;
    usuarioLogado: UserSession | null;
    setToken(token: string, id: string): Promise<void>;
    removeToken(): Promise<void>;
    getToken(): Promise<string | null>;
    getUserId(): Promise<string | null>;
    efetuarLogin: (email: string, password: string) => Promise<void>;
    getUserAutenticado: () => Promise<User>;
    isUserAutenticado: () => Promise<boolean>;
    efetuarLogout: () => Promise<void>;
    getRoleUser: () => Promise<string>;
    register: (user: UserRegister) => Promise<string>;
    getIdUsuario: () => Promise<string | null>;
    changePassword: (
        oldPassword: string,
        newPassword: string
    ) => Promise<Map<boolean, string>>;
}

export default AuthStore;