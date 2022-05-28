import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Store } from '@ngxs/store';
import { SetCategoryDetails, ResetCategoryDetails } from 'src/app/shared/state/app.actions';
import { AppState } from 'src/app/shared/state/app.state';

@Component({
  selector: 'app-create-category-title',
  templateUrl: './create-category-title.component.html',
  styleUrls: ['./create-category-title.component.scss']
})
export class CreateCategoryTitleComponent implements OnInit, OnDestroy {
  //used for state management
  state$!: Observable<AppState>;
  categoryId!: string;
  categoryTitle!: string;
  
  categoryForm: FormGroup;

  stateSubscription!: Subscription;
  constructor(private store: Store, private fb: FormBuilder, private db: AngularFirestore) { 
    this.categoryForm = this.fb.group({
      categoryTitle: ['', Validators.required],
    });

    this.state$ = this.store.select(state => state.app);

    this.stateSubscription = this.state$.subscribe((state:any) => {
      this.categoryTitle = state.categoryTitle;
      this.categoryId = state.categoryId;
    });
  }

  ngOnInit(): void {
  }

  setCategoryTitle(categoryTitle: string) {
    this.categoryId = this.db.createId();

    this.db.collection('category').doc(this.categoryId).set({ id: this.categoryId, categoryTitle: categoryTitle, downloadURL: 'default', path: '', published: false  }).then(() => {
      this.store.dispatch([
        new SetCategoryDetails(categoryTitle, 'default', 'default', this.categoryId)
      ]);
    })
    .catch((e:any) => {
      console.log(e);
    })
  }

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
    this.store.dispatch([
      new ResetCategoryDetails()
    ]);
  }
}
