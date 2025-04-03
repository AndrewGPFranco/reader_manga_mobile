import iChapterData from "../../_types/iChapter";
import { User } from "../../class/User";

interface ChapterStore {
    chapter: Array<iChapterData>;
    allChapter: Array<iChapterData>;
    sizePaginaCapitulo: null;
    getTokenUser(user: User): Promise<string | undefined>;
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
    ): Promise<Blob | MediaSource>;
    getQuantidadePaginasDoCapitulo(idCapitulo: string): Promise<number>;
    updateReadingProgress(
        idChapter: string,
        currentProgress: number
    ): Promise<void>;
    getReadingProgress(idChapter: string): Promise<iChapterData>;
    getAllReadingProgress(pageNumber: number): Promise<Array<iChapterData>>;
}

export default ChapterStore;