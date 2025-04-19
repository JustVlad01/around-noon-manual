import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Store, StoreImage, StoreContent } from '../../models/store.model';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent implements OnInit {
  currentStore: Store = {
    store_code: '',
    store_address: '',
    description: '',
    google_maps_url: '',
    alarm_code: ''
  };
  
  storeList: Store[] = [];
  storeImages: StoreImage[] = [];
  storeContents: StoreContent[] = [];
  newTextContent: string = '';
  newBulletPoints: string = '';
  editMode: boolean = false;
  selectedFiles: File[] = [];
  uploadingFiles: boolean = false;
  uploadProgress: number = 0;
  saving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private supabaseService: SupabaseService) {
    console.log('ManagerDashboardComponent constructed');
  }

  ngOnInit() {
    console.log('ManagerDashboardComponent initialized');
    this.loadStores();
  }

  async loadStores() {
    console.log('Loading stores...');
    try {
      this.storeList = await this.supabaseService.getStores();
      console.log('Stores loaded:', this.storeList);
    } catch (error) {
      console.error('Error loading stores:', error);
      this.errorMessage = 'Failed to load stores';
    }
  }

  editStore(store: Store) {
    this.editMode = true;
    this.currentStore = { ...store };
    this.loadStoreImages(store.store_code);
    this.loadStoreContents(store.store_code);
  }

  resetForm() {
    this.currentStore = {
      store_code: '',
      store_address: '',
      description: '',
      google_maps_url: '',
      alarm_code: ''
    };
    this.editMode = false;
    this.selectedFiles = [];
    this.storeImages = [];
    this.storeContents = [];
    this.newTextContent = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  async loadStoreImages(storeCode: string) {
    try {
      this.storeImages = await this.supabaseService.getStoreImages(storeCode);
    } catch (error) {
      console.error('Error loading store images:', error);
    }
  }

  async loadStoreContents(storeCode: string) {
    try {
      this.storeContents = await this.supabaseService.getStoreContents(storeCode);
    } catch (error) {
      console.error('Error loading store contents:', error);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  async addTextContentItem() {
    if (!this.newTextContent.trim()) {
      return;
    }

    try {
      await this.supabaseService.addTextContent(
        this.currentStore.store_code,
        this.newTextContent
      );
      
      this.newTextContent = '';
      
      // Reload contents
      await this.loadStoreContents(this.currentStore.store_code);
      
      this.successMessage = 'Text content added successfully';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error adding text content:', error);
      this.errorMessage = 'Failed to add text content';
    }
  }

  async addBulletListContent() {
    if (!this.newBulletPoints.trim()) {
      return;
    }

    try {
      // Split the text by new lines and filter out empty lines
      const bulletPoints = this.newBulletPoints
        .split('\n')
        .map(point => point.trim())
        .filter(point => point.length > 0);

      if (bulletPoints.length === 0) {
        return;
      }

      await this.supabaseService.addBulletListContent(
        this.currentStore.store_code,
        bulletPoints
      );
      
      this.newBulletPoints = '';
      
      // Reload contents
      await this.loadStoreContents(this.currentStore.store_code);
      
      this.successMessage = 'Bullet list added successfully';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error adding bullet list:', error);
      this.errorMessage = 'Failed to add bullet list';
    }
  }

  async deleteContent(contentId: number) {
    try {
      await this.supabaseService.deleteContent(contentId);
      
      // Reload contents
      await this.loadStoreContents(this.currentStore.store_code);
      
      this.successMessage = 'Content deleted successfully';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error deleting content:', error);
      this.errorMessage = 'Failed to delete content';
    }
  }

  async uploadContentImage() {
    if (this.selectedFiles.length === 0) {
      return;
    }

    this.uploadingFiles = true;
    
    try {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        // Update progress
        this.uploadProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100);
        
        // Upload file as content
        await this.supabaseService.addImageContent(
          this.currentStore.store_code, 
          this.selectedFiles[i]
        );
      }
      
      this.uploadingFiles = false;
      this.selectedFiles = [];
      
      // Reload contents
      await this.loadStoreContents(this.currentStore.store_code);
      
      this.successMessage = 'Images uploaded successfully';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      this.errorMessage = 'Failed to upload images';
      this.uploadingFiles = false;
    }
  }

  async saveStore() {
    if (!this.currentStore.store_code || !this.currentStore.store_address) {
      this.errorMessage = 'Store code and address are required';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Add or update store
      let result: Store;
      
      if (this.editMode && this.currentStore.id) {
        // Update existing store
        result = await this.supabaseService.updateStore(this.currentStore);
      } else {
        // Create new store
        result = await this.supabaseService.createStore(this.currentStore);
      }

      // Success
      this.successMessage = `Store ${this.editMode ? 'updated' : 'added'} successfully`;
      this.loadStores();
      
      if (!this.editMode) {
        // Reset form if adding a new store
        this.resetForm();
      }
    } catch (error) {
      console.error('Error saving store:', error);
      this.errorMessage = `Failed to ${this.editMode ? 'update' : 'add'} store`;
    } finally {
      this.saving = false;
    }
  }
}
