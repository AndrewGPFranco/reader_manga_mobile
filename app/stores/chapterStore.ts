import { create } from "zustand";
import iChapterData from "../_types/iChapter";
import { User } from "../class/User";
import { api } from "../network/axiosInstance";
import ChapterStore from "./_types/iChapterStore";

export const createChapterStore = () => create<ChapterStore>((set, get) => ({
    chapter: {} as Array<iChapterData>,
    allChapter: [] as Array<iChapterData>,
    sizePaginaCapitulo: null,

    async getTokenUser(user: User) {
        try {
            return user.getToken();
        } catch (error) {
            console.error("Erro ao obter token do usuário:", error);
            return undefined;
        }
    },

    async getChapterByID(id: string) {
        try {
            const response = await api.get(`/chapter/read/${id}`, {
                headers: {
                    Authorization: `${this.getTokenUser()}`,
                },
            });
            this.chapter = response.data;
            return this.chapter;
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
                        Authorization: `${this.getTokenUser()}`,
                    },
                }
            );
            this.allChapter = response.data;
            return this.allChapter;
        } catch (error: any) {
            throw new Error(error.response.data);
        }
    },

    async registerChapter(data: {}, callback: Function) {
        try {
            await api.post("/chapter/create", data, {
                headers: {
                    Authorization: `${this.getTokenUser()}`,
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
                    Authorization: `${this.getTokenUser()}`,
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
                    Authorization: `${this.getTokenUser()}`,
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
                        Authorization: `${this.getTokenUser()}`,
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
                    Authorization: `${this.getTokenUser()}`,
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
                    Authorization: `${this.getTokenUser()}`,
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
                    Authorization: `${this.getTokenUser()}`,
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
                Authorization: `${this.getTokenUser()}`,
            },
        });

        return response.data;
    },

    async getQuantidadePaginasDoCapitulo(idCapitulo: string) {
        const response = await this.getChapterByID(idCapitulo);

        return response.length;
    },
    getQuantidade(id: string) {
        if (this.sizePaginaCapitulo != null) {
            return this.sizePaginaCapitulo;
        }
        return this.getQuantidadePaginasDoCapitulo(id);
    },

    async updateReadingProgress(idChapter: string, currentProgress: number) {
        try {
            const idUser = localStorage.getItem("id");
            const data = {
                idUser: idUser,
                idChapter: idChapter,
                progress: currentProgress,
            };

            await api.put(`/api/user/chapter`, data, {
                headers: {
                    Authorization: `${this.getTokenUser()}`,
                },
            });
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
                        Authorization: `${this.getTokenUser()}`,
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
                        Authorization: `${this.getTokenUser()}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(error);
        }
    },
}));
