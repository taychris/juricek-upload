import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetAlbumTitle, AlbumCancelled, SetAlbumTitleBefore, SetCoverImageId, AlbumCleared } from 'src/app/shared/state/app.actions';
import { AppState } from 'src/app/shared/state/app.state';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GalleryService } from 'src/app/shared/gallery.service';
import { debounce } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import urlSlug from 'url-slug';

@Component({
  selector: 'app-create-album-title',
  templateUrl: './create-album-title.component.html',
  styleUrls: ['./create-album-title.component.scss']
})
export class CreateAlbumTitleComponent implements OnInit, OnDestroy {
  //used for state management
  state$!: Observable<AppState>;
  albumTitleDisplay!: string;
  albumTitleFormatted!: string;
  fsId: string = '';
  categoryId: string = '';
  categoryTitle: string = '';

  albumStatus!: string;
  titleAvailable!: boolean;
 
  albumTitleForm: FormGroup;

  categoryList!: any;

  //used for state management
  private stateSubscription!: Subscription;
  private categorySubscription!: Subscription;
  constructor(private store: Store, private fb: FormBuilder, private gallerySvc: GalleryService, private db: AngularFirestore, private location: Location, private router: Router, private toastr: ToastrService) {//used for state management
    this.state$ = this.store.select(state => state.app);
    
    this.stateSubscription = this.state$.subscribe((state:any) => {
      this.albumTitleDisplay = state.albumTitleDisplay;
      this.albumTitleFormatted = state.albumTitleFormatted;
      this.fsId = state.fsId;
      this.albumStatus = state.status;
    });
 
    this.albumTitleForm = this.fb.group({
      albumTitle: ['', Validators.required],
      albumCategory: ['', Validators.required],
    });
 
    this.checkAlbumTitleAvailability = debounce(this.checkAlbumTitleAvailability, 400);
  }
 
  ngOnInit() {
    this.fetchCategories();
  }

  setCategoryId(categoryId: any) {
    this.categoryId = JSON.parse(categoryId).id;
    this.categoryTitle = JSON.parse(categoryId).categoryTitle;
  }
 
  fetchCategories() {
    this.categorySubscription = this.db.collection('category').valueChanges({idField: 'id'}).subscribe((data: any) => {
       this.categoryList = data;
    });
  }
 
  checkAlbumTitleAvailability(albumTitle: any) {
    const value = albumTitle.target.value;
    const formattedAlbumTitle = urlSlug(value);
 
    if(formattedAlbumTitle.length > 0) {
     this.gallerySvc.checkAlbumTitleList(formattedAlbumTitle).toPromise().then((data) => {
       if(data.data()) {
         this.titleAvailable = false;
         this.toastr.error("Názov albumu už existuje.");
       } else {
         this.titleAvailable = true;
       }
      })
    }
  }
 
  albumTitleCreate(albumTitle: string) {
    const formattedAlbumTitle = urlSlug(albumTitle);
    this.fsId = this.db.createId();
    
    this.gallerySvc.createAlbumTitle(this.fsId, albumTitle, formattedAlbumTitle, this.categoryTitle, '', false, this.categoryId).then(() => {
    
     //update state of the app
     this.store.dispatch([
       new SetAlbumTitle(albumTitle, formattedAlbumTitle, this.fsId, this.categoryId, false),
     ]);
 
      this.albumTitleForm.reset();
    });
  }
 
  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
    if(this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }
 }