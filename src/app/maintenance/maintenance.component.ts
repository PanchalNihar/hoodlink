import { Component, OnDestroy, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import {
  Maintenance,
  MaintenanceService,
} from '../services/maintenance.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-maintenance',
  imports: [SideBarComponent, FormsModule, CommonModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css',
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  stats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
  };
  activeRequest: Maintenance[] = [];
  filteredRequests: Maintenance[] = [];
  isAdmin = false;
  showNewRequestForm = false;
  currentFilter: Maintenance['status'] | null = null;
  currentViewTitle = '';
  currentViewSubtitle = '';
  private subscriptions: Subscription[] = [];
  newRequest = {
    description: '',
    amount: 0,
    dueDate: '',
    priority: 'medium' as const,
    unit: '',
  };

  constructor(
    private maintenanceService: MaintenanceService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      this.isAdmin = await this.authService.isAdmin();

      // Subscribe to stats updates
      this.subscriptions.push(
        this.maintenanceService.getMaintenanceStat().subscribe((stats) => {
          this.stats = stats;
        })
      );

      // Subscribe to active requests updates
      const activeRequestsObservable =
        await this.maintenanceService.getActicveRequest();
      this.subscriptions.push(
        activeRequestsObservable.subscribe((requests) => {
          this.activeRequest = requests;
          if (this.currentFilter) {
            this.filterRequestsByStatus(this.currentFilter);
          }
        })
      );
    } catch (error) {
      console.error('Error initializing maintenance component:', error);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  filterRequestsByStatus(status: Maintenance['status']) {
    this.currentFilter = status;
    this.filteredRequests = this.activeRequest.filter(
      (request) => request.status === status
    );

    // Update view title and subtitle based on filter
    switch (status) {
      case 'pending':
        this.currentViewTitle = 'Pending Maintenance Requests';
        this.currentViewSubtitle = 'Requests awaiting action';
        break;
      case 'in_progress':
        this.currentViewTitle = 'In Progress Maintenance Requests';
        this.currentViewSubtitle = 'Requests currently being worked on';
        break;
      case 'completed':
        this.currentViewTitle = 'Completed Maintenance Requests';
        this.currentViewSubtitle = 'Requests that have been resolved';
        break;
    }
  }

  clearFilter() {
    this.currentFilter = null;
    this.filteredRequests = [];
    this.currentViewTitle = '';
    this.currentViewSubtitle = '';
  }

  async createRequest() {
    try {
      await this.maintenanceService.createMaintenanceRequest(this.newRequest);
      this.showNewRequestForm = false;
      this.newRequest = {
        description: '',
        amount: 0,
        dueDate: '',
        priority: 'medium',
        unit: '',
      };
    } catch (error) {
      console.error('Error creating request:', error);
      // Handle error appropriately (show user feedback)
    }
  }

  async updateStatus(requestId: string, status: Maintenance['status']) {
    try {
      await this.maintenanceService.updateRequestStatus(requestId, status);
    } catch (error) {
      console.error('Error updating status:', error);
      // Handle error appropriately (show user feedback)
    }
  }
}
