import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GalleryService } from 'src/app/shared/gallery.service';


@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent implements OnInit, OnDestroy {
  albumCategory!: string | null;
  albumList!: any;
  albumSubscription!: Subscription;

  constructor(private gSvc: GalleryService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.albumCategory = this.route.snapshot.paramMap.get('category');

    this.albumCategory ? this.albumSubscription = this.gSvc.getAlbum(this.albumCategory).valueChanges({idField: 'id'}).subscribe((data) => {
      data ? this.albumList = data : console.log('No albums were found for this category.');
    }) : null;
  }

  ngOnDestroy(): void {
    this.albumSubscription ? this.albumSubscription.unsubscribe() : null;
  }
}
