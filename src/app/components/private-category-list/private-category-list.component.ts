import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-private-category-list',
  templateUrl: './private-category-list.component.html',
  styleUrls: ['./private-category-list.component.scss']
})
export class PrivateCategoryListComponent implements OnInit, OnDestroy {
  private categoryListSubscription!: Subscription;
  categoryList: any;

  constructor(private db: AngularFirestore) { }

  ngOnInit(): void {
    this.categoryListSubscription = this.db.collection('category').valueChanges({idField: 'id'}).subscribe((data) => {
      this.categoryList = data;
    });
  }

  ngOnDestroy(): void {
    this.categoryListSubscription.unsubscribe();
  }
}
