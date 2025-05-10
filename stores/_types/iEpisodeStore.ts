import { iEpisodeVO } from "@/_types/iEpisodeVO";
import {AnimeListingVO} from "@/_types/screens/listing-animes/AnimeListingVO";

interface IEpisodeStore {
    uploadEpisode(data: FormData): Promise<string>;
    getTokenUser(): Promise<string | null | undefined>;
    getEpisode(idEpisode: string, pageNumber: number, pageSize: number): Promise<iEpisodeVO>;
    getAllEpisodesByAnime(idManga: string): Promise<AnimeListingVO>
}

export default IEpisodeStore;