import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
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
  categoryDownloadURL!: string;
  categoryId!: string;
  categoryTitle!: string;
  categoryResults!: any;
  isPublished!: boolean;

  isHovering!: boolean;

  files: File[] = [];

  categoryForm: FormGroup;
  
  errorMsg!: string;

  categorySubscription!: Subscription;
  stateSubscription!: Subscription;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private fb: FormBuilder, private store: Store, private router: Router, private location: Location) {
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
    if(this.categoryTitle) {
      this.getResults(this.categoryTitle);

      this.categoryForm.patchValue({
        categoryTitle: this.categoryTitle
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
        this.isPublished = data[0].published;
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

  publishCategory() {
    if(!this.categoryResults) {
      window.alert('Please upload an image first.')
    } else {
      this.db.collection('category').doc(this.categoryId).update({ published: true }).then(() => {
        // this.store.dispatch([
        //   new ResetCategoryDetails(),
        // ]);
      });
    }
    
    this.router.navigate(['/manage-category', this.categoryTitle]);
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
      this.location.back();
    }
  }

  onImageUploaded() {
    this.getResults(this.categoryTitle);
  }

  ngOnDestroy(): void {
    if(this.categorySubscription) {
      this.categorySubscription.unsubscribe();

    }
    this.stateSubscription.unsubscribe();
  }

}
