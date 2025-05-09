import { StatusType } from "@/enums/StatusType";
import type iChapterData from "./iChapter";

export default interface iMangaData {
  id: number;
  nota: number;
  size: number;
  title: string;
  image: string;
  endDate: Date;
  author: string;
  gender: string;
  favorite: boolean;
  creationDate: Date;
  status: StatusType;
  description: string;
  chapters: iChapterData[];
  isInUserLibrary: boolean;
}
