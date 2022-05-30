import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { GalleryService } from 'src/app/shared/gallery.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  allAlbumsLoaded: boolean = false;
  categoryList!: any;
  albumList!: any;
  albumListConstant!: any;
  categorySelected!: string;
  categoryChangeEvent = new Subject<any>();
  categorySubscription!: Subscription;
  albumSubscription!: Subscription;
  subjectSubscription!: Subscription;

  constructor(private gallerySvc: GalleryService) { }

  ngOnInit(): void {
    this.categorySubscription = this.gallerySvc.getAllCategories().valueChanges({idField: 'id'}).subscribe((data:any) => {
      if(data.length > 0) {
        this.categoryList = data;
        this.emitCategoryValue(data[0].categoryTitle);
      }
    });

    this.subjectSubscription = this.categoryChangeEvent.subscribe((data:any) => {
      this.categorySelected = data;

      if(this.categorySelected && this.categorySelected !== 'all' && this.allAlbumsLoaded === false) {
        this.albumSubscription = this.gallerySvc.getAlbum(data).valueChanges({idField: 'id'}).subscribe((items:any) => {
          this.albumList = items;
        });
      }

      if(this.categorySelected === 'all' && this.allAlbumsLoaded === false) {
        this.albumSubscription = this.gallerySvc.getAllAlbums().valueChanges({idField: 'id'}).subscribe((items:any) => {
          this.albumList = items;
          this.albumListConstant = items;

          this.allAlbumsLoaded = true;
        });
      }

      if(this.categorySelected === 'all' && this.allAlbumsLoaded === true) {
        this.albumList = this.albumListConstant;
      }
      
      if(this.categorySelected !== 'all' && this.allAlbumsLoaded === true) {
        this.albumList = this.albumListConstant.filter((x :any) => x.albumCategory === this.categorySelected);
      }
    });
  }

  emitCategoryValue(category: string) {
    this.categoryChangeEvent.next(category);
  }

  ngOnDestroy(): void {
    this.categorySubscription.unsubscribe();
    this.subjectSubscription.unsubscribe();
    if(this.albumSubscription) {
      this.albumSubscription.unsubscribe();
    }
  }

}
