import {AnimeListingVO} from "@/app/_types/screens/listing-animes/AnimeListingVO";

interface IEpisodeStore {
    uploadEpisode(data: FormData): Promise<string>;
    getTokenUser(): Promise<string | null | undefined>;
    getEpisode(id: string): Promise<any>;
    getAllEpisodesByAnime(idManga: string): Promise<AnimeListingVO>
}

export default IEpisodeStore;