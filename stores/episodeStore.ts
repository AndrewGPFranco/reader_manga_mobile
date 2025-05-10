import { create } from "zustand";
import { api } from "@/network/axiosInstance";
import EpisodeStore from "@/stores/_types/iEpisodeStore";
import { FeedbackEpisodeType } from "@/enums/FeedbackEpisodeType";
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
          Authorization: `${await get().getTokenUser()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(String(error));
    }
  },

  async getEpisode(idEpisode: string) {
    const response = await api.get(`/episode/get-info-episode/${idEpisode}`, {
      headers: {
        Authorization: `${await get().getTokenUser()}`,
      },
    });

    return response.data;
  },

  async getAllEpisodesByAnime(idManga: string) {
    const response = await api.get(`/episode/all/${idManga}`, {
      headers: {
        Authorization: `${await get().getTokenUser()}`,
      },
    });

    return response.data;
  },

  async updateView(idEpisode: string) {
    await api.post(
      `/episode/${idEpisode}/update-view`,
      {},
      {
        headers: {
          Authorization: `${await get().getTokenUser()}`,
        },
      }
    );
  },

  async addComment(idEpisode: string, comment: string) {
    const data = {
      idEpisode: idEpisode,
      comment: comment,
    };

    await api.post(`/episode/add-comment`, data, {
      headers: {
        Authorization: `${await get().getTokenUser()}`,
      },
    });
  },

  async handleFeedback(idEpisode: string, type: FeedbackEpisodeType) {
    const data = {
      idEpisode: idEpisode,
      feedback: type,
    };

    await api.post(`/episode/handle-feedback`, data, {
      headers: {
        Authorization: `${await get().getTokenUser()}`,
      },
    });
  },
}));

export default useEpisodeStore;
