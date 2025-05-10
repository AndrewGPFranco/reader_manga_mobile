import { iEpisodeVO } from "@/_types/iEpisodeVO";
import { AnimeListingVO } from "@/_types/screens/listing-animes/AnimeListingVO";
import { FeedbackEpisodeType } from "@/enums/FeedbackEpisodeType";

interface IEpisodeStore {
  updateView(idEpisode: string): Promise<void>;
  uploadEpisode(data: FormData): Promise<string>;
  getTokenUser(): Promise<string | null | undefined>;
  getEpisode(idEpisode: string): Promise<iEpisodeVO>;
  addComment(idEpisode: string, comment: string): Promise<void>;
  getAllEpisodesByAnime(idManga: string): Promise<AnimeListingVO>;
  handleFeedback(idEpisode: string, type: FeedbackEpisodeType): Promise<void>;
}

export default IEpisodeStore;
