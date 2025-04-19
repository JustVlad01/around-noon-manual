import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Store, StoreImage, StoreContent } from '../../models/store.model';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-store-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FormsModule],
  templateUrl: './store-details.component.html',
  styleUrl: './store-details.component.scss'
})
export class StoreDetailsComponent implements OnInit {
  store: Store | null = null;
  storeImages: StoreImage[] = [];
  storeContents: StoreContent[] = [];
  loading: boolean = true;
  selectedImage: string = '';
  
  // New properties for adding content
  newTextContent: string = '';
  newBulletPoints: string = '';
  selectedFiles: File[] = [];
  uploadingFiles: boolean = false;
  uploadProgress: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  showAddContentForm: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const storeCode = params['storeCode'];
      if (storeCode) {
        this.loadStoreDetails(storeCode);
      }
    });
  }

  async loadStoreDetails(storeCode: string) {
    this.loading = true;
    
    try {
      // Get store details
      this.store = await this.supabaseService.getStoreByCode(storeCode);
      
      if (!this.store) {
        return;
      }
      
      // Get store images (legacy support)
      this.storeImages = await this.supabaseService.getStoreImages(storeCode);
      
      // Get store contents
      await this.loadStoreContents(storeCode);
      
    } catch (error) {
      console.error('Error loading store details:', error);
      this.store = null;
    } finally {
      this.loading = false;
    }
  }
  
  async loadStoreContents(storeCode: string) {
    try {
      this.storeContents = await this.supabaseService.getStoreContents(storeCode);
    } catch (error) {
      console.error('Error loading store contents:', error);
      this.errorMessage = 'Failed to load store contents';
    }
  }

  openImage(imageUrl: string, content: any) {
    this.selectedImage = imageUrl;
    this.modalService.open(content, { size: 'lg', centered: true });
  }
  
  toggleAddContentForm() {
    this.showAddContentForm = !this.showAddContentForm;
    // Reset form fields when toggling
    if (this.showAddContentForm) {
      this.newTextContent = '';
      this.newBulletPoints = '';
      this.selectedFiles = [];
      this.errorMessage = '';
      this.successMessage = '';
    }
  }
  
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }
  
  async addTextContentItem() {
    if (!this.newTextContent.trim() || !this.store) {
      return;
    }

    try {
      await this.supabaseService.addTextContent(
        this.store.store_code,
        this.newTextContent
      );
      
      this.newTextContent = '';
      
      // Reload contents
      await this.loadStoreContents(this.store.store_code);
      
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
    if (!this.newBulletPoints.trim() || !this.store) {
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
        this.store.store_code,
        bulletPoints
      );
      
      this.newBulletPoints = '';
      
      // Reload contents
      await this.loadStoreContents(this.store.store_code);
      
      this.successMessage = 'Bullet list added successfully';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error adding bullet list:', error);
      this.errorMessage = 'Failed to add bullet list';
    }
  }

  async uploadContentImage() {
    if (this.selectedFiles.length === 0 || !this.store) {
      return;
    }

    this.uploadingFiles = true;
    
    try {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        // Update progress
        this.uploadProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100);
        
        // Upload file as content
        await this.supabaseService.addImageContent(
          this.store.store_code, 
          this.selectedFiles[i]
        );
      }
      
      this.uploadingFiles = false;
      this.selectedFiles = [];
      
      // Reload contents
      await this.loadStoreContents(this.store.store_code);
      
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
  
  async deleteContent(contentId: number) {
    if (!this.store) return;
    
    try {
      await this.supabaseService.deleteContent(contentId);
      
      // Reload contents
      await this.loadStoreContents(this.store.store_code);
      
      this.successMessage = 'Content deleted successfully';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('Error deleting content:', error);
      this.errorMessage = 'Failed to delete content';
    }
  }
}
