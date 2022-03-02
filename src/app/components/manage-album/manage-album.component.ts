import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GalleryService } from 'src/app/shared/gallery.service';

@Component({
  selector: 'app-manage-album',
  templateUrl: './manage-album.component.html',
  styleUrls: ['./manage-album.component.scss']
})
export class ManageAlbumComponent implements OnInit, OnDestroy {
  private albumSubscription!: Subscription;
  albums!: any;
  images!: any;

  constructor(private db: AngularFirestore, private gallerySrv: GalleryService) { }

  ngOnInit(): void {
    this.albumSubscription = this.db.collection('album').valueChanges({idField: 'id'}).subscribe((data:any) => {
      this.albums = data;
    });
  }

  ngOnDestroy(): void {
    this.albumSubscription.unsubscribe();
  }

}
