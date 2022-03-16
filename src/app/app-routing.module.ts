import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlbumComponent } from './components/album/album.component';
import { ManageUploaderComponent } from './components/manage-uploader/manage-uploader.component';
import { CreateCategoryUploaderComponent } from './components/create-category-uploader/create-category-uploader.component';
import { ManageCategoryUploaderComponent } from './components/manage-category-uploader/manage-category-uploader.component';
import { PrivateCategoryListComponent } from './components/private-category-list/private-category-list.component';
import { PrivateAlbumListComponent } from './components/private-album-list/private-album-list.component';
import { CreateAlbumComponent } from './components/create-album/create-album.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToDashboard } },
  //admin home page
  { path: 'dashboard', component: DashboardComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  //used for creating new album & uploading files
  { path: 'create-album', component: CreateAlbumComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  //used for displaying all albums in category when logged in
  { path: 'admin-albums/:categoryTitle', component: PrivateAlbumListComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  //used for managing album gallery
  { path: 'manage-uploader/:id', component: ManageUploaderComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  //used for displaying album / gallery
  { path: 'album/:albumTitle', component: AlbumComponent },
  //used for displaying all categories when logged in
  { path: 'admin-categories', component: PrivateCategoryListComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'create-category', component: CreateCategoryUploaderComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'manage-category/:categoryTitle', component: ManageCategoryUploaderComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
