import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { SetAlbumTitle, AlbumCancelled, SetCoverImageId } from 'src/app/shared/app.actions';
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
  albumTitleDisplay!: string;
  albumTitleFormatted!: string;
  coverImageId!: string;
  // coverImageIdBefore!: string;
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
      this.albumTitleDisplay = state.albumTitleDisplay;
      this.albumTitleFormatted = state.albumTitleFormatted;
      this.coverImageId = state.coverImageId;
      // this.coverImageIdBefore = state.coverImageIdBefore;
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
            new SetAlbumTitle(doc.data().albumTitleDisplay, doc.data().albumTitleFormatted, urlParam, true),
          ]);
          // this.setAlbumData(doc.data());
        } else {
          this.location.back();
        }
      })
      .then(() => {
        this.fetchGallery();
        
        if(this.uploadedFiles) {
          const coverImageItem = this.uploadedFiles.find((item: any) => item.isCover === true);
  
          if(coverImageItem.id) {
            this.store.dispatch([
              new SetCoverImageId(coverImageItem.id)
            ]);
          }
        }
      }).catch((e:any) => {
        console.log(e);
      });
    }
  }

  fetchGallery() {
    return this.gallerySubscription = this.db.collection('gallery', ref => ref.where('albumId', '==', this.fsId)).valueChanges({idField: 'id'}).subscribe((data: any) => {

      const coverImageItem = data.find((item: any) => item.isCover === true);

      if(coverImageItem.id) {
        this.store.dispatch([
          new SetCoverImageId(coverImageItem.id)
        ]);
      }

      return this.uploadedFiles = data;
    });
  }

  toggleEdit() {
    this.albumTitleEditState = !this.albumTitleEditState;
  }

  updateAlbumTitle(albumTitleEdit: string) {
    const formattedAlbumTitle = albumTitleEdit.replace(/ /g, '-').toLowerCase();

    //update state of the app
    if(formattedAlbumTitle !== this.albumTitleFormatted) {
      this.gallerySvc.updateAlbumTitle(this.fsId, formattedAlbumTitle, this.albumTitleFormatted).then(() => {
        this.toggleEdit();

        this.store.dispatch([
          new SetAlbumTitle(albumTitleEdit, formattedAlbumTitle, this.fsId, this.coverChosen)
        ]);

        // this.fetchGallery();
      })
      .catch((e:any) => {
        console.log(e.message);
      });
    } else {
      this.toggleEdit();
    }
  }

  deleteAlbum() {
    if(window.confirm('Naozaj chceš vymazať celý album?')){
      this.gallerySvc.deleteAlbum(this.fsId, this.uploadedFiles, this.albumTitleFormatted).then(() => {
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
            // new SetCoverImageIdBefore(imageId)
          ]);
        });
      }
      if(this.coverImageId !== imageId) {
        this.gallerySvc.updateAlbumCover(albumId, downloadUrl, imageId, this.coverImageId).then(() => {
          this.store.dispatch([
            // new SetCoverImageIdBefore(this.coverImageId),
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
            // new SetCoverImageIdBefore(''),
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
