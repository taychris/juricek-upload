import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GalleryService } from 'src/app/shared/gallery.service';
import { NgxMasonryComponent } from 'ngx-masonry';


@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent implements OnInit, OnDestroy {
  albumCategory!: string | null;
  albumList!: any;
  albumSubscription!: Subscription;
  showSpinner: boolean = true;

  constructor(private gSvc: GalleryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.albumCategory = this.route.snapshot.paramMap.get('category');

    this.albumCategory ? this.albumSubscription = this.gSvc.getAlbum(this.albumCategory).valueChanges({idField: 'id'}).subscribe((data) => {
      this.albumList = data
      if(this.albumList.length > 0) {
        var masonryLoaded = document.getElementById('masonry');
        var messageLoaded = document.getElementById('message');
        if (masonryLoaded || messageLoaded) {
          this.showSpinner = false;
        }
      } else {
        console.log('No albums were found for this category.');
        this.showSpinner = false;
      }
    }) : null;
  }
  
  @ViewChild(NgxMasonryComponent) masonry!: NgxMasonryComponent;
  // ngAfterViewInit(): void {
  // }

  ngOnDestroy(): void {
    this.albumSubscription ? this.albumSubscription.unsubscribe() : null;
  }
}
