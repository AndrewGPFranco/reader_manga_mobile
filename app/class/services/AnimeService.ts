import useAnimeStore from "@/app/stores/animeStore";
import {iAnime} from "@/app/_types/iAnime";

class AnimeService {

    private animeStore = useAnimeStore.getState();

    async getAllAnimes(): Promise<Array<iAnime>> {
        return await this.animeStore.findAll();
    }

}

export default AnimeService;