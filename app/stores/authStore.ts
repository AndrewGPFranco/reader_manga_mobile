import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { User } from "@/app/class/User";
import { UserSession } from "@/app/class/UserSession";
import { api } from "@/app/network/axiosInstance";
import type { UserRegister } from "@/app/class/UserRegister";
import iDecodedToken from "@/app/_types/iDecodedToken";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User;
  usuarioLogado: UserSession | null;
  efetuarLogin: (email: string, password: string) => Promise<void>;
  getUserAutenticado: () => Promise<User>;
  isUserAutenticado: () => boolean;
  efetuarLogout: () => Promise<void>;
  getRoleUser: () => Promise<string>;
  register: (user: UserRegister) => Promise<string>;
  getIdUsuario: () => Promise<string | null>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<Map<boolean, string>>;
}

const setToken = async (token: string, id: string) => {
  await AsyncStorage.setItem("id", id);
  await AsyncStorage.setItem("token", token);
};

const getToken = async () => await AsyncStorage.getItem("token");

const getUserId = async () => await AsyncStorage.getItem("id");

const removeToken = async () => await AsyncStorage.removeItem("token");

export const useAuthStore = create<AuthState>((set, get) => ({
  user: new User("", "", "", ""),
  usuarioLogado: null,

  async efetuarLogin(email, password) {
    try {
      const user = new User(email, password);
      console.log(user)
      const { data } = await api.post("/user/login", user);
      const decodedToken = jwtDecode(data.token) as iDecodedToken;

      user.setToken(data.token);
      user.setId(decodedToken.id);

      set({ user });
      setToken(data.token, decodedToken.id);
    } catch (error: any) {
      console.log(error)
      throw new Error(error);
    }
  },

  async getUserAutenticado(): Promise<User> {
    const token = await getToken();
    const id = await getUserId();

    if (token && id) {
      const user = new User("", "");
      user.setToken(token);
      user.setId(id);
      return user;
    }

    return new User("", "", "", "");
  },

  isUserAutenticado(): boolean {
    return !!getToken();
  },

  async efetuarLogout() {
    removeToken();
    set({ user: new User("", "", "", ""), usuarioLogado: null });
  },

  async getRoleUser(): Promise<string> {
    const token = await getToken();
    if (token) {
      const decoded = jwtDecode(token) as iDecodedToken;
      return decoded.role;
    }
    return "USER";
  },

  async register(user) {
    try {
      const result = await api.post("/api/v1/user/register", user);
      if (result.status === 200) return "Usuário cadastrado com sucesso!";
      throw new Error("Falha ao cadastrar usuário");
    } catch (error: any) {
      throw new Error(error.response?.data || "Erro ao cadastrar usuário");
    }
  },

  async getIdUsuario(): Promise<string | null> {
    const token = await getToken();
    if (token) {
      const decoded = jwtDecode(token) as iDecodedToken;
      return decoded.id;
    }
    return null;
  },

  async changePassword(oldPassword, newPassword) {
    const token = getToken();
    if (!token) return new Map([[false, "Token inválido!"]]);

    try {
      const idUser = get().getIdUsuario();
      const data = { oldPassword, newPassword, idUser };
      const { data: response } = await api.post(
        "/api/v1/user/change-password",
        data,
        {
          headers: { Authorization: `${token}` },
        }
      );

      return new Map([[true, response]]);
    } catch (error: any) {
      return new Map([
        [false, error.response?.data || "Erro ao alterar senha"],
      ]);
    }
  },
}));
