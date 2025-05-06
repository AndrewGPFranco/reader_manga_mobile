import iChapterData from "@/_types/iChapter";

interface ChapterStore {
    chapter: Array<iChapterData>;
    allChapter: Array<iChapterData>;
    sizePaginaCapitulo: null;
    paginaCache: any,
    tamanhoCache: number,
    filaPreBusca: any,
    buscaAtual: any,
    getTokenUser(): Promise<string | null | undefined>;
    getChapterByID(id: string): Promise<Array<iChapterData>>;
    getAllChapter(pageNumber: number, size: number): Promise<any>;
    registerChapter(data: {}, callback: Function): Promise<string>;
    editChapter(id: number, data: {}, callback: Function): Promise<string>;
    deleteChapterById(id: number): Promise<string>;
    getAllPages(pageNumber: number, size: number): Promise<any>;
    deletePageById(id: number): Promise<string>;
    editPage(id: number, data: {}, callback: Function): Promise<string>;
    registerPage(data: {}, callback: Function): Promise<string>;
    getPaginaDoCapitulo(
        idCapitulo: string,
        index: number
    ): Promise<any>;
    getQuantidadePaginasDoCapitulo(idCapitulo: string): Promise<number>;
    updateReadingProgress(
        idChapter: string,
        currentProgress: number
    ): Promise<void>;
    getReadingProgress(idChapter: string): Promise<iChapterData>;
    getAllReadingProgress(pageNumber: number): Promise<Array<iChapterData>>;
    progressReset(idChapter: number): Promise<string>;
    processPreloadQueue(idCapitulo: string): any;
    precarregarPaginas(idCapitulo: string, paginaAtual: number, totalPaginas: number): any;
    cleanCache(): void;
    getPage(idChapter: string, indexAtual: number): Promise<string>;
}

export default ChapterStore;