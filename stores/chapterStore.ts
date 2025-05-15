import {create} from "zustand";
import iChapterData from "@/_types/iChapter";
import {api} from "@/network/axiosInstance";
import ChapterStore from "./_types/iChapterStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { uriPathServer } from "@/utils/utils";

const useChapterStore = create<ChapterStore>((set, get) => ({
    paginaCache: {},
    tamanhoCache: 10,
    buscaAtual: new Set(),
    filaPreBusca: new Set(),
    sizePaginaCapitulo: null,
    chapter: {} as Array<iChapterData>,
    allChapter: [] as Array<iChapterData>,

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

    async getPaginaDoCapitulo(idCapitulo: string, pageNumber: number) {
        const cacheKey = `${idCapitulo}-${pageNumber}`;

        if (this.paginaCache[cacheKey]) {
            this.paginaCache[cacheKey].lastAccessed = Date.now();
            return this.paginaCache[cacheKey].path;
        }

        if (this.buscaAtual.has(cacheKey)) {
            return new Promise<string>((resolve) => {
                const checkCache = setInterval(() => {
                    if (this.paginaCache[cacheKey]) {
                        clearInterval(checkCache);
                        resolve(this.paginaCache[cacheKey].path);
                    }
                }, 100);
            });
        }

        this.buscaAtual.add(cacheKey);

        try {
            const response = await api.get(`/chapter/image/${idCapitulo}/${pageNumber}`, {
                responseType: 'blob',
                headers: {
                    Authorization: `${await this.getTokenUser()}`,
                },
            });

            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(response.data);
            });

            const base64Data = base64.split(',')[1];
            const path = `${FileSystem.cacheDirectory}page-${idCapitulo}-${pageNumber}.jpg`;

            await FileSystem.writeAsStringAsync(path, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            this.paginaCache[cacheKey] = {path, lastAccessed: Date.now()};

            this.cleanCache();

            this.buscaAtual.delete(cacheKey);
            return path;
        } catch (error) {
            this.buscaAtual.delete(cacheKey);
            throw error;
        }
    },

    cleanCache() {
        const cache = Object.entries(this.paginaCache);
        if (cache.length <= this.tamanhoCache) return;

        const dadosOrdenados = cache
            .sort((a: any, b: any) => a[1].lastAccessed - b[1].lastAccessed);

        const dadosParaRemover = dadosOrdenados.slice(0, cache.length - this.tamanhoCache);

        // @ts-ignore
        for (const [key, {path}] of dadosParaRemover) {
            delete this.paginaCache[key];
            FileSystem.deleteAsync(path).catch(console.error);
        }
    },

    async precarregarPaginas(idCapitulo: string, paginaAtual: number, totalPaginas: number) {
        this.filaPreBusca.clear();

        const paginas = [];

        if (paginaAtual < totalPaginas - 1)
            paginas.push(paginaAtual + 1);

        if (paginaAtual > 0)
            paginas.push(paginaAtual - 1);

        if (paginaAtual < totalPaginas - 2)
            paginas.push(paginaAtual + 2);

        for (const numeroPag of paginas) {
            const cacheKey = `${idCapitulo}-${numeroPag}`;
            if (!this.paginaCache[cacheKey] && !this.buscaAtual.has(cacheKey)) {
                this.filaPreBusca.add(cacheKey);
                this.processPreloadQueue(idCapitulo);
            }
        }
    },

    async processPreloadQueue(idCapitulo: string) {
        if (this.filaPreBusca.size === 0) return;

        const [primeiraKey] = this.filaPreBusca;
        this.filaPreBusca.delete(primeiraKey);

        const numeroPagina = parseInt(primeiraKey.split('-')[1]);

        this.getPaginaDoCapitulo(idCapitulo, numeroPagina).catch(console.error);
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

            await api.put(`/api/user/chapter`, data, {
                baseURL: uriPathServer,
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                }
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

    async progressReset(idChapter: number) {
        try {
            const response = await api.delete(
                `/api/user/chapter/delete/${idChapter}`,
                {
                    headers: {
                        Authorization: `${await get().getTokenUser()}`
                    },
                    baseURL: uriPathServer
                }
            )
            return response.data
        } catch (error) {
            console.error(error)
        }
    },

    async getPage(idChapter: string, indexAtual: number) {
        const response = await api.get(`/chapter/page/${idChapter}/${indexAtual}`,
            {
                headers: {
                    Authorization: `${await get().getTokenUser()}`
                },
            }
        )
        return response.data;
    }

}));

export default useChapterStore;