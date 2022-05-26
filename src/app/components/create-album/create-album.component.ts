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
  selector: 'app-create-album',
  templateUrl: './create-album.component.html',
  styleUrls: ['./create-album.component.scss']
})
export class CreateAlbumComponent implements OnInit, OnDestroy {
 //used for state management
 state$!: Observable<AppState>;
 albumTitleDisplay!: string;
 albumTitleFormatted!: string;
 coverImageId!: string;
 fsId: string = '';
 coverChosen!: boolean;
 albumStatus!: string;
 titleAvailable: boolean = true;

 albumTitleForm: FormGroup;
 albumTitleEditState: boolean = false;

 isHovering!: boolean;

 files: File[] = [];
 uploadedFiles!: any;

 categoryList!: any;

 //used for state management
 private stateSubscription!: Subscription;
 private gallerySubscription!: Subscription;
 private categorySubscription!: Subscription;
 fileNameErrorList: string[] = [];

 constructor(private store: Store, private fb: FormBuilder, private gallerySvc: GalleryService, private db: AngularFirestore, private location: Location, private router: Router, private toastr: ToastrService) {
   //used for state management
   this.state$ = this.store.select(state => state.app);
   
   this.stateSubscription = this.state$.subscribe((state:any) => {
     this.albumTitleDisplay = state.albumTitleDisplay;
     this.albumTitleFormatted = state.albumTitleFormatted;
     this.coverImageId = state.coverImageId;
     this.fsId = state.fsId;
     this.coverChosen = state.coverChosen;
     this.albumStatus = state.status;
   });

   this.albumTitleForm = this.fb.group({
     albumTitle: ['', Validators.required],
     albumCategory: ['', Validators.required],
   });

   this.checkAlbumTitleAvailability = debounce(this.checkAlbumTitleAvailability, 400);
 }

 ngOnInit() {
   this.fetchGalleryItems();
   this.fetchCategories();
 }

 onImageUploaded() {
   this.fetchGalleryItems();
 }

 fetchGalleryItems() {
   if(this.albumTitleDisplay || this.albumTitleFormatted) {
     this.db.collection('gallery', ref => ref.where('albumId', '==', this.fsId)).valueChanges({idField: 'id'}).subscribe((data:any) => {
       this.uploadedFiles = data;
     });
   }
 }

 fetchCategories() {
   this.categorySubscription = this.db.collection('category').valueChanges({idField: 'id'}).subscribe((data: any) => {
      this.categoryList = data;
   });
 }

 toggleEdit() {
   this.albumTitleEditState = !this.albumTitleEditState;
 }

 checkAlbumTitleAvailability(albumTitle: any) {
   const value = albumTitle.target.value;
   const formattedAlbumTitle = urlSlug(value);

   if(formattedAlbumTitle.length > 0) {
    this.gallerySvc.checkAlbumTitleList(formattedAlbumTitle).toPromise().then((data) => {
      data.data() ? this.titleAvailable = false : this.titleAvailable = true;
     })
   }
 }

 albumTitleCreate(albumTitle: string, albumCategory: string) {
   const formattedAlbumTitle = urlSlug(albumTitle)
   this.fsId = this.db.createId();
   
   this.gallerySvc.createAlbumTitle(this.fsId, albumTitle, formattedAlbumTitle, albumCategory, '', false).then(() => {
   
    //update state of the app
    this.store.dispatch([
      new SetAlbumTitle(albumTitle, formattedAlbumTitle, this.fsId, false),
    ]);

     this.albumTitleForm.reset();
   });
 }

 updateAlbumTitle(albumTitleEdit: string) {
   const formattedAlbumTitle = urlSlug(albumTitleEdit);

   //update state of the app
   if(formattedAlbumTitle !== this.albumTitleFormatted) {
     this.gallerySvc.updateAlbumTitle(this.fsId, albumTitleEdit, formattedAlbumTitle).then(() => {
       this.toggleEdit();

       this.toastr.success("Úspešne zmenený názov.");
     
       this.store.dispatch([
        new SetAlbumTitle(albumTitleEdit, formattedAlbumTitle, this.fsId, this.coverChosen),
      ]);
     })
     .catch((e:any) => {
       console.log(e);
     });
   } else {
     this.toggleEdit();
   }
 }

 finishAlbum() {
   if(this.coverChosen === false) {
    this.toastr.info("Titulná fotka musí byť nastavená.");
   } else {
     this.gallerySvc.publishAlbum(this.fsId).then(() => {
      //  window.alert('Successfully published album.');
       this.toastr.success("Úspešne zverejnený album.");
       this.store.dispatch([
         new AlbumCleared()
       ]);
       this.router.navigate(['/dashboard']);
     });
   }
 }

 cancelAlbum() {
   this.gallerySvc.deleteAlbum(this.fsId, this.uploadedFiles, this.albumTitleFormatted).then(() => {
     console.log('Successfully deleted album.');
     
     this.toastr.success("Úspešne zrušený album.");
   });
   
   this.store.dispatch([
    new AlbumCancelled()
  ]);

  this.location.back();
 }

 makeCoverPhoto(albumId: string, downloadUrl: string, imageId: string, isCover: boolean) {
   if(isCover === true) {
     window.alert('Image is already a cover photo')
   } else {
     if(!this.coverImageId) {
       this.gallerySvc.setAlbumCover(albumId, downloadUrl, imageId).then(() => {
         this.toastr.success("Titulná fotka nastavená.");
         this.store.dispatch([
           new SetCoverImageId(imageId),
         ]);
       });
     }
     if(this.coverImageId !== imageId) {
       this.gallerySvc.updateAlbumCover(albumId, downloadUrl, imageId, this.coverImageId).then(() => {
        this.toastr.success("Titulná fotka zmenená.");
         this.store.dispatch([
           new SetCoverImageId(imageId)
         ]);
       });
     }
   }
 }

 deleteImage(imageId: string, downloadUrl: string, isCover: boolean) {
   this.gallerySvc.deleteImage(imageId, downloadUrl).then(() => {
     console.log('Successfully deleted.');
     if(isCover) {
       this.toastr.success("Titulná fotka bola vymazaná.");
       this.store.dispatch([
         new SetCoverImageId(''),
       ]);
     } else {
      this.toastr.success("Fotka bola vymazaná.");
     }
   })
   .catch((e:any) => {
     console.log(e);
   });
 }

 //toggle the hovering effect - find it in scss
 toggleHover(event: boolean) {
   this.isHovering = event;
 }

 //limit file size, upload when dragged
 onDrop(files: FileList) {
   for (let i = 0; i < files.length; i++) {
     if(files.item(i)!.size > 3200000) {
       this.fileNameErrorList.push(files.item(i)!.name);
     } else {
       this.files.push(files.item(i)!);
     }
   }
 }

 //used for button click upload
 fileBrowseHandler(files: any) {
   if(files.target.files) {
     this.onDrop(files.target.files);
   }
 }

 ngOnDestroy(): void {
   this.stateSubscription.unsubscribe();
   if(this.gallerySubscription) {
     this.gallerySubscription.unsubscribe();
   }
   if(this.categorySubscription) {
     this.categorySubscription.unsubscribe();
   }
 }
}