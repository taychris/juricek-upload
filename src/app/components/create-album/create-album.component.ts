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
import { debounceTime } from 'rxjs/operators';


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
 categoryId: string = '';
 coverChosen!: boolean;
 albumStatus!: string;
 albumData!: any;
 titleAvailable!: boolean | null;
 loading!: boolean;

//  albumTitleForm: FormGroup;
 albumTitleEditState: boolean = false;

 isHovering!: boolean;

 files: File[] = [];
 uploadedFiles!: any;

 categoryList!: any;

 //used for state management
 private stateSubscription!: Subscription;
//  private categorySubscription!: Subscription;
 private albumSubscription!: Subscription;
 private gallerySubscription!: Subscription;
 fileNameErrorList: string[] = [];

 constructor(private store: Store, private fb: FormBuilder, private gallerySvc: GalleryService, private db: AngularFirestore, private location: Location, private router: Router, private toastr: ToastrService) {
   //used for state management
   this.state$ = this.store.select(state => state.app);
   
   this.stateSubscription = this.state$.subscribe((state:any) => {
     this.albumTitleDisplay = state.albumTitleDisplay;
     this.albumTitleFormatted = state.albumTitleFormatted;
     this.coverImageId = state.coverImageId;
     this.fsId = state.fsId;
     this.categoryId = state.categoryId;
     this.coverChosen = state.coverChosen;
     this.albumStatus = state.status;
   });

  //  this.albumTitleForm = this.fb.group({
  //    albumTitle: ['', Validators.required],
  //    albumCategory: ['', Validators.required],
  //  });

   this.checkAlbumTitleAvailability = debounce(this.checkAlbumTitleAvailability, 400);
 }

 ngOnInit() {
   this.fetchAlbumData();
   this.fetchGalleryItems();
  //  this.fetchCategories();
 }

 onImageUploaded() {
   this.fetchGalleryItems();
 }

 fetchAlbumData() {
   if(this.fsId) {
    this.albumSubscription = this.db.collectionGroup('album', ref => ref.where('id', '==', this.fsId)).valueChanges({idField: 'id'}).pipe(debounceTime(500)).subscribe((data:any) => {
      this.albumData = data;
      if(this.albumData) {
        this.store.dispatch([
          new SetAlbumTitle(this.albumData[0].albumTitleDisplay, this.albumData[0].albumTitleFormatted, this.albumData[0].id, this.albumData[0].albumCategoryId, true),
        ]);
      } else {
        this.location.back();
      }
    });
   }
 }

 fetchGalleryItems() {
   if(this.albumTitleDisplay || this.albumTitleFormatted) {
    this.db.collectionGroup('gallery', ref => ref.where('albumId', '==', this.fsId)).valueChanges({idField: 'id'}).pipe(debounceTime(500)).subscribe((data: any) => {
       this.uploadedFiles = data;
       for(let i = 0; i < this.uploadedFiles.length; i++) {
         if(this.uploadedFiles[i].isCover) {
          this.store.dispatch([
            new SetCoverImageId(this.uploadedFiles[i].id),
          ]);
         } else {
           if(i === this.uploadedFiles.length - 1 && !this.coverImageId) {
            this.store.dispatch([
              new SetCoverImageId(''),
            ])
           }
         }
       }
     })
   }
 }

//  fetchCategories() {
//    this.categorySubscription = this.db.collection('category').valueChanges({idField: 'id'}).subscribe((data: any) => {
//       this.categoryList = data;
//    });
//  }

 toggleEdit() {
   this.albumTitleEditState = !this.albumTitleEditState;
 }

 checkAlbumTitleAvailability(albumTitle: any) {
   const value = albumTitle.target.value;
   const formattedAlbumTitle = urlSlug(value);

   this.loading = true;
   if(formattedAlbumTitle.length > 0) {
    this.gallerySvc.checkAlbumTitleList(formattedAlbumTitle).toPromise().then((data) => {
      if(data.data()) {
        this.titleAvailable = false;
      } else {
        this.titleAvailable = true;
      }
      this.loading = false;
     })
   }
 }

 updateAlbumTitle(albumTitleEdit: string) {
   const formattedAlbumTitle = urlSlug(albumTitleEdit);

   //update state of the app
   if(formattedAlbumTitle !== this.albumTitleFormatted && this.titleAvailable === true && this.loading == false) {
     this.gallerySvc.updateAlbumTitle(this.fsId, albumTitleEdit, this.albumTitleFormatted, this.categoryId).then(() => {
       this.toggleEdit();

       this.toastr.success("Úspešne zmenený názov.");
     
      //  this.store.dispatch([
      //   new SetAlbumTitle(albumTitleEdit, formattedAlbumTitle, this.fsId, this.categoryId, this.coverChosen),
      // ]);
     })
     .catch((e:any) => {
       console.log(e);
     });
   } 
   if(formattedAlbumTitle !== this.albumTitleFormatted && this.titleAvailable === false && this.loading === false) {
     this.toastr.error("Názov albumu už existuje.");
     this.toggleEdit();
   }
   if(formattedAlbumTitle === this.albumTitleFormatted) {
    this.toggleEdit();
   }
 }

 finishAlbum() {
   if(!this.coverImageId) {
    this.toastr.info("Titulná fotka musí byť nastavená.");
   } else {
     this.gallerySvc.publishAlbum(this.fsId, this.categoryId).then(() => {
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
   this.gallerySvc.deleteAlbum(this.fsId, this.categoryId, this.albumTitleFormatted, this.uploadedFiles).then(() => {
     console.log('Successfully deleted album.');
     
     this.toastr.success("Úspešne zrušený album.");
     this.router.navigate(['/dashboard']);
   });

 }

 makeCoverPhoto(albumId: string, downloadUrl: string, imageId: string, isCover: boolean) {
   if(isCover === true) {
     window.alert('Image is already a cover photo')
   } else {
     if(!this.coverImageId) {
       this.gallerySvc.setAlbumCover(albumId, downloadUrl, imageId, this.categoryId).then(() => {
         this.toastr.success("Titulná fotka nastavená.");
         this.store.dispatch([
           new SetCoverImageId(imageId),
         ]);
       });
     }
     if(this.coverImageId !== imageId) {
       this.gallerySvc.updateAlbumCover(albumId, downloadUrl, imageId, this.coverImageId, this.categoryId).then(() => {
        this.toastr.success("Titulná fotka zmenená.");
         this.store.dispatch([
           new SetCoverImageId(imageId)
         ]);
       });
     }
   }
 }

 deleteImage(imageId: string, downloadUrl: string, isCover: boolean) {
   this.gallerySvc.deleteImage(this.fsId, this.categoryId, imageId, downloadUrl).then(() => {
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
      //  this.fileNameErrorList.push(files.item(i)!.name);
      this.toastr.error("Niektoré presiahli veľkosť 3Mb.");
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
   this.albumSubscription? this.albumSubscription.unsubscribe() : null;
   this.gallerySubscription ? this.gallerySubscription.unsubscribe() : null;
   
   this.store.dispatch([
     new AlbumCancelled()
   ]);
 }
}