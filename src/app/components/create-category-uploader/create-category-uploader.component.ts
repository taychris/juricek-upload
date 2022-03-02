import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Store } from '@ngxs/store';
import { SetCategoryDetails, ResetCategoryDetails } from 'src/app/shared/app.actions';
import { AppState } from 'src/app/shared/app.state';

@Component({
  selector: 'app-create-category-uploader',
  templateUrl: './create-category-uploader.component.html',
  styleUrls: ['./create-category-uploader.component.scss']
})
export class CreateCategoryUploaderComponent implements OnInit, OnDestroy {
  //used for state management
  state$!: Observable<AppState>;
  // titleEditState: boolean = false;

  percentage!: Observable<number | undefined>;
  task!: AngularFireUploadTask;
  snapshot!: Observable<any>;
  categoryDownloadURL!: string;
  downloadURL!: string;
  categoryId!: string;
  paramId!: any;

  isHovering!: boolean;

  file!: File;

  categoryForm: FormGroup;
  
  errorMsg!: string;
  categoryTitle!: string;
  categoryResults!: any;

  categorySubscription!: Subscription;
  stateSubscription!: Subscription;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private fb: FormBuilder, private store: Store) {
    this.categoryForm = this.fb.group({
      categoryTitle: ['', Validators.required],
    });

    this.state$ = this.store.select(state => state.app);

    this.stateSubscription = this.state$.subscribe((state:any) => {
      this.categoryTitle = state.categoryTitle;
      this.categoryId = state.categoryId;
      this.categoryDownloadURL = state.categoryDownloadURL;

      if(this.categoryTitle) {
        this.categoryForm.patchValue({ categoryTitle: this.categoryTitle});
      } else {
        this.categoryForm.reset();
      }
    });
   }

  ngOnInit(): void {
    if(this.paramId) {
      this.getResults(this.paramId);

      this.categoryForm.patchValue({
        categoryTitle: this.categoryResults[0].categoryTitle
      });
    }
  }

  // toggleEdit() {
  //   this.titleEditState = !this.titleEditState;
  // }

  getResults(categoryTitle: string) {
    this.categorySubscription = this.db.collection('category',ref => ref.where('categoryTitle', '==', categoryTitle)).valueChanges({idField: 'id'}).subscribe((data: any) => {
      if(data.length > 0) {
        this.categoryResults = data;
        console.log(this.categoryResults);
        this.store.dispatch([
          new SetCategoryDetails(data[0].categoryTitle, data[0].downloadURL, data[0].downloadURL, data[0].id)
        ]);
      }
    });
  }

  setCategoryTitle(categoryTitle: string) {
    this.store.dispatch([
      new SetCategoryDetails(categoryTitle, this.categoryDownloadURL, this.categoryDownloadURL, this.categoryId)
    ]);
  }

  //toggle the hovering effect - find it in scss
  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  //limit file size, upload when dragged
  onDrop(file: FileList) {
    if(file.item(0)!.size > 3200000) {
      this.errorMsg = "File size exceeds 3Mb.";
    } 
    if(this.categoryTitle) {
      this.startUpload(this.categoryTitle, file.item(0)!);
    } else {
      this.errorMsg = "Set category name first.";
    }
  }

  //used for button click upload
  fileBrowseHandler(file: any) {
    if(file.target.files) {
      this.onDrop(file.target.files);
    }
  }

  
  startUpload(categoryTitle: string, coverImage: any) {
    //check for categoryId => indentify if the category isn't already created
    if(!this.categoryId) {
      this.categoryId = this.db.createId();
    }
    // The storage path
    const path = `images/${Date.now()}_${coverImage.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    this.task = this.storage.upload(path, coverImage);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();

    this.snapshot = this.task.snapshotChanges().pipe(
      // The file's download URL
      finalize( async() =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();

        
        if(this.categoryDownloadURL) { //if the download urls dont match, update the already created category
          this.db.collection('category').doc(this.categoryId).update({ downloadURL: this.downloadURL, path }).then(() => {
            this.storage.storage.refFromURL(this.categoryDownloadURL).delete().then(() => {
              // this.store.dispatch([
              //   new SetCategoryDetails(categoryTitle, this.downloadURL, this.downloadURL, this.categoryId) 
              // ]);
            });
          });
        } else { //if the category is not already created, create a new one
          this.db.collection('category').doc(this.categoryId).set({ categoryTitle: categoryTitle, downloadURL: this.downloadURL, path, published: false, id: this.categoryId }).then(() => {
            this.getResults(categoryTitle);
          });
        }
      }),
    );
  }

  publishCategory() {
    if(!this.categoryResults) {
      window.alert('Please upload an image first.')
    } else {
      this.db.collection('category').doc(this.categoryId).update({ published: true });
    }
  }

  deleteImage(id: string, downloadURL: string) {
    this.storage.storage.refFromURL(downloadURL).delete();
    this.db.collection('category').doc(id).update({ downloadURL: '', path: '' });
  }

  cancelCreation() {
    if(this.categoryResults) {
      this.storage.storage.refFromURL(this.categoryResults[0].downloadURL).delete().then(() => {
        this.db.collection('category').doc(this.categoryResults[0].id).delete().then(() => {
          this.store.dispatch([
            new ResetCategoryDetails()
          ]);
        })
        .catch((e:any) => {
          console.log(e);
        });
      }).catch((e:any) => {
        console.log(e);
      });
    } else {
      this.store.dispatch([
        new ResetCategoryDetails()
      ]);
      this.categoryForm.reset();
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
      this.categorySubscription.unsubscribe();
      this.stateSubscription.unsubscribe();
  }

}
