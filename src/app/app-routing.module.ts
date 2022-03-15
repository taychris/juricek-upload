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

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  //used for creating new album & uploading files
  { path: 'create-album', component: CreateAlbumComponent },
  //used for displaying all albums in category when logged in
  { path: 'admin-albums/:categoryTitle', component: PrivateAlbumListComponent },
  //used for managing album gallery
  { path: 'manage-uploader/:id', component: ManageUploaderComponent },
  //used for displaying album / gallery
  { path: 'album/:albumTitle', component: AlbumComponent },
  //used for displaying all categories when logged in
  { path: 'admin-categories', component: PrivateCategoryListComponent },
  { path: 'create-category', component: CreateCategoryUploaderComponent },
  { path: 'manage-category/:categoryTitle', component: ManageCategoryUploaderComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
