import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'dashboard-button',
  templateUrl: './dashboard-button.component.html',
  styleUrls: ['./dashboard-button.component.scss']
})
export class DashboardButtonComponent implements OnInit {
  currentUrl!: string;

  constructor(public authService: AuthService, private location:Location) { 
    this.location.onUrlChange((path:any) => {
      this.currentUrl = path;
    })
  }

  ngOnInit(): void {
  }

}
