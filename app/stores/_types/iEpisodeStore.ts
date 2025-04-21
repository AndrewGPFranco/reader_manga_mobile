import {iEpisode} from "@/app/_types/iEpisode";

interface IEpisodeStore {
    uploadEpisode(data: FormData): Promise<string>;
    getTokenUser(): Promise<string | null | undefined>;
    getEpisode(title: string, id: string): Promise<any>;
    getAllEpisodesByAnime(idManga: string): Promise<Array<iEpisode>>
}

export default IEpisodeStore;