import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-private-album-list',
  templateUrl: './private-album-list.component.html',
  styleUrls: ['./private-album-list.component.scss']
})
export class PrivateAlbumListComponent implements OnInit, OnDestroy {
  private albumSubscription!: Subscription;
  albumList: any;

  constructor(private db: AngularFirestore, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const urlParam = this.route.snapshot.paramMap.get('categoryTitle');
    if(urlParam) {
      this.db.collection('album', ref => ref.where('albumCategory', '==', urlParam)).valueChanges({idField: 'id'}).subscribe((data) => {
        this.albumList = data;
      });
    }
  }

  ngOnDestroy(): void {
      this.albumSubscription.unsubscribe();
  }
}
