import {create} from "zustand";
import {api} from "@/app/network/axiosInstance";
import EpisodeStore from "@/app/stores/_types/iEpisodeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useEpisodeStore = create<EpisodeStore>((set, get) => ({
    async getTokenUser() {
        try {
            return await AsyncStorage.getItem("token");
        } catch (error) {
            console.error("Erro ao obter token do usuário:", error);
            return undefined;
        }
    },

    async uploadEpisode(data: FormData) {
        try {
            const response = await api.post("/episode/upload", data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
            })
            return response.data;
        } catch(error) {
            throw new Error(String(error));
        }
    },

    async getEpisode(title: string, id: string) {
        const response = await api.get(`/episode/${id}/${title}`, {
            responseType: "blob",
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        });

        return response.data;
    },

    async getAllEpisodesByAnime(idManga: string) {
        const response = await api.get(`/episode/all/${idManga}`, {
            headers: {
                Authorization: `${await get().getTokenUser()}`
            }
        });

        return response.data;
    }
}));