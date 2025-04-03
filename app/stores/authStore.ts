import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/app/class/User';
import { UserSession } from '@/app/class/UserSession';
import { api } from '@/app/network/axiosInstance';
import type { UserRegister } from '@/app/class/UserRegister';
import type iDecodedToken from '@/app/_types/iDecodedToken';

interface AuthState {
  user: User;
  usuarioLogado: UserSession | null;
  efetuarLogin: (email: string, password: string) => Promise<void>;
  getUserAutenticado: () => User;
  isUserAutenticado: () => boolean;
  efetuarLogout: () => Promise<void>;
  getRoleUser: () => string;
  register: (user: UserRegister) => Promise<string>;
  getUser: () => Promise<any>;
  getIdUsuario: () => string | null;
  changePassword: (oldPassword: string, newPassword: string) => Promise<Map<boolean, string>>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: new User('', '', '', ''),
  usuarioLogado: null,

  async efetuarLogin(email, password) {
    try {
      const user = new User(email, password);
      const result = await api.post('/api/v1/user/login', user);
      const decode: iDecodedToken = jwtDecode<iDecodedToken>(result.data.token);
      user.setToken(result.data.token);
      user.setId(decode.id);
      
      set({ user });

      const token = user.getToken();
      const idUser = user.getId();
      if (token && idUser) {
        localStorage.setItem('token', token);
        localStorage.setItem('id', idUser);
      }
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  },

  getUserAutenticado() {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    if (token && id) {
      get().user.setToken(token);
      get().user.setId(id);
    }
    return get().user;
  },

  isUserAutenticado() {
    return get().user.getToken() !== '' || localStorage.getItem('token') !== null;
  },

  async efetuarLogout() {
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    set({ user: new User('', '', '', ''), usuarioLogado: null });
  },

  getRoleUser() {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenDecode = jwtDecode<iDecodedToken>(token);
      return tokenDecode.role;
    }
    return 'USER';
  },

  async register(user) {
    const result = await api.post('/api/v1/user/register', user);
    if (result.status === 200) return 'Usuário cadastrado com sucesso!';
    throw new Error('Falha ao cadastrar usuário');
  },

  async getUser() {
    if (get().usuarioLogado !== null) return get().usuarioLogado;
    
    const token = localStorage.getItem('token');
    if (token) {
      const tokenDecode: iDecodedToken = jwtDecode<iDecodedToken>(token);
      const email = tokenDecode.sub;
      const result = await api.get(`/api/v1/user?email=${email}`, {
        headers: { Authorization: `${token}` },
      });
      const userData = result.data;
      const usuarioLogado = new UserSession(
        userData.firstName,
        userData.fullName,
        userData.username,
        userData.email,
        userData.dateBirth
      );
      set({ usuarioLogado });
      return usuarioLogado;
    }
    throw new Error('Falha ao encontrar usuário');
  },

  getIdUsuario() {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode<iDecodedToken>(token);
      return decode.id;
    }
    return null;
  },

  async changePassword(oldPassword, newPassword) {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const idUser = get().getIdUsuario();
        const data = { oldPassword, newPassword, idUser };
        const result = await api.post('/api/v1/user/change-password', data, {
          headers: { Authorization: `${token}` },
        });
        return new Map([[true, result.data]]);
      } catch (error: any) {
        return new Map([[false, error.response.data]]);
      }
    }
    return new Map([[false, 'Token inválido!']]);
  },
}));