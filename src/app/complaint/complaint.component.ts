import { Component, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { AuthService } from '../services/auth.service';
import { Complaint, ComplaintService } from '../services/complaint.service';
import { collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-complaint',
  imports: [SideBarComponent, CommonModule, FormsModule],
  templateUrl: './complaint.component.html',
  styleUrl: './complaint.component.css',
})
export class ComplaintComponent implements OnInit {
  complaint: Complaint[] = [];
  userRole: string | null = null;
  newComplaintContent: string = '';
  selectedFilter: string = 'all';
  searchText: string = '';
  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private firestore: Firestore
  ) {}
  ngOnInit(): void {
    this.complaintService.complaint$.subscribe((complaint) => {
      this.complaint = complaint;
    });
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          this.userRole = userDoc.data()['role'];
        }
      }
    });
  }
  async fileComplaint() {
    if (!this.newComplaintContent.trim()) {
      return;
    }
    try {
      await this.complaintService.addComplaint(
        this.newComplaintContent,
        'text'
      );
      this.newComplaintContent = '';
    } catch (error) {
      console.error('Error Filing Complaint: ', error);
      throw error;
    }
  }
  async updateStatus(complaintId: string, status: 'pending' | 'resolved') {
    try {
      await this.complaintService.updateComplaint(complaintId, status);
    } catch (error) {
      console.error('Error Updating Status: ', error);
      throw error;
    }
  }
  filterComplaint(status: string) {
    this.selectedFilter = status;
  }
  get filteredComplaints() {
    let filtered = this.complaint;

    // Filter by status
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(
        (complaint) => complaint.status === this.selectedFilter
      );
    }

    // Filter by search text
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (complaint) =>
          complaint.content.toLowerCase().includes(searchLower) ||
          complaint.username?.toLowerCase().includes(searchLower) ||
          complaint.id?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }
}
