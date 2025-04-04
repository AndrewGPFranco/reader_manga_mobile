import { create } from "zustand";
import iChapterData from "../_types/iChapter";
import { api } from "../network/axiosInstance";
import ChapterStore from "./_types/iChapterStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useChapterStore = create<ChapterStore>((set, get) => ({
    chapter: {} as Array<iChapterData>,
    allChapter: [] as Array<iChapterData>,
    sizePaginaCapitulo: null,

    async getTokenUser() {
        try {
            return await AsyncStorage.getItem("token");
        } catch (error) {
            console.error("Erro ao obter token do usuário:", error);
            return undefined;
        }
    },

    async getChapterByID(id: string) {
        try {
            const response = await api.get(`/chapter/read/${id}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`,
                },
            });
            get().chapter = response.data;
            return get().chapter;
        } catch (error: any) {
            throw new Error(error.response.data);
        }
    },

    async getAllChapter(pageNumber: number, size: number) {
        try {
            const response = await api.get(
                `/chapter/readAll?size=${size}&pageNumber=${pageNumber}`,
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`,
                    },
                }
            );
            get().allChapter = response.data;
            return get().allChapter;
        } catch (error: any) {
            throw new Error(error.response.data);
        }
    },

    async registerChapter(data: {}, callback: Function) {
        try {
            await api.post("/chapter/create", data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`,
                },
            });
            callback();
            return "Chapter successfully registered!";
        } catch (error: any) {
            console.error(error);
            return "An error occurred while registering, check the data.";
        }
    },

    async editChapter(id: number, data: {}, callback: Function) {
        try {
            await api.put(`/chapter/edit/${id}`, data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`,
                },
            });
            callback();
            return "Successfully edited chapter!";
        } catch (error: any) {
            console.error(error);
            return "An error occurred while editing, please check the data.";
        }
    },

    async deleteChapterById(id: number) {
        try {
            const response = await api.delete(`/chapter/delete/${id}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`,
                },
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response.data);
        }
    },

    async getAllPages(pageNumber: number, size: number) {
        try {
            const response = await api.get(
                `/chapter/getAll-pages?size=${size}&pageNumber=${pageNumber}`,
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`,
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response.data);
        }
    },

    async deletePageById(id: number) {
        try {
            const response = await api.delete(`/chapter/delete/page/${id}`, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`,
                },
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response.data);
        }
    },

    async editPage(id: number, data: {}, callback: Function) {
        try {
            await api.put(`/chapter/edit/page/${id}`, data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`,
                },
            });
            callback();
            return "Successfully edited page!";
        } catch (error: any) {
            console.error(error);
            return "An error occurred while editing, please check the data.";
        }
    },

    async registerPage(data: {}, callback: Function) {
        try {
            await api.post("/chapter/register/page", data, {
                headers: {
                    Authorization: `${await get().getTokenUser()}`,
                },
            });
            callback();
            return "Page successfully registered!";
        } catch (error: any) {
            console.error(error);
            return "An error occurred while registering, check the data.";
        }
    },

    async getPaginaDoCapitulo(idCapitulo: string, index: number) {
        const response = await api.get(`/chapter/image/${idCapitulo}/${index}`, {
            responseType: "blob",
            headers: {
                Authorization: `${await get().getTokenUser()}`,
            },
        });

        return await this.blobToBase64(response.data);
    },

    async getQuantidadePaginasDoCapitulo(idCapitulo: string) {
        const response = await get().getChapterByID(idCapitulo);

        return response.length;
    },
    getQuantidade(id: string) {
        if (get().sizePaginaCapitulo != null) {
            return get().sizePaginaCapitulo;
        }
        return get().getQuantidadePaginasDoCapitulo(id);
    },

    async updateReadingProgress(idChapter: string, currentProgress: number) {
        try {
            const idUser = await AsyncStorage.getItem("id");
            const data = {
                idUser: idUser,
                idChapter: idChapter,
                progress: currentProgress,
            };
        } catch (error) {
            console.error(error);
        }
    },

    async getReadingProgress(idChapter: string) {
        try {
            const response = await api.get(
                `/chapter/reading-progress/${idChapter}`,
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(error);
        }
    },

    async getAllReadingProgress(pageNumber: number) {
        try {
            const response = await api.get(
                `/chapter/reading-progress?pageNumber=${pageNumber}`,
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(error);
        }
    },

    async blobToBase64(blob: Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
}));

export default useChapterStore;