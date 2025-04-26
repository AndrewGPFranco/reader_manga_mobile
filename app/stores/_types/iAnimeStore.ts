import {iAnime} from "@/app/_types/iAnime";
import ResponseAPI from "@/app/class/ResponseAPI";

interface IAnimeStore {
    findAll(): Promise<Array<iAnime>>;
    findImageByAnime(id: string): Promise<string>;
    getTokenUser(): Promise<string | null | undefined>;
    avaliaAnime(idAnime: number, nota: number): Promise<ResponseAPI>;
    mudancaFavorito(idAnime: number): Promise<void>;
    registraAnime(title: string, uriImage: string): Promise<ResponseAPI>;
}

export default IAnimeStore;