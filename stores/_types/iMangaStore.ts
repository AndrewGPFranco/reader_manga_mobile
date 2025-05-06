import iMangaData from "@/_types/iManga";
import iResponseRequest from "@/_types/iResponseRequest";
import iResponseListManga from "@/_types/iResponseListManga";
import iCoversManga from "@/_types/iCoversManga";

interface MangaStore {
    manga: Array<iMangaData>;
    removeDaLista(idManga: number): any;
    getAllManga(): Promise<Array<iMangaData>>;
    getIdUsuario(): Promise<string | undefined>;
    getMangaById(id: string): Promise<iMangaData>;
    getAllFavorites(): Promise<Array<iMangaData>>;
    getInfoManga(tituloManga: string): Promise<any>;
    getApenasNomeDosMangas(): Promise<Array<string>>;
    deleteMangaById(idManga: number): Promise<string>;
    getTokenUser(): Promise<string | null | undefined>;
    getFiveMangaRandom(): Promise<Array<iCoversManga>>;
    adicionaMangaNaListaDoUsuario(idManga: number): any;
    setFavorite(idManga: number): Promise<iResponseRequest>;
    getMangaPesquisado(mangaPesquisado: string): Promise<any>
    getListMangaByUser(id: string): Promise<iResponseListManga>;
    registerManga(data: {}, callback: Function): Promise<string>;
    getAllMangaPaginado(pageNumber: number, size: number): Promise<any>;
    editManga(id: number, data: {}, callback: Function): Promise<string>;
}

export default MangaStore;