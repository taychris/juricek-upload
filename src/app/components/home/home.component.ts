import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GalleryService } from 'src/app/shared/gallery.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  categorySubscription!: Subscription;
  categoryList!: any;

  constructor(private gSvc: GalleryService) { }

  ngOnInit(): void {
    this.categorySubscription = this.gSvc.getAllCategories().valueChanges({idField: 'id'}).subscribe((data) => {
      data ? this.categoryList = data : console.log('No categories found.');
    })
  }

  ngOnDestroy(): void {
    this.categorySubscription ? this.categorySubscription.unsubscribe() : null;
  }
}
