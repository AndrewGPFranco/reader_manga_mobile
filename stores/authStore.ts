import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { User } from "@/class/User";
import { api } from "@/network/axiosInstance";
import iDecodedToken from "@/_types/iDecodedToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthStore from "@/stores/_types/iAuthStore";
import { UserSession } from "@/class/UserSession";
import { SelectedFileType } from "@/_types/iSelectedFileType";

const useAuthStore = create<AuthStore>((set, get) => ({
  user: new User("", "", "", ""),
  usuarioLogado: null,

  async setToken(token: string, id: string): Promise<void> {
    await AsyncStorage.setItem("id", id);
    await AsyncStorage.setItem("token", token);
  },

  async setIsAdmin(isAdmin: string) {
    await AsyncStorage.setItem("isAdmin", isAdmin);
  },

  async isAdmin() {
    const isAdmin = await AsyncStorage.getItem("isAdmin");

    return isAdmin === "true";
  },

  async getToken() {
    return await AsyncStorage.getItem("token");
  },

  async getUserId() {
    return await AsyncStorage.getItem("id");
  },

  async removeToken() {
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("token");
  },

  async getUser() {
    if (this.usuarioLogado !== null) return this.usuarioLogado;

    const token: string | null = await AsyncStorage.getItem("token");
    if (token != null) {
      const tokenDecode: iDecodedToken = jwtDecode<iDecodedToken>(token);
      const email: string = tokenDecode.sub;
      const result = await api.get(`/user?email=${email}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      const userData = result.data;
      this.usuarioLogado = new UserSession(
        userData.uriPath,
        userData.firstName,
        userData.fullName,
        userData.username,
        userData.email,
        userData.dateBirth,
        userData.mangas,
        userData.completeReadings,
        userData.inProgressReadings
      );
      return this.usuarioLogado;
    }
    throw new Error("Falha ao encontrar usuário");
  },

  async efetuarLogin(email: string, password: string) {
    try {
      const user = new User(email, password);
      const { data } = await api.post("/user/login", user);
      const decodedToken: iDecodedToken = jwtDecode(data.token);

      const userId = String(decodedToken.id);

      user.setToken(data.token);
      user.setId(userId);

      await this.setIsAdmin(String(decodedToken.isAdmin));

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
    return !!(await get().getToken());
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
      throw new Error(error.response?.data ?? "Erro ao cadastrar usuário");
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
      const { data: response } = await api.post("/user/change-password", data, {
        headers: { Authorization: `${token}` },
      });

      return new Map([[true, response]]);
    } catch (error: any) {
      return new Map([
        [false, error.response?.data ?? "Erro ao alterar senha"],
      ]);
    }
  },

  async validateToken(token: string) {
    const data = { token: token };
    const result = await api.post("/user/token", data, {
      headers: { Authorization: `${token}` },
    });

    return result.status !== 401;
  },

  async getProfilePhoto() {
    const token = await get().getToken();

    const response = await api.get("/user/get-profile-photo", {
      headers: { Authorization: `${token}` },
    });

    return response.data.responseObject;
  },

  async handleChangePhoto(selectedFile: SelectedFileType) {
    const token = await get().getToken();

    const formData = new FormData();

    formData.append("file", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.type,
    } as any);

    await api.post("/user/change-photo", formData, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  },
}));

export default useAuthStore;
