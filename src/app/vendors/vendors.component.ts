import { Component, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';


import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Vendor, VendorService } from '../services/vendor.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [
    SideBarComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.css']
})
export class VendorsComponent implements OnInit {
  vendors$: Observable<Vendor[]>|null=null;
  vendorForm: FormGroup;
  isAdmin = false;
  isEditing = false;
  editingVendorId: string | null = null;
  showForm=false
  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.vendorForm = this.createVendorForm();
  }

  async ngOnInit() {
    this.vendors$=await this.vendorService.getVendors()
    this.isAdmin = await this.authService.isAdmin();
  }

  private createVendorForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      services: ['', Validators.required]
    });
  }
  openVendorForm() {
    this.showForm = true
    this.vendorForm.reset();
    this.isEditing = false;
  }
  async onSubmit() {
    if (this.vendorForm.valid) {
      try {
        const formValue = this.vendorForm.value;
        
        const vendorData = {
          ...formValue,
          services: formValue.services.split(',').map((s: string) => s.trim())
        };

        if (this.isEditing && this.editingVendorId) {
          await this.vendorService.updateVendor(this.editingVendorId, vendorData);
        } else {
          await this.vendorService.addVendor(vendorData);
        }

        this.vendorForm.reset();
        this.isEditing = false;
        this.editingVendorId = null;
      } catch (error) {
        console.error('Error saving vendor:', error);
      }
    }
  }

  editVendor(vendor: Vendor) {
    if (vendor.id) {  // Add null check for id
      this.showForm=true
      this.isEditing = true;
      this.editingVendorId = vendor.id;
      this.vendorForm.patchValue({
        name: vendor.name,
        contact: vendor.contact,
        email: vendor.email,
        services: vendor.services.join(', ')
      });
    }
  }

  async deleteVendor(id: string) {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        await this.vendorService.deleteVendor(id);
      } catch (error) {
        console.error('Error deleting vendor:', error);
      }
    }
  }

  cancelEdit() {
    this.showForm = false;
    this.isEditing = false;
    this.editingVendorId = null;
    this.vendorForm.reset();
  }
}