import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { SetAlbumTitle, AlbumCancelled, SetAlbumTitleBefore, SetCoverImageId, SetCoverImageIdBefore } from 'src/app/shared/app.actions';
import { AppState } from 'src/app/shared/app.state';
import { GalleryService } from 'src/app/shared/gallery.service';

@Component({
  selector: 'app-manage-uploader',
  templateUrl: './manage-uploader.component.html',
  styleUrls: ['./manage-uploader.component.scss']
})
export class ManageUploaderComponent implements OnInit, OnDestroy {
  //used for state management
  state$!: Observable<AppState>;
  albumTitle!: string;
  albumTitleBefore!: string;
  coverImageId!: string;
  coverImageIdBefore!: string;
  fsId: string = '';
  coverChosen!: boolean;
  albumos!: any;

  albumTitleEditState: boolean = false;

  isHovering!: boolean;

  files: File[] = [];
  uploadedFiles!: any;

  //used for state management
  private stateSubscription!: Subscription;
  private gallerySubscription!: Subscription;
  fileNameErrorList: string[] = [];

  constructor(private store: Store, private gallerySvc: GalleryService, private db: AngularFirestore, private route: ActivatedRoute, private location: Location) {
    this.state$ = this.store.select(state => state.app);
    
    this.stateSubscription = this.state$.subscribe((state:any) => {
      this.albumTitle = state.albumTitle;
      this.albumTitleBefore = state.albumTitleBefore;
      this.coverImageId = state.coverImageId;
      this.coverImageIdBefore = state.coverImageIdBefore;
      this.fsId = state.fsId;
      this.coverChosen = state.coverChosen;
    });
  }

  ngOnInit(): void {
    const urlParam = this.route.snapshot.paramMap.get('id');
    if(urlParam) {
      this.db.collection('album').doc(urlParam).ref.get().then((doc: any) => {
        if(doc.exists) {
          this.store.dispatch([
            new SetAlbumTitle(doc.data().albumTitle, urlParam, true),
          ]);
          this.setAlbumData(doc.data());
        } else {
          this.location.back();
        }
      })
      .then(() => {
        this.gallerySubscription = this.db.collection('gallery', ref => ref.where('albumTitle', '==', this.albumos.albumTitle)).valueChanges({idField: 'id'}).subscribe((data: any) => {
          this.uploadedFiles = data;

          const coverImageItem = data.find((item: any) => item.isCover === true);
          if(coverImageItem.id) {
            this.store.dispatch([
              new SetCoverImageId(coverImageItem.id)
            ]);
          }
        });
      }).catch((e:any) => {
        console.log(e);
      });
    }
  }

  setAlbumData(data: any) {
    this.albumos = data;
  }

  toggleEdit() {
    this.albumTitleEditState = !this.albumTitleEditState;
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

  deleteAlbum() {
    if(window.confirm('Naozaj chceš vymazať celý album?')){
      this.gallerySvc.deleteAlbum(this.fsId, this.uploadedFiles).then(() => {
        console.log('Successfully deleted album.');
        this.store.dispatch([
          new AlbumCancelled()
        ])
        this.location.back();
      });
    }
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
    if(window.confirm('Naozaj chceš vymazať túto fotku?')){
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

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
    this.gallerySubscription.unsubscribe();
    this.store.dispatch([
      new AlbumCancelled()
    ]);
  }

}
