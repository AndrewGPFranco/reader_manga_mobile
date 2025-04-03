import { create } from "zustand";
import MangaStore from "./_types/iMangaStore";
import iMangaData from "../_types/iManga";
import { api } from "../network/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import iDecodedToken from "../_types/iDecodedToken";
import { UserData } from "../class/UserData";

const useMangaStore = () => create<MangaStore>((set, get) => ({
    manga: [] as Array<iMangaData>,

    async getTokenUser() {
        try {
            return await AsyncStorage.getItem("token");
        } catch (error) {
            console.error("Erro ao obter token do usuário:", error);
            return undefined;
        }
    },

    async getAllManga() {
        try {
            const response = await api.get(`/manga/readAll/${await get().getIdUsuario()}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            get().manga = response.data
            return get().manga
        } catch (error: any) {
            throw new Error(error.response.data)
        }
    },

    async getAllMangaPaginado(pageNumber: number, size: number) {
        try {
            const idUser = await get().getIdUsuario()
            const response = await api.get(
                `/manga/get-pageable?pageNumber=${pageNumber}&size=${size}&idUser=${idUser}`,
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`
                    }
                }
            )
            get().manga = response.data
            return get().manga
        } catch (error: any) {
            throw new Error(error.response.data)
        }
    },

    async getMangaById(id: string) {
        try {
            const response = await api.get(`/manga/read/${id}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.response.data)
        }
    },

    async getInfoManga(tituloManga: string) {
        const idUser = await AsyncStorage.getItem("id");
        const response = await api.get(`/manga/get-info-manga/${tituloManga}/${idUser}`, {
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        })
        return response.data
    },

    // Get 5 manga covers from my library
    async getFiveMangaRandom() {
        try {
            const response = await api.get('/manga/my-covers/30', {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.response.data)
        }
    },

    async deleteMangaById(idManga: number) {
        try {
            const idUser = await get().getIdUsuario() ?? '0'
            const dadosBack = new UserData(idUser, idManga, 0, 0)
            const response = await api.delete(`/manga/delete`, {
                data: dadosBack,
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.response.data)
        }
    },

    async registerManga(data: {}, callback: Function) {
        try {
            await api.post('/manga/create', data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            callback()
            return 'Mangá successfully registered!'
        } catch (error: any) {
            console.error(error)
            return 'An error occurred while registering, check the data.'
        }
    },

    async editManga(id: number, data: {}, callback: Function) {
        try {
            await api.put(`/manga/edit/${id}`, data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            callback()
            return 'Successfully edited manga!'
        } catch (error: any) {
            console.error(error)
            return 'An error occurred while editing, please check the data.'
        }
    },

    async setFavorite(idManga: number) {
        try {
            const response = await api.post(
                `/user/favorite-manga/${await get().getIdUsuario()}/${idManga}`,
                null,
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`
                    }
                }
            )
            return { statusCode: response.status, message: response.data }
        } catch (error: any) {
            console.error(error)
            return {
                statusCode: error,
                message: 'An error occurred while editing, please check the data.'
            }
        }
    },

    async getAllFavorites() {
        const token = await AsyncStorage.getItem('token')
        if (token != undefined) {
            const id = await get().getIdUsuario()
            const response = await api.get(`/user/manga-favorite-list/${id}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            return response.data.mangaList
        }
    },

    async getListMangaByUser(id: string) {
        try {
            const response = await api.get(`/user/manga-list/${id}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            return response.data
        } catch (error: any) {
            throw new Error(error.response.data)
        }
    },

    async adicionaMangaNaListaDoUsuario(idManga: number) {
        try {
            const idUser = await AsyncStorage.getItem("id");
            const response = await api.post(
                `/user/add-manga?idManga=${idManga}&idUser=${idUser}`,
                {},
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`
                    }
                }
            )
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data || 'Erro ao adicionar manga')
        }
    },

    async removeDaLista(idManga: number) {
        try {
            const idUser = await get().getIdUsuario()
            const response = await api.post(
                `/user/remove-manga?idManga=${idManga}&idUser=${idUser}`,
                {},
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`
                    }
                }
            )
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data || 'Erro ao remover manga')
        }
    },

    async getIdUsuario() {
        const token = await AsyncStorage.getItem('token')
        if (token != undefined) {
            const decode = jwtDecode<iDecodedToken>(token)
            return decode.id
        }
    },

    async getApenasNomeDosMangas() {
        const result = await api.get("/manga/nome-mangas", {
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        });
        return result.data;
    },

    async getMangaPesquisado(mangaPesquisado: string) {
        const result = await api
            .get(`/manga?pesquisado=${mangaPesquisado}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            });
        return result.data;
    }
}));

export default useMangaStore;