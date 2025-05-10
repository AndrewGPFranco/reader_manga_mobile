import { iEpisodeVO } from "@/_types/iEpisodeVO";
import {AnimeListingVO} from "@/_types/screens/listing-animes/AnimeListingVO";

interface IEpisodeStore {
    updateView(idEpisode: string): Promise<void>;
    uploadEpisode(data: FormData): Promise<string>;
    getTokenUser(): Promise<string | null | undefined>;
    getAllEpisodesByAnime(idManga: string): Promise<AnimeListingVO>
    getEpisode(idEpisode: string, pageNumber: number, pageSize: number): Promise<iEpisodeVO>;
}

export default IEpisodeStore;