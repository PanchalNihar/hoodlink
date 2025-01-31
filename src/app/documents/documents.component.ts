import { Component, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import {
  Document,
  DocumentsService,
  UploadStatus,
} from '../services/documents.service';
import { AuthService } from '../services/auth.service';
import { Observable, Observer } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-documents',
  imports: [SideBarComponent, FormsModule, CommonModule, DatePipe],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
})
export class DocumentsComponent implements OnInit {
  documents$!: Observable<Document[]>;
  isAdmin: boolean = false;
  uploadStatus$!: Observable<UploadStatus>;
  categories = [
    { name: 'Contracts', icon: 'fa-file-contract' },
    { name: 'Invoices', icon: 'fa-file-invoice' },
    { name: 'Reports', icon: 'fa-file-alt' },
    { name: 'Forms', icon: 'fa-file-pdf' },
  ];
  constructor(
    private docService: DocumentsService,
    private authService: AuthService
  ) {
    this.documents$ = this.docService.documents$;
    this.uploadStatus$ = this.docService.uploadStatus$;
  }
  async ngOnInit() {
    this.documents$ = this.docService.getDocuments();
    this.isAdmin = await this.authService.isAdmin();
  }
  getDocumentCount(categoryName: string, documents: Document[] | null): number {
    if (!documents) return 0;
    return documents.filter((doc) => doc.category === categoryName).length;
  }
  isPdfFile(filename: string): boolean {
    return filename.toLowerCase().endsWith('.pdf');
  }

  isWordFile(filename: string): boolean {
    return (
      filename.toLowerCase().endsWith('.doc') ||
      filename.toLowerCase().endsWith('.docx')
    );
  }

  isExcelFile(filename: string): boolean {
    return (
      filename.toLowerCase().endsWith('.xls') ||
      filename.toLowerCase().endsWith('.xlsx')
    );
  }

  isOtherFile(filename: string): boolean {
    return (
      !this.isPdfFile(filename) &&
      !this.isWordFile(filename) &&
      !this.isExcelFile(filename)
    );
  }
  async onFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    try {
      const title = file.name;
      const category = this.determineCategory(file.name);

      // Subscribe to upload progress if needed
      this.docService.uploadProgress$.subscribe((progress) => {
        console.log('Upload progress:', progress);
      });

      await this.docService.uploadDocuments(file, title, category);
    } catch (error) {
      console.error('Upload Failed:', error);
      // Handle error in UI
    }
  }
  private determineCategory(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'Forms';
      case 'docs':
      case 'docx':
        return 'Reports';
      case 'xls':
      case 'xlsx':
        return 'Invoices';
      default:
        return 'Others';
    }
  }
  async deleteDocument(doc: Document) {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await this.docService.deleteDocument(doc);
      } catch (error) {
        console.log('Delete Failed:', error);
      }
    }
  }
  downloadDocument(doc: Document) {
    this.docService.downloadDocument(doc);
  }
}
