import {iAnime} from "@/app/_types/iAnime";
import ResponseAPI from "@/app/class/ResponseAPI";

interface IAnimeStore {
    getTokenUser(): Promise<string | null | undefined>;
    registraAnime(title: string, uriImage: string): Promise<ResponseAPI>;
    findAll(): Promise<Array<iAnime>>;
}

export default IAnimeStore;