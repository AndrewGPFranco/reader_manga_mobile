import type iPageData from "./iPagee";
import { StatusType } from "@/enums/StatusType";

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
