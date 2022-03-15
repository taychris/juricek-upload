import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from "src/environments/environment";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { ReactiveFormsModule } from '@angular/forms';

//For NGXS
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from "@ngxs/storage-plugin";
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { AppState } from './shared/app.state';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DropzoneDirective } from './dropzone.directive';
import { UploadTaskComponent } from './components/upload-task/upload-task.component';
import { AlbumComponent } from './components/album/album.component';
import { ManageUploaderComponent } from './components/manage-uploader/manage-uploader.component';
import { CreateCategoryUploaderComponent } from './components/create-category-uploader/create-category-uploader.component';
import { ManageCategoryUploaderComponent } from './components/manage-category-uploader/manage-category-uploader.component';
import { PrivateCategoryListComponent } from './components/private-category-list/private-category-list.component';
import { PrivateAlbumListComponent } from './components/private-album-list/private-album-list.component';
import { CreateAlbumComponent } from './components/create-album/create-album.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    DropzoneDirective,
    UploadTaskComponent,
    AlbumComponent,
    ManageUploaderComponent,
    CreateCategoryUploaderComponent,
    ManageCategoryUploaderComponent,
    PrivateCategoryListComponent,
    PrivateAlbumListComponent,
    CreateAlbumComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    NgxsModule.forRoot([
      AppState
    ]), 
    NgxsLoggerPluginModule.forRoot(), 
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
