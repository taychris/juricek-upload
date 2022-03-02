import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetAlbumTitle, AlbumCancelled, SetAlbumTitleBefore, SetCoverImageId, SetCoverImageIdBefore } from 'src/app/shared/app.actions';
import { AppState } from 'src/app/shared/app.state';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GalleryService } from 'src/app/shared/gallery.service';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent implements OnInit, OnDestroy {
  //used for state management
  state$!: Observable<AppState>;
  albumTitle!: string;
  albumTitleBefore!: string;
  coverImageId!: string;
  coverImageIdBefore!: string;
  fsId: string = '';
  coverChosen!: boolean;
  albumStatus!: string;

  albumTitleForm: FormGroup;
  albumTitleEditState: boolean = false;

  isHovering!: boolean;

  files: File[] = [];
  uploadedFiles!: any;

  //used for state management
  private stateSubscription!: Subscription;
  fileNameErrorList: string[] = [];

  constructor(private store: Store, private fb: FormBuilder, private gallerySvc: GalleryService, private db: AngularFirestore) {
    //used for state management
    this.state$ = this.store.select(state => state.app);
    
    this.stateSubscription = this.state$.subscribe((state:any) => {
      this.albumTitle = state.albumTitle;
      this.albumTitleBefore = state.albumTitleBefore;
      this.coverImageId = state.coverImageId;
      this.coverImageIdBefore = state.coverImageIdBefore;
      this.fsId = state.fsId;
      this.coverChosen = state.coverChosen;
      this.albumStatus = state.status;
    });

    this.albumTitleForm = this.fb.group({
      albumTitle: ['', Validators.required],
      albumCategory: ['', Validators.required],
    });
  }

  ngOnInit() {
    if(this.albumTitle) {
      this.db.collection('gallery', ref => ref.where('albumTitle', '==', this.albumTitle)).valueChanges({idField: 'id'}).subscribe((data:any) => {
        this.uploadedFiles = data;
      });
    }
  }

  toggleEdit() {
    this.albumTitleEditState = !this.albumTitleEditState;
  }

  albumTitleCreate(albumTitle: string, albumCategory: string) {
    this.fsId = this.db.createId();
    //update state of the app
    this.store.dispatch([
      new SetAlbumTitle(albumTitle, this.fsId, false),
    ]);
    
    this.gallerySvc.createAlbumTitle(this.fsId, this.albumTitle, albumCategory, '', false).then(() => {
      this.albumTitleForm.reset();
    });
  }

  updateAlbumTitle(albumTitleEdit: string) {
    //update state of the app
    if(albumTitleEdit !== this.albumTitleBefore) {
      this.store.dispatch([
        new SetAlbumTitleBefore(albumTitleEdit, this.albumTitle),
      ]);
      this.gallerySvc.updateAlbumTitle(this.fsId, albumTitleEdit, this.albumTitleBefore).then(() => {
        this.toggleEdit();
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
      window.alert('Please choose a cover image first.')
    } else {
      this.gallerySvc.publishAlbum(this.fsId).then(() => {
        window.alert('Success.');
        this.store.dispatch([
          new AlbumCancelled()
        ]);
      });
    }
  }

  cancelAlbum() {
    this.gallerySvc.deleteAlbum(this.fsId, this.uploadedFiles).then(() => {
      console.log('Successfully deleted album.');
      this.store.dispatch([
        new AlbumCancelled()
      ])
    });
  }

  makeCoverPhoto(albumId: string, downloadUrl: string, imageId: string, isCover: boolean) {
    if(isCover === true) {
      window.alert('Image is already a cover photo')
    } else {
      if(!this.coverImageId) {
        this.gallerySvc.setAlbumCover(albumId, downloadUrl, imageId).then(() => {
          this.store.dispatch([
            new SetCoverImageId(imageId),
            new SetCoverImageIdBefore(imageId)
          ]);
        });
      }
      if(this.coverImageId !== imageId) {
        this.gallerySvc.updateAlbumCover(albumId, downloadUrl, imageId, this.coverImageId).then(() => {
          this.store.dispatch([
            new SetCoverImageIdBefore(this.coverImageId),
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
        this.store.dispatch([
          new SetCoverImageId(''),
          new SetCoverImageIdBefore(''),
        ]);
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
  }
}