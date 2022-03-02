import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable, Subscription } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { GalleryService } from 'src/app/shared/gallery.service';

import { UpdateCoverStatus } from 'src/app/shared/app.actions';
import { AppState } from 'src/app/shared/app.state';
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
  @Input() albumTitle!: string;
  @Input() albumId!: string;

  percentage!: Observable<number | undefined>;
  task!: AngularFireUploadTask;
  snapshot!: Observable<any>;
  downloadURL!: string;
  fileId!: string;

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
    //the filename
    this.fileId = this.db.createId();
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

        this.db.collection('gallery').doc(this.fileId).set({ albumTitle: this.albumTitle, isCover: false, downloadURL: this.downloadURL, path });
      }),
    );
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