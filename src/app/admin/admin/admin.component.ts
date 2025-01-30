import { Component } from '@angular/core';
import { DashboardComponent } from "../../dashboard/dashboard.component";
import { SideBarComponent } from "../../side-bar/side-bar.component";

@Component({
  selector: 'app-admin',
  imports: [DashboardComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
