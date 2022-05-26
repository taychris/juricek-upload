import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-category-uploader',
  templateUrl: './manage-category-uploader.component.html',
  styleUrls: ['./manage-category-uploader.component.scss']
})
export class ManageCategoryUploaderComponent implements OnInit, OnDestroy {
  titleEditState: boolean = false;

  percentage!: Observable<number | undefined>;
  task!: AngularFireUploadTask;
  snapshot!: Observable<any>;
  categoryDownloadURL!: string;
  downloadURL!: string;
  categoryId!: string;
  categoryParamId!: any;

  isHovering!: boolean;

  files: File[] = [];

  // categoryForm: FormGroup;
  
  errorMsg!: string;
  categoryTitle!: string;
  categoryResults!: any;

  categorySubscription!: Subscription;
  stateSubscription!: Subscription;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private location: Location) {
    // this.categoryForm = this.fb.group({
    //   categoryTitle: [{value: '', disabled: true}, Validators.required],
    // });

    this.categoryParamId = this.route.snapshot.paramMap.get('categoryTitle');
   }

  ngOnInit(): void {
    if(this.categoryParamId) {
      this.getResults(this.categoryParamId);
    }
  }

  getResults(categoryId: string) {
    this.categorySubscription = this.db.collection('category', ref => ref.where('id', '==', categoryId)).valueChanges({idField: 'id'}).subscribe((data: any) => {
      this.categoryResults = data;
      this.categoryTitle = data[0].categoryTitle;
      this.categoryDownloadURL = data[0].downloadURL;
      this.categoryId = data[0].id;
      
      // this.categoryForm.patchValue({
      //   categoryTitle: data[0].categoryTitle
      // });
    });
  }

  toggleEdit() {
    this.titleEditState = !this.titleEditState;
  }

  updateCategoryTitle(categoryTitle: string) {
    if(!this.categoryId) {
      window.alert('Category id is not set.')
    } else {
      if(categoryTitle !== this.categoryTitle) {
        let categoryTitleBefore = this.categoryTitle;
        this.db.collection('category').doc(this.categoryId).update({ categoryTitle: categoryTitle }).then(() => { //first update category title in the category collection
          this.db.collection('album', ref => ref.where('albumCategory', '==', categoryTitleBefore)).snapshotChanges().pipe(map(actions => actions.map(a => { //when previous action succeeds, update all category of albums
            const data = a.payload.doc.data() as {};
            const id = a.payload.doc.id;
            return { id, ...data };
          }))).subscribe((_doc:any) => {
            for(let i = 0; i < _doc.length; i++) {
              this.db.doc(`album/${_doc[i].id}`).update({ albumCategory: categoryTitle }).then(() => {
                console.log('Successfully changed title.');
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
        this.toggleEdit();
      } else {
        this.toggleEdit();
      }
    }
  }

  deleteImage(id: string, downloadURL: string) {
    if(window.confirm('Naozaj chceš vymazať túto fotku?')){
      this.storage.storage.refFromURL(downloadURL).delete().then(() => {
        this.db.collection('category').doc(id).update({ downloadURL: '', path: '' }).then(() => {
          console.log('Successfully deleted image.');
        })
        .catch((e:any) => {
          console.log(e);
        });
      }).catch((e:any) => {
        console.log(e);
      });
    }
  }

  deleteCategory() {
    if(window.confirm('Naozaj chceš vymazať túto kategóriu?')){
      if(this.categoryResults[0].downloadURL) {
        this.storage.storage.refFromURL(this.categoryResults[0].downloadURL).delete().then(() => {
          console.log('Successfully deleted image from storage.');
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

      this.location.back();
    }
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
      this.files[0] = file.item(0) as File;
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

  ngOnDestroy(): void {
    this.categorySubscription.unsubscribe();
  }

}
