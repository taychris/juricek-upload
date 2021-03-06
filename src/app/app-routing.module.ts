import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlbumComponent } from './components/album/album.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { ManageAlbumComponent } from './components/manage-album/manage-album.component';
import { CreateCategoryComponent } from './components/create-category/create-category.component';
// import { CreateCategoryUploaderComponent } from './components/create-category-uploader/create-category-uploader.component';
// import { ManageCategoryUploaderComponent } from './components/manage-category-uploader/manage-category-uploader.component';
import { CreateAlbumComponent } from './components/create-album/create-album.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { HomeComponent } from './components/home/home.component';
import { ManageCategoryComponent } from './components/manage-category/manage-category.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  { path: '', component: HomeComponent, data: { animation: 'isLeft', title: 'Domov - Adrian Juríček Photography' } },
  { path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToDashboard, title: 'Admin Login' } },
  //admin home page
  { path: 'dashboard', component: DashboardComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin, animation: 'isLeft', title: 'Admin Dashboard' }},
  //used for creating new album & uploading files
  { path: 'create-album', component: CreateAlbumComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin, animation: 'isRight', title: 'Nový album - Admin Dashboard' } },
  //used for displaying all albums in category when logged in
  // { path: 'admin-albums/:categoryTitle', component: PrivateAlbumListComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  //used for managing album gallery
  { path: 'manage-album/:id', component: ManageAlbumComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin, animation: 'isRight', title: 'Manažment albumu - Admin Dashboard' } },
  //used for displaying album / gallery
  { path: 'album/:category', component: AlbumComponent, data: { animation: 'isRight', title: 'Albumy - Adrian Juríček Photography' } },
  { path: 'gallery/:albumTitle', component: GalleryComponent, data: { animation: 'isRight', title: 'Galéria - Adrian Juríček Photography' } },
  //used for displaying all categories when logged in
  // { path: 'admin-categories', component: PrivateCategoryListComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'create-category', component: CreateCategoryComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin, animation: 'isRight', title: 'Nová kategória - Admin Dashboard' } },
  { path: 'manage-category/:categoryTitle', component: ManageCategoryComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin, animation: 'isRight', title: 'Manažment kategórie - Admin Dashboard' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', // Add options right here
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
