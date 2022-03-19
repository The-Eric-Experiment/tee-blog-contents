export type VideoThumbnail = {
  url: string;
  width: number;
  height: number;
};

export type VideoSnippet = {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: VideoThumbnail;
    medium: VideoThumbnail;
    high: VideoThumbnail;
    standard: VideoThumbnail;
    maxres: VideoThumbnail;
  };
  channelTitle: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
  defaultAudioLanguage: string;
};

export type VideoMetadata = {
  kind: string;
  etag: string;
  id: string;
  snippet: VideoSnippet;
};

export type VideoResponse = {
  kind: string;
  etag: string;
  items: VideoMetadata[];
  pageInfo: { totalResults: 1; resultsPerPage: 1 };
};
