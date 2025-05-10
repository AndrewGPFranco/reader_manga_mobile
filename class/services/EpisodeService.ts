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
    
    async updateView(idEpisode: string): Promise<void> {
        try {
            await this.episodeStore.updateView(idEpisode);
        } catch(error) {
            throw new Error(String(error));
        }
    }
    
    async addComment(idEpisode: string, comment: string) {
        try {
            await this.episodeStore.addComment(idEpisode, comment);
        } catch(error) {
            throw new Error(String(error));
        }
    }
}

export default EpisodeService;