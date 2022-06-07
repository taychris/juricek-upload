import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as AOS from 'aos'; 

// @HostListener('window:scroll', ['$event'])

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  @Input() isScrolled!: boolean;
  @Output() target : EventEmitter<string>= new EventEmitter<string>();
  isOpen = false;

  constructor() { }

  ngOnInit(): void {
    AOS.init();
  }
  
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  navigateTo(target: string, isMobile: boolean) {
    this.target.emit(target);
    if(isMobile) {
      this.toggleMenu();
    }
  }
}
