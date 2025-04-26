import { create } from "zustand";
import { api } from "@/app/network/axiosInstance";
import ResponseAPI from "@/app/class/ResponseAPI";
import AnimeStore from "@/app/stores/_types/iAnimeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useAnimeStore = create<AnimeStore>((set, get) => ({
    async getTokenUser() {
        try {
            return await AsyncStorage.getItem("token");
        } catch (error) {
            console.error("Erro ao obter token do usuário:", error);
            return undefined;
        }
    },

    async registraAnime(title: string, uriImage: string) {
        try {
            const data = { title: title, uriImage: uriImage };
            const response = await api.post("/anime", data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            return new ResponseAPI(response.data.message, response.data.statusCode);
        } catch (error) {
            throw new Error(String(error));
        }
    },

    async findAll() {
        const response = await api.get("/anime", {
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        })
        return response.data;
    },

    async findImageByAnime(id: string) {
        const response = await api.get(`/anime/${id}/get-image`, {
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        })
        return response.data;
    },

    async avaliaAnime(idAnime: number, nota: number) {
        const data = { nota: nota, idAnime: idAnime };
        const response = await api.post(`/anime/user/avaliacao`, data, {
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        })
        return new ResponseAPI(response.data.message, response.data.statusCode);
    },

    async mudancaFavorito(idAnime: number) {
        const data = { idAnime: idAnime };
        await api.post(`anime/user/add-favorito/${idAnime}`, data, {
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        })
    }
}));

export default useAnimeStore;