import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Store } from '../../models/store.model';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './driver-dashboard.component.html',
  styleUrl: './driver-dashboard.component.scss'
})
export class DriverDashboardComponent implements OnInit {
  storeCode: string = '';
  storeList: Store[] = [];
  showError: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load recently accessed stores if available
    const recentStores = localStorage.getItem('recentStores');
    if (recentStores) {
      this.storeList = JSON.parse(recentStores);
    }
  }

  async searchStore() {
    if (!this.storeCode.trim()) return;

    try {
      const store = await this.supabaseService.getStoreByCode(this.storeCode);
      
      if (!store) {
        this.showError = true;
        return;
      }
      
      // Store in recent stores
      this.addToRecentStores(store);
      
      // Navigate to store details
      this.router.navigate(['/store', this.storeCode]);
    } catch (error) {
      console.error('Error searching for store:', error);
      this.showError = true;
    }
  }

  private addToRecentStores(store: Store) {
    // Add to recent stores and save to localStorage
    let recentStores = localStorage.getItem('recentStores');
    let storeList: Store[] = recentStores ? JSON.parse(recentStores) : [];
    
    // Check if store already exists
    const existingIndex = storeList.findIndex(s => s.store_code === store.store_code);
    if (existingIndex >= 0) {
      // Remove it to add it at the top
      storeList.splice(existingIndex, 1);
    }
    
    // Add store to the beginning of the list
    storeList.unshift(store);
    
    // Keep only the most recent 5 stores
    if (storeList.length > 5) {
      storeList = storeList.slice(0, 5);
    }
    
    // Update local store list and localStorage
    this.storeList = storeList;
    localStorage.setItem('recentStores', JSON.stringify(storeList));
  }
}
