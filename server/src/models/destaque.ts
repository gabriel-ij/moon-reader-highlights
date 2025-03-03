export interface Destaque {
  id?: number;
  author: string;
  title: string;
  chapter: string;
  text: string;
  note: string;
  highlightedAt?: string;
  device_info?: string;
  auth_token?: string;
  content_length?: number;
  request_timestamp?: string;
}

export interface DestaqueRequest {
  highlights: Array<Destaque> | undefined;
} 