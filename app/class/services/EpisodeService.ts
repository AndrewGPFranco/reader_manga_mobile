import useEpisodeStore from "@/app/stores/episodeStore";
import useAnimeStore from "@/app/stores/animeStore";
import {AnimeListingVO} from "@/app/_types/screens/listing-animes/AnimeListingVO";

class EpisodeService {

    private animeStore = useAnimeStore.getState();
    private episodeStore = useEpisodeStore.getState();

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