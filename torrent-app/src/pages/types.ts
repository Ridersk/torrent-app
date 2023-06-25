import {Media} from "../types/media";

export type AppRouteParams = {
  Downloads: undefined;
  DownloadDetails: {id: string};
  VideoPlayer: {media: Media};
};
