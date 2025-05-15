import { FeedbackEpisodeType } from "@/enums/FeedbackEpisodeType";
import { EpisodeCommentsVO } from "./screens/listing-animes/EpisodeCommentsVO";

export interface iEpisodeVO {
  uriEpisode: string;
  titleEpisode: string;
  amountViews: number;
  uploaded: Date;
  feedback: FeedbackEpisodeType;
  commentsList: Array<EpisodeCommentsVO>;
  uriPath: string;
}
