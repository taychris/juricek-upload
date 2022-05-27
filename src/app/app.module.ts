import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from "src/environments/environment";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

//For NGXS
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from "@ngxs/storage-plugin";
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { AppState } from './shared/state/app.state';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DropzoneDirective } from './dropzone.directive';
import { UploadTaskComponent } from './components/upload-task/upload-task.component';
import { AlbumComponent } from './components/album/album.component';
import { CreateAlbumComponent } from './components/create-album/create-album.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { DashboardButtonComponent } from './components/dashboard-button/dashboard-button.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { HomeComponent } from './components/home/home.component';
import { ManageAlbumComponent } from './components/manage-album/manage-album.component';
import { ManageCategoryComponent } from './components/manage-category/manage-category.component';
import { CreateCategoryComponent } from './components/create-category/create-category.component';

@NgModule({
  declarations: [
    AppComponent,
    DropzoneDirective,
    UploadTaskComponent,
    AlbumComponent,
    CreateAlbumComponent,
    CreateCategoryComponent,
    DashboardComponent,
    LoginComponent,
    LogoutComponent,
    DashboardButtonComponent,
    BackButtonComponent,
    HomeComponent,
    ManageAlbumComponent,
    ManageCategoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    ToastrModule.forRoot({
      progressBar: true,
      timeOut: 3000,
      positionClass: 'toast-bottom-center'
    }),
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
