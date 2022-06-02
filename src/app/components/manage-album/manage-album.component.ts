import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { SetAlbumTitle, AlbumCancelled, SetCoverImageId, AlbumCleared } from 'src/app/shared/state/app.actions';
import { AppState } from 'src/app/shared/state/app.state';
import { GalleryService } from 'src/app/shared/gallery.service';
import { debounce } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import urlSlug from 'url-slug';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-manage-album',
  templateUrl: './manage-album.component.html',
  styleUrls: ['./manage-album.component.scss']
})
export class ManageAlbumComponent implements OnInit, OnDestroy {
  //used for state management
  state$!: Observable<AppState>;
  albumTitleDisplay!: string;
  albumTitleFormatted!: string;
  coverImageId!: string;
  // coverImageIdBefore!: string;
  fsId: string = '';
  categoryId: string = '';
  coverChosen!: boolean;
  albumData!: any;
  titleAvailable!: boolean;

  albumTitleEditState: boolean = false;

  isHovering!: boolean;

  files: File[] = [];
  uploadedFiles: any[] = [];

  //used for state management
  private stateSubscription!: Subscription;
  private gallerySubscription!: Subscription;
  private albumSubscription!: Subscription;
  fileNameErrorList: string[] = [];

  constructor(private store: Store, private gallerySvc: GalleryService, private db: AngularFirestore, private route: ActivatedRoute, private location: Location, private toastr: ToastrService, private router: Router) {
    this.state$ = this.store.select(state => state.app);
    
    this.stateSubscription = this.state$.subscribe((state:any) => {
      this.albumTitleDisplay = state.albumTitleDisplay;
      this.albumTitleFormatted = state.albumTitleFormatted;
      this.coverImageId = state.coverImageId;
      // this.coverImageIdBefore = state.coverImageIdBefore;
      this.fsId = state.fsId;
      this.categoryId = state.categoryId;
      this.coverChosen = state.coverChosen;
    });

    this.checkAlbumTitleAvailability = debounce(this.checkAlbumTitleAvailability, 400);
  }

  ngOnInit(): void {
    const urlParam = this.route.snapshot.paramMap.get('id');
    if(urlParam) {
      this.albumSubscription = this.db.collectionGroup('album', ref => ref.where('id', '==', urlParam)).valueChanges({idField: 'id'}).pipe(debounceTime(500)).subscribe((data:any) => {
        this.albumData = data;
        if(this.albumData.length > 0) {
          this.store.dispatch([
            new SetAlbumTitle(this.albumData[0].albumTitleDisplay, this.albumData[0].albumTitleFormatted, this.albumData[0].id, this.albumData[0].albumCategoryId, true),
          ]);
          this.fetchGallery();
        } else {
          this.location.back();
        }
      });
    }
  }

  fetchGallery() {
    this.gallerySubscription = this.db.collectionGroup('gallery', ref => ref.where('albumId', '==', this.fsId)).valueChanges({idField: 'id'}).pipe(debounceTime(500)).subscribe((data: any) => {
      this.uploadedFiles = data;
      
      const coverImageItem = this.uploadedFiles.find((item: any) => item.isCover === true);
  
      if(coverImageItem) {
        this.store.dispatch([
          new SetCoverImageId(coverImageItem.id)
        ]);
      }
    });
  }

  // fetchGallery() {
  //   return this.db.collectionGroup('gallery', ref => ref.where('albumId', '==', this.fsId)).get().toPromise().then((querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //         // console.log(doc.id, ' => ', doc.data());
  //         this.uploadedFiles.push(doc.data());
  //     });
  //   });
  // }

  toggleEdit() {
    this.albumTitleEditState = !this.albumTitleEditState;
  }

  finishAlbum() {
    if(this.coverChosen === false) {
     this.toastr.info("Titulná fotka musí byť nastavená.");
    } else {
      this.gallerySvc.publishAlbum(this.fsId, this.categoryId).then(() => {
        this.toastr.success("Úspešne zverejnený album.");
      });
    }
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

  updateAlbumTitle(albumTitleEdit: string) {
    const albumTitleDisplay = albumTitleEdit;
    const formattedAlbumTitle = urlSlug(albumTitleEdit);

    //update state of the app
    if(formattedAlbumTitle !== this.albumTitleFormatted && this.titleAvailable === true) {

      this.gallerySvc.updateAlbumTitle(this.fsId, albumTitleDisplay, this.albumTitleFormatted, this.categoryId).then(() => {
        this.toggleEdit();

        this.toastr.success("Úspešne zmenený názov.");
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
      this.gallerySvc.deleteAlbum(this.fsId, this.categoryId, this.albumTitleFormatted, this.uploadedFiles).then(() => {
        this.router.navigate(['/dashboard']);
        this.toastr.success("Úspešne vymazaný album.");
      });
    }
  }

  makeCoverPhoto(albumId: string, downloadUrl: string, imageId: string, isCover: boolean) {
    if(isCover === true) {
    this.toastr.info("Fotka je už titulná.");
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
        })
        .catch((e:any) => {
          this.toastr.error("Nepodarilo sa zmeniť titulnú fotku.")
        });
      }
    }
  }

  deleteImage(imageId: string, downloadUrl: string, isCover: boolean) {
    if(window.confirm('Naozaj chceš vymazať túto fotku?')){
      this.gallerySvc.deleteImage(this.categoryId, this.fsId, imageId, downloadUrl).then(() => {
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
  }

  //toggle the hovering effect - find it in scss
  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  //limit file size, upload when dragged
  onDrop(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      if(files.item(i)!.size > 3200000) {
        // this.fileNameErrorList.push(files.item(i)!.name);
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

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
    this.albumSubscription.unsubscribe();
    this.gallerySubscription.unsubscribe();
    this.store.dispatch([
      new AlbumCancelled()
    ]);
  }

}
