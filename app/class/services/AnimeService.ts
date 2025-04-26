import useAnimeStore from "@/app/stores/animeStore";
import {iAnime} from "@/app/_types/iAnime";

class AnimeService {

    private readonly animeStore = useAnimeStore.getState();

    async getAllAnimes(): Promise<Array<iAnime>> {
        return await this.animeStore.findAll();
    }

    async avaliaAnime(idAnime: number | undefined, nota: number): Promise<void> {
        if(idAnime !== undefined) {
            await this.animeStore.avaliaAnime(idAnime, nota);
        }
    }

    async mudancaAvaliacao(idAnime: number | undefined): Promise<void> {
        if(idAnime !== undefined) {
            await this.animeStore.mudancaFavorito(idAnime);
        }
    }

}

export default AnimeService;