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
  urlParam!: any;

  constructor(private db: AngularFirestore, private route: ActivatedRoute) {
    this.urlParam = this.route.snapshot.paramMap.get('categoryTitle'); 
  }

  ngOnInit(): void {
    if(this.urlParam) {
      this.albumSubscription = this.db.collection('album', ref => ref.where('albumCategory', '==', this.urlParam)).valueChanges({idField: 'id'}).subscribe((data) => {
        this.albumList = data;
      });
    }
  }

  ngOnDestroy(): void {
      this.albumSubscription.unsubscribe();
  }
}
