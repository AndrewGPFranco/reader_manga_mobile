import type iPageData from "../_types/iPagee";
import { StatusType } from "@/app/enums/StatusType";

export default interface iChapterData {
  id: number;
  title: string;
  pages: iPageData[];
  status: StatusType;
  numberPages: number;
  readingProgress: number;
  urlImageManga?: string;
  nameManga?: string;
  numberPageOfPageable?: number;
}
