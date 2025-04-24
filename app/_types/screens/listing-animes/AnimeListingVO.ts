import {EpisodeToAnimesVO} from "@/app/_types/screens/listing-animes/EpisodeToAnimesVO";

export interface AnimeListingVO {
    note: number;
    idAnime: number;
    uriImage: string;
    titleAnime: string;
    launchYear: string;
    isFavorite: boolean;
    tags: Array<string>;
    episodes: Array<EpisodeToAnimesVO>;
}