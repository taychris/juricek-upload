import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploaderComponent } from './components/uploader/uploader.component';
import { AlbumComponent } from './components/album/album.component';
import { ManageAlbumComponent } from './components/manage-album/manage-album.component';
import { ManageUploaderComponent } from './components/manage-uploader/manage-uploader.component';
import { CreateCategoryUploaderComponent } from './components/create-category-uploader/create-category-uploader.component';
import { ManageCategoryUploaderComponent } from './components/manage-category-uploader/manage-category-uploader.component';
import { PrivateCategoryListComponent } from './components/private-category-list/private-category-list.component';
import { PrivateAlbumListComponent } from './components/private-album-list/private-album-list.component';

const routes: Routes = [
  { path: 'upload', component: UploaderComponent },
  { path: 'album/:albumTitle', component: AlbumComponent },
  { path: 'admin-albums/:categoryTitle', component: PrivateAlbumListComponent },
  { path: 'manage-album', component: ManageAlbumComponent },
  { path: 'manage-uploader/:id', component: ManageUploaderComponent },
  { path: 'admin-categories', component: PrivateCategoryListComponent },
  { path: 'create-category', component: CreateCategoryUploaderComponent },
  { path: 'manage-category/:categoryTitle', component: ManageCategoryUploaderComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
