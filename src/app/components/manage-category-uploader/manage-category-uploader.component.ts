import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
// import { Store } from '@ngxs/store';
// import { SetCategoryDetails, ResetCategoryDetails } from 'src/app/shared/app.actions';
// import { AppState } from 'src/app/shared/app.state';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manage-category-uploader',
  templateUrl: './manage-category-uploader.component.html',
  styleUrls: ['./manage-category-uploader.component.scss']
})
export class ManageCategoryUploaderComponent implements OnInit, OnDestroy {
  //used for state management
  // state$!: Observable<AppState>;
  titleEditState: boolean = false;

  percentage!: Observable<number | undefined>;
  task!: AngularFireUploadTask;
  snapshot!: Observable<any>;
  categoryDownloadURL!: string;
  downloadURL!: string;
  categoryId!: string;
  categoryParamId!: any;

  isHovering!: boolean;

  file!: File;

  categoryForm: FormGroup;
  
  errorMsg!: string;
  categoryTitle!: string;
  categoryResults!: any;

  categorySubscription!: Subscription;
  stateSubscription!: Subscription;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {
    this.categoryForm = this.fb.group({
      categoryTitle: [{value: '', disabled: true}, Validators.required],
    });

    this.categoryParamId = this.route.snapshot.paramMap.get('categoryTitle');
   }

  ngOnInit(): void {
    if(this.categoryParamId) {
      this.getResults(this.categoryParamId);
    }
  }

  getResults(categoryId: string) {
    this.categorySubscription = this.db.collection('category', ref => ref.where('id', '==', categoryId)).valueChanges({idField: 'id'}).subscribe((data: any) => {
      if(data.length > 0) {
        this.categoryResults = data;
        
        this.categoryForm.patchValue({
          categoryTitle: data[0].categoryTitle
        });
      } else {
        this.errorMsg = 'No category title';
      }

    });
  }

  toggleEdit() {
    this.titleEditState = !this.titleEditState;
    if(this.titleEditState === false) {
      this.categoryForm.controls.categoryTitle.disable();
    } else {
      this.categoryForm.controls.categoryTitle.enable();
    }
  }

  setCategoryTitle(categoryTitle: string) {
    if(!this.categoryResults[0].id) {
      window.alert('Category id is not set.')
    } else {
      if(categoryTitle !== this.categoryResults[0].categoryTitle) {
        let categoryTitleBefore = this.categoryResults[0].categoryTitle;
        this.db.collection('category').doc(this.categoryResults[0].id).update({ categoryTitle: categoryTitle }).then(() => { //first update category title in the category collection
          this.db.collection('album', ref => ref.where('albumCategory', '==', categoryTitleBefore)).snapshotChanges().pipe(map(actions => actions.map(a => { //when previous action succeeds, update all category of albums
            const data = a.payload.doc.data() as {};
            const id = a.payload.doc.id;
            return { id, ...data };
          }))).subscribe((_doc:any) => {
            for(let i = 0; i < _doc.length; i++) {
              this.db.doc(`album/${_doc.id}`).update({ albumCategory: categoryTitle }).then(() => {
                console.log('Successfully changed title.');
                this.toggleEdit();
              })
              .catch((e:any) => {
                console.log(e);
              });
            }
          });
        })
        .catch((e:any) => {
          console.log(e);
        });
      } else {
        this.toggleEdit();
      }
    }
  }

  deleteImage(id: string, downloadURL: string) {
    this.storage.storage.refFromURL(downloadURL).delete();
    this.db.collection('category').doc(id).update({ downloadURL: '', path: '' });
  }

  deleteCategory() {
    if(this.categoryResults[0].downloadURL) {
      this.storage.storage.refFromURL(this.categoryResults[0].downloadURL).delete().then(() => {
        console.log('Successfully deleted cover image from storage.');
      }).catch((e:any) => {
        console.log(e);
      });
    }
    this.db.collection('category').doc(this.categoryResults[0].id).delete().then(() => {
      console.log('Successfully deleted category from database.');
    })
    .catch((e:any) => {
      console.log(e);
    });
  }

  startUpload(coverImage: any) {
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

        
        if(this.categoryResults[0].downloadURL) { //if image is already uploaded update it
          this.storage.storage.refFromURL(this.categoryResults[0].downloadURL).delete().then(() => {
            this.db.collection('category').doc(this.categoryResults[0].id).update({ downloadURL: this.downloadURL, path }).then(() => {
              console.log('Successfully updated cover image.')
            })
            .catch((e:any) => {
              console.log(e);
            });
          })
          .catch((e:any) => {
            console.log(e);
          });
        } else { //if image is missing, upload new one
          this.db.collection('category').doc(this.categoryResults[0].id).update({ downloadURL: this.downloadURL, path }).then(() => {
            console.log('Successfully uploaded image.')
          })
          .catch((e:any) => {
            console.log(e);
          });
        }
      }),
    );
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
    if(this.categoryResults[0].categoryTitle) {
      this.startUpload(file.item(0)!);
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
  }

}
