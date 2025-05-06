import useEpisodeStore from "@/stores/episodeStore";
import useAnimeStore from "@/stores/animeStore";
import {AnimeListingVO} from "@/_types/screens/listing-animes/AnimeListingVO";

class EpisodeService {

    private readonly animeStore = useAnimeStore.getState();
    private readonly episodeStore = useEpisodeStore.getState();

    async getAllEpisodesByAnime(idAnime: string): Promise<AnimeListingVO> {
        return await this.episodeStore.getAllEpisodesByAnime(idAnime);
    }

    async getImageAnime(idAnime: string): Promise<string> {
        return await this.animeStore.findImageByAnime(idAnime);
    }

    async getEpisode(title: string, id: string): Promise<any> {
        return await this.episodeStore.getEpisode(id);
    }

}

export default EpisodeService;