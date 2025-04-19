export interface Store {
  id?: number;
  store_code: string;
  store_address: string;
  description: string;
  google_maps_url: string;
  alarm_code?: string;
  created_at?: string;
}

export interface StoreImage {
  id?: number;
  store_code: string;
  image_path: string;
  image_url: string;
  created_at?: string;
}

export interface StoreContent {
  id?: number;
  store_code: string;
  content_type: 'text' | 'image' | 'bullet-list';
  display_order: number;
  text_content?: string;
  bullet_points?: string[];
  image_path?: string;
  image_url?: string;
  created_at?: string;
}
