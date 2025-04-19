import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Store, StoreImage, StoreContent } from '../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Store CRUD operations
  async getStores(): Promise<Store[]> {
    const { data, error } = await this.supabase
      .from('stores')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  async getStoreByCode(storeCode: string): Promise<Store | null> {
    const { data, error } = await this.supabase
      .from('stores')
      .select('*')
      .eq('store_code', storeCode)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createStore(store: Store): Promise<Store> {
    const { data, error } = await this.supabase
      .from('stores')
      .insert(store)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStore(store: Store): Promise<Store> {
    const { data, error } = await this.supabase
      .from('stores')
      .update(store)
      .eq('id', store.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteStore(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('stores')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Store Image CRUD operations
  async getStoreImages(storeCode: string): Promise<StoreImage[]> {
    const { data, error } = await this.supabase
      .from('store_images')
      .select('*')
      .eq('store_code', storeCode);
    
    if (error) throw error;
    return data || [];
  }

  async uploadStoreImage(storeCode: string, file: File): Promise<StoreImage> {
    // 1. Upload the file to Supabase Storage
    const fileName = `${storeCode}/${Date.now()}_${file.name}`;
    const { data: fileData, error: uploadError } = await this.supabase
      .storage
      .from('store-images')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // 2. Get public URL for the uploaded file
    const publicUrl = this.supabase
      .storage
      .from('store-images')
      .getPublicUrl(fileName).data.publicUrl;
    
    // 3. Create a record in the store_images table
    const storeImage: StoreImage = {
      store_code: storeCode,
      image_path: fileName,
      image_url: publicUrl
    };
    
    const { data, error } = await this.supabase
      .from('store_images')
      .insert(storeImage)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteStoreImage(id: number): Promise<void> {
    // 1. Get the image path
    const { data: image, error: fetchError } = await this.supabase
      .from('store_images')
      .select('image_path')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // 2. Delete the file from Storage
    if (image) {
      const { error: storageError } = await this.supabase
        .storage
        .from('store-images')
        .remove([image.image_path]);
      
      if (storageError) throw storageError;
    }
    
    // 3. Delete the record from the table
    const { error } = await this.supabase
      .from('store_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // StoreContent CRUD operations
  async getStoreContents(storeCode: string): Promise<StoreContent[]> {
    const { data, error } = await this.supabase
      .from('store_contents')
      .select('*')
      .eq('store_code', storeCode)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async addTextContent(storeCode: string, textContent: string): Promise<StoreContent> {
    // Get the highest display_order to place new content at the end
    const { data: existingContent, error: fetchError } = await this.supabase
      .from('store_contents')
      .select('display_order')
      .eq('store_code', storeCode)
      .order('display_order', { ascending: false })
      .limit(1);
    
    const newOrder = existingContent && existingContent.length > 0 
      ? existingContent[0].display_order + 1 
      : 1;
    
    const storeContent: StoreContent = {
      store_code: storeCode,
      content_type: 'text',
      text_content: textContent,
      display_order: newOrder
    };
    
    const { data, error } = await this.supabase
      .from('store_contents')
      .insert(storeContent)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async addBulletListContent(storeCode: string, bulletPoints: string[]): Promise<StoreContent> {
    // Get the highest display_order to place new content at the end
    const { data: existingContent, error: fetchError } = await this.supabase
      .from('store_contents')
      .select('display_order')
      .eq('store_code', storeCode)
      .order('display_order', { ascending: false })
      .limit(1);
    
    const newOrder = existingContent && existingContent.length > 0 
      ? existingContent[0].display_order + 1 
      : 1;
    
    const storeContent: StoreContent = {
      store_code: storeCode,
      content_type: 'bullet-list',
      bullet_points: bulletPoints,
      display_order: newOrder
    };
    
    const { data, error } = await this.supabase
      .from('store_contents')
      .insert(storeContent)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateBulletListContent(contentId: number, bulletPoints: string[]): Promise<StoreContent> {
    const { data, error } = await this.supabase
      .from('store_contents')
      .update({ bullet_points: bulletPoints })
      .eq('id', contentId)
      .eq('content_type', 'bullet-list')
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async addImageContent(storeCode: string, file: File): Promise<StoreContent> {
    // 1. Upload the file to Supabase Storage
    const fileName = `${storeCode}/${Date.now()}_${file.name}`;
    const { data: fileData, error: uploadError } = await this.supabase
      .storage
      .from('store-images')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // 2. Get public URL for the uploaded file
    const publicUrl = this.supabase
      .storage
      .from('store-images')
      .getPublicUrl(fileName).data.publicUrl;
    
    // 3. Get the highest display_order to place new content at the end
    const { data: existingContent, error: fetchError } = await this.supabase
      .from('store_contents')
      .select('display_order')
      .eq('store_code', storeCode)
      .order('display_order', { ascending: false })
      .limit(1);
    
    const newOrder = existingContent && existingContent.length > 0 
      ? existingContent[0].display_order + 1 
      : 1;
    
    // 4. Create a record in the store_contents table
    const storeContent: StoreContent = {
      store_code: storeCode,
      content_type: 'image',
      image_path: fileName,
      image_url: publicUrl,
      display_order: newOrder
    };
    
    const { data, error } = await this.supabase
      .from('store_contents')
      .insert(storeContent)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateContentOrder(contentId: number, newOrder: number): Promise<StoreContent> {
    const { data, error } = await this.supabase
      .from('store_contents')
      .update({ display_order: newOrder })
      .eq('id', contentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTextContent(contentId: number, newText: string): Promise<StoreContent> {
    const { data, error } = await this.supabase
      .from('store_contents')
      .update({ text_content: newText })
      .eq('id', contentId)
      .eq('content_type', 'text')
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteContent(contentId: number): Promise<void> {
    // 1. Get the content details
    const { data: content, error: fetchError } = await this.supabase
      .from('store_contents')
      .select('*')
      .eq('id', contentId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // 2. If it's an image, delete the file from Storage
    if (content && content.content_type === 'image' && content.image_path) {
      const { error: storageError } = await this.supabase
        .storage
        .from('store-images')
        .remove([content.image_path]);
      
      if (storageError) throw storageError;
    }
    
    // 3. Delete the record from the table
    const { error } = await this.supabase
      .from('store_contents')
      .delete()
      .eq('id', contentId);
    
    if (error) throw error;
  }
}
