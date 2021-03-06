import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxMasonryComponent } from 'ngx-masonry';
import { Subscription } from 'rxjs';
import { GalleryService } from 'src/app/shared/gallery.service';
import { revert, TITLECASE_TRANSFORMER } from 'url-slug';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  albumTitleFormattedURL!: string;
  albumTitleDisplayURL!: string;
  galleryItems!: any;
  gallerySubscription!: Subscription;
  showSpinner: boolean = true;

  @ViewChild(NgxMasonryComponent) masonry!: NgxMasonryComponent;
  constructor(private gSvc: GalleryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.albumTitleFormattedURL = this.route.snapshot.paramMap.get('albumTitle') as string;

    this.albumTitleDisplayURL = revert(this.albumTitleFormattedURL, {
      separator: '-',
      transformer: TITLECASE_TRANSFORMER
    })

    this.albumTitleFormattedURL ? this.galleryItems = this.gSvc.getGallery(this.albumTitleFormattedURL).valueChanges({idField: 'id'}).subscribe((data) => {
      this.galleryItems = data;
      
      if(this.galleryItems.length > 0) {
        var masonryLoaded = document.getElementById('masonry');
        var messageLoaded = document.getElementById('message');
        if (masonryLoaded || messageLoaded) {
          this.showSpinner = false;
        }
      } else {
        console.log('No items were found for this album.');
        this.showSpinner = false;
      }
    }) : null;
  }

  ngOnDestroy(): void {
    this.gallerySubscription ? this.gallerySubscription.unsubscribe() : null;
  }
}