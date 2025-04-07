import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { User } from "@/app/class/User";
import { api } from "@/app/network/axiosInstance";
import iDecodedToken from "@/app/_types/iDecodedToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthStore from "@/app/stores/_types/iAuthStore"
import {UserSession} from "@/app/class/UserSession";

const useAuthStore = create<AuthStore>((set, get) => ({
  user: new User("", "", "", ""),
  usuarioLogado: null,

  async setToken(token: string, id: string): Promise<void> {
    await AsyncStorage.setItem("id", id);
    await AsyncStorage.setItem("token", token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem("token");
  },

  async getUserId(): Promise<string | null> {
    return await AsyncStorage.getItem("id");
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("token");
  },

  async getUser() {
    if (this.usuarioLogado !== null) return this.usuarioLogado

    const token: string | null = await AsyncStorage.getItem('token')
    if (token != null) {
      const tokenDecode: iDecodedToken = jwtDecode<iDecodedToken>(token)
      const email: string = tokenDecode.sub
      const result = await api.get(`/user?email=${email}`, {
        headers: {
          Authorization: `${token}`
        }
      })
      const userData = result.data
      this.usuarioLogado = new UserSession(
          userData.firstName,
          userData.fullName,
          userData.username,
          userData.email,
          userData.dateBirth
      )
      return this.usuarioLogado
    }
    throw new Error('Falha ao encontrar usuário')
  },

  async efetuarLogin(email: string, password: string) {
    try {
      const user = new User(email, password);
      const { data } = await api.post("/user/login", user);
      const decodedToken: iDecodedToken = jwtDecode(data.token);

      const userId = String(decodedToken.id);

      user.setToken(data.token);
      user.setId(userId);

      set({ user });
      await get().setToken(data.token, userId);
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  },

  async getUserAutenticado(): Promise<User> {
    const token = await get().getToken();
    const id = await get().getUserId();

    if (token && id) {
      const user = new User("", "");
      user.setToken(token);
      user.setId(id);
      return user;
    }

    return new User("", "", "", "");
  },

  async isUserAutenticado(): Promise<boolean> {
    return !!await get().getToken();
  },

  async efetuarLogout() {
    await get().removeToken();
    set({ user: new User("", "", "", ""), usuarioLogado: null });
  },

  async getRoleUser(): Promise<string> {
    const token = await get().getToken();
    if (token) {
      const decoded: iDecodedToken = jwtDecode(token);
      return decoded.role;
    }
    return "USER";
  },

  async register(user) {
    try {
      const result = await api.post("/user/register", user);
      if (result.status === 200) return "Usuário cadastrado com sucesso!";
      throw new Error("Falha ao cadastrar usuário");
    } catch (error: any) {
      throw new Error(error.response?.data || "Erro ao cadastrar usuário");
    }
  },

  async getIdUsuario(): Promise<string | null> {
    const token = await get().getToken();
    if (token) {
      const decoded: iDecodedToken = jwtDecode(token);
      return decoded.id;
    }
    return null;
  },

  async changePassword(oldPassword, newPassword) {
    const token = await get().getToken();
    if (!token) return new Map([[false, "Token inválido!"]]);

    try {
      const idUser = get().getIdUsuario();
      const data = { oldPassword, newPassword, idUser };
      const { data: response } = await api.post(
        "/user/change-password",
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

export default useAuthStore;