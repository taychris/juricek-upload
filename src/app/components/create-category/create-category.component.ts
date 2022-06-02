import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Store } from '@ngxs/store';
import { SetCategoryDetails, ResetCategoryDetails } from 'src/app/shared/state/app.actions';
import { AppState } from 'src/app/shared/state/app.state';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit, OnDestroy {
  titleEditState: boolean = false;
  //used for state management
  state$!: Observable<AppState>;
  // titleEditState: boolean = false;
  categoryDownloadURL!: string;
  categoryId!: string;
  categoryTitle$!: string;
  categoryResults!: any;
  isPublished!: boolean;

  isHovering!: boolean;

  files: File[] = [];

  // categoryForm: FormGroup;
  
  errorMsg!: string;

  categorySubscription!: Subscription;
  stateSubscription!: Subscription;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private fb: FormBuilder, private store: Store, private router: Router, private location: Location, private toastr: ToastrService) {
    // this.categoryForm = this.fb.group({
    //   categoryTitle: ['', Validators.required],
    // });

    this.state$ = this.store.select(state => state.app);

    this.stateSubscription = this.state$.subscribe((state:any) => {
      this.categoryTitle$ = state.categoryTitle;
      this.categoryId = state.categoryId;
      this.categoryDownloadURL = state.categoryDownloadURL;

      // if(this.categoryTitle) {
      //   this.categoryForm.patchValue({ categoryTitle: this.categoryTitle});
      // } else {
      //   this.categoryForm.reset();
      // }
    });
   }

  ngOnInit(): void {
    if(this.categoryId) {
      this.getResults(this.categoryId);

      // this.categoryForm.patchValue({
      //   categoryTitle: this.categoryTitle
      // });
    }
  }

  toggleEdit() {
    this.titleEditState = !this.titleEditState;
  }

  getResults(categoryId: string) {
    this.categorySubscription = this.db.doc(`category/${categoryId}`).valueChanges({idField: 'id'}).subscribe((data: any) => {
      console.log(data);
      if(data) {
        this.categoryResults = data;
        this.isPublished = data.published;
        this.store.dispatch([
          new SetCategoryDetails(data.categoryTitle, data.downloadURL, data.downloadURL, data.id)
        ]);
      }
    });
  }

  updateCategoryTitle(categoryTitle: string) {
    if(!this.categoryId) {
      this.toastr.error('Chýba ID kategórie.');
    } else {
      if(categoryTitle !== this.categoryTitle$) {

        var categoryRef = this.db.firestore.doc(`category/${this.categoryId}`);
        categoryRef.update({ categoryTitle: categoryTitle }).then(() => {
          this.toastr.success('Úspešne zmenený názov kategórie.');
          this.toggleEdit();
        })
        .catch((e:any) => {
          console.log(e);
          this.toastr.error('Nepodarilo sa zmeniť názov kategórie.');
        });
      } else {
        this.toggleEdit();
      }
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
    } else {
      if(this.categoryTitle$) {
        this.errorMsg = "";
        this.files[0] = file.item(0) as File;
      } else {
        this.errorMsg = "Set category name first.";
      }
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
        this.store.dispatch([
          new ResetCategoryDetails(),
        ]);
    
        this.router.navigate(['/dashboard']);
      });
    }
  }

  deleteImage(id: string, downloadURL: string) {
    this.storage.storage.refFromURL(downloadURL).delete();
    this.db.collection('category').doc(id).update({ downloadURL: '', path: '' });
  }

  cancelCreation() {
    if(this.categoryId) {
      this.deleteCategoryDocument();
      this.storage.storage.refFromURL(this.categoryResults[0].downloadURL).delete().then(() => {
      }).catch((e:any) => {
        console.log(e);
      });
    } else {
      this.store.dispatch([
        new ResetCategoryDetails()
      ]);
      // this.categoryForm.reset();
      this.location.back();
    }
  }

  deleteCategoryDocument() : Promise<any> {
    return this.db.collection('category').doc(this.categoryId).delete().then(() => {
      this.store.dispatch([
        new ResetCategoryDetails()
      ]);
    })
    .catch((e:any) => {
      console.log(e);
    });
  }

  onImageUploaded() {
    this.getResults(this.categoryId);
  }

  ngOnDestroy(): void {
    if(this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
    this.stateSubscription.unsubscribe();
    
    this.store.dispatch([
      new ResetCategoryDetails()
    ]);
  }

}
