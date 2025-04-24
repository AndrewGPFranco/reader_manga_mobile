import useEpisodeStore from "@/app/stores/episodeStore";
import {iEpisode} from "@/app/_types/iEpisode";
import useAnimeStore from "@/app/stores/animeStore";

class EpisodeService {

    private animeStore = useAnimeStore.getState();
    private episodeStore = useEpisodeStore.getState();

    async getAllEpisodesByAnime(idAnime: string): Promise<Array<iEpisode>> {
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