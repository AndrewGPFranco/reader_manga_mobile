import { iEpisodeVO } from "@/_types/iEpisodeVO";
import { AnimeListingVO } from "@/_types/screens/listing-animes/AnimeListingVO";

interface IEpisodeStore {
  addComment(idEpisode: string, comment: string): Promise<void>;
  updateView(idEpisode: string): Promise<void>;
  uploadEpisode(data: FormData): Promise<string>;
  getTokenUser(): Promise<string | null | undefined>;
  getAllEpisodesByAnime(idManga: string): Promise<AnimeListingVO>;
  getEpisode(idEpisode: string): Promise<iEpisodeVO>;
}

export default IEpisodeStore;
