import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin/admin.component';
import { authGuard } from './auth.guard';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ComplaintComponent } from './complaint/complaint.component';
import { DocumentsComponent } from './documents/documents.component';
import { VendorsComponent } from './vendors/vendors.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
  },
  {
    path: 'manage-user',
    component: ManageUsersComponent,
    canActivate: [authGuard],
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent,
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'complaint',
    component: ComplaintComponent,
    canActivate: [authGuard],
  },
  {
    path: 'documents',
    component: DocumentsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'vendors',
    component: VendorsComponent,
    canActivate: [authGuard],
  },
  {
    path:'profile',
    component:ProfileComponent,
    canActivate:[authGuard]
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
