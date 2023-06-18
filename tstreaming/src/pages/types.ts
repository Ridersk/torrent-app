import { Media } from "../models/media"

export type AppRouteParams = {
  Downloads: undefined,
  DownloadDetails: { id: string },
  VideoPlayer: { media: Media }
}
