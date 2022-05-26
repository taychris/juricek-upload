import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable, Subscription } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { GalleryService } from 'src/app/shared/gallery.service';

import { AppState } from 'src/app/shared/state/app.state';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss']
})
export class UploadTaskComponent implements OnInit, OnDestroy {
  state$!: Observable<AppState>;
  @Select(AppState.coverChosen) coverChosen$!: Observable<any>;
  coverChosen!: any;

  @Input() file!: File;
  @Input() documentTitle!: string;
  @Input() fileId!: string;
  @Input() collectionName!: string;
  @Input() oldDownloadURL!: string;
  @Input() albumId!: string;
  @Output() uploaded : EventEmitter<boolean>= new EventEmitter<boolean>();

  percentage!: Observable<number | undefined>;
  task!: AngularFireUploadTask;
  snapshot!: Observable<any>;
  downloadURL!: string;

  coverChosenSubscription: Subscription;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private gallerySvc: GalleryService, private store: Store) {
    this.state$ = this.store.select(state => state.app);
    this.coverChosenSubscription = this.coverChosen$.subscribe((coverChosen: string) => {
      this.coverChosen = coverChosen;
    });
  }


  ngOnInit() {
    this.startUpload();
  }

  startUpload() {
    if(!this.fileId) {
      //the file id
      this.fileId = this.db.createId();
    }
    // The storage path
    // const path = `${this.albumTitle}/${Date.now()}_${this.file.name}`;
    const path = `images/${Date.now()}_${this.file.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    this.task = this.storage.upload(path, this.file);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();

    this.snapshot = this.task.snapshotChanges().pipe(
      // The file's download URL
      finalize( async() =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();

        if(this.collectionName === 'gallery') {
          const formattedAlbumTitle = this.documentTitle.replace(/ /g, '-').toLowerCase();

          this.db.collection('gallery').doc(this.fileId).set({ albumId: this.albumId, albumTitleDisplay: this.documentTitle, albumTitleFormatted: formattedAlbumTitle, isCover: false, downloadURL: this.downloadURL, path }).then(() => {
            this.uploaded.emit(true);
          });
        }
        if(this.collectionName === 'category') {
          if(this.oldDownloadURL) { //if the download urls dont match, update the already created category
            this.storage.storage.refFromURL(this.oldDownloadURL).delete().then(() => {
              this.db.collection('category').doc(this.fileId).update({ downloadURL: this.downloadURL, path }).then(() => {
                //this.uploaded.emit(true);
              });
            });
          } else { //if the category is not already created, create a new one
            this.db.collection('category').doc(this.fileId).set({ categoryTitle: this.documentTitle, downloadURL: this.downloadURL, path, published: false, id: this.fileId }).then(() => {
              this.uploaded.emit(true);
            });
          }
        }
      }),
    );
  }

  cancelUpload() {
    if(window.confirm('Are sure you want to cancel upload?')){
      this.task.cancel();
      this.snapshot = new Observable;
     }
  }

  isActive(snapshot:any) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes:any, decimals?:any) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  ngOnDestroy(): void {
      this.coverChosenSubscription.unsubscribe();
  }

}