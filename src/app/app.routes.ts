import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DriverDashboardComponent } from './components/driver-dashboard/driver-dashboard.component';
import { ManagerDashboardComponent } from './components/manager-dashboard/manager-dashboard.component';
import { StoreDetailsComponent } from './components/store-details/store-details.component';
import { ManagerLoginComponent } from './components/manager-login/manager-login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'driver', component: DriverDashboardComponent },
  { path: 'manager/login', component: ManagerLoginComponent },
  { path: 'manager', component: ManagerDashboardComponent },
  { path: 'store/:storeCode', component: StoreDetailsComponent },
  { path: '**', redirectTo: '' }
];
