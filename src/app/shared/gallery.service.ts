import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { map, catchError } from 'rxjs/operators';
import urlSlug from 'url-slug';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) { }

  getAllCategories() {
    return this.db.collection('category');
  }

  getAlbum(category: string) {
    return this.db.collectionGroup('album', ref => ref.where('albumCategory', '==', category))
    // return this.db.collection('album', ref => ref.where('albumCategory', '==', category));
  }
  
  getAllAlbums() {
    return this.db.collectionGroup('album')
    // return this.db.collection('album');
  }

  getGallery(albumTitle: string) {
    return this.db.collection('gallery', ref => ref.where('albumTitle', '==', albumTitle));
  }

  createAlbumTitle(fsId: string, albumTitle: string, albumTitleFormat: string, albumCategory: string, coverImageURL: string, published: boolean, categoryId: string) : Promise<any> {
    const formattedAlbumTitle = urlSlug(albumTitleFormat);

    const batch = this.db.firestore.batch();

    batch.set(this.db.firestore.collection('category').doc(categoryId).collection('album').doc(fsId), { 
      albumTitleDisplay: albumTitle,
      albumTitleFormatted: formattedAlbumTitle,
      albumCategory: albumCategory,
      albumCategoryId: categoryId,
      coverImageURL: coverImageURL,
      published: published
    });
    batch.set(this.db.firestore.doc(`albumList/${formattedAlbumTitle}`), {
      albumId: fsId
    });

    return batch.commit();

    // return this.db.collection('album').doc(fsId).set({ albumTitle: formattedAlbumTitle, albumCategory: albumCategory, coverImageURL: coverImageURL, published: published});
  }

  createAlbumTitleList(fsId: string, albumTitle: string) {
    const formattedAlbumTitle = urlSlug(albumTitle);

    return this.db.collection('albumList').doc(formattedAlbumTitle).set({albumId: fsId});
  }

  checkAlbumTitleList(albumTitle: string) {
    return this.db.doc(`albumList/${albumTitle}`).get();
  }

  setAlbumCover(fsId: string, coverImageURL: string, imageId: string, categoryId: string) : Promise<any> {
    const batch = this.db.firestore.batch();

    batch.update(this.db.firestore.collection('category').doc(categoryId).collection('album').doc(fsId).collection('gallery').doc(imageId), { isCover: true });
    batch.update(this.db.firestore.collection('category').doc(categoryId).collection('album').doc(fsId), { coverImageURL: coverImageURL })
    // this.db.collection('gallery').doc(imageId).update({ isCover: true });
    // return this.db.collection('album').doc(fsId).update({ coverImageURL: coverImageURL });
    return batch.commit();
  }

  updateAlbumCover(fsId: string, coverImageURL: string, imageId: string, imageIdBefore: string, categoryId: string) : Promise<any> {
    const batch = this.db.firestore.batch();
    const galleryRef = this.db.firestore.collection('category').doc(categoryId).collection('album').doc(fsId).collection('gallery');
    const albumRef = this.db.firestore.collection('category').doc(categoryId).collection('album').doc(fsId);
    return galleryRef.doc(imageIdBefore).get().then((data: any) => {
      if(data.data().downloadURL) {
        batch.update(galleryRef.doc(imageIdBefore), { isCover: false })
        // this.db.collection('gallery').doc(imageIdBefore).update({ isCover: false });
      }
      batch.update(galleryRef.doc(imageId), { isCover: true });
      batch.update(albumRef, { coverImageURL: coverImageURL });
    })
    .finally(() => {
      batch.commit();
    });
    // this.db.collection('gallery').doc(imageId).update({ isCover: true });
    // return this.db.collection('album').doc(fsId).update({ coverImageURL: coverImageURL });
  }

  publishAlbum(fsId: string, categoryId: string) : Promise<any> {
    return this.db.collection('category').doc(categoryId).collection('album').doc(fsId).update({ published: true });
  }

  updateAlbumTitle(fsId: string, albumTitle: string, albumTitleBefore: string, categoryId: string) : Promise<any> {
    const albumTitleDisplay = albumTitle;
    const formattedAlbumTitle = urlSlug(albumTitle);
    const formattedAlbumTitleBefore = urlSlug(albumTitleBefore);

    this.db.collection('category').doc(categoryId).collection('album').doc(fsId).collection('gallery').snapshotChanges().pipe(map(actions => actions.map(a => {
      const data = a.payload.doc.data() as {};
      const id = a.payload.doc.id;
      return { id, ...data };
    }))).subscribe((_doc:any) => {
      for(let i = 0; i < _doc.length; i++) {
        this.db.collection('category').doc(categoryId).collection('album').doc(fsId).collection('gallery').doc(_doc[i].id).update({ albumTitleDisplay: albumTitleDisplay, albumTitleFormatted: formattedAlbumTitle });
      }
    });

    const batch = this.db.firestore.batch();

    batch.update(this.db.firestore.collection('category').doc(categoryId).collection('album').doc(fsId), { albumTitleDisplay: albumTitleDisplay, albumTitleFormatted: formattedAlbumTitle });
    batch.delete(this.db.firestore.doc(`albumList/${formattedAlbumTitleBefore}`));
    batch.set(this.db.firestore.doc(`albumList/${formattedAlbumTitle}`), { albumId: fsId });

    return batch.commit();
  }

  updateAlbumCategory(fsId: string, albumCategory: string) : Promise<any> {
    return this.db.collection('album').doc(fsId).update({ albumCategory: albumCategory });
  }

  deleteAlbum(albumId: string, categoryId: string, fileList?: any, albumTitle?: string) : Promise<any> {
    const formattedAlbumTitle = albumTitle?.replace(/ /g, '-').toLowerCase();

    if(fileList) {
      for(let i = 0; i < fileList.length; i++) {
        this.deleteImageFromStorage(fileList[i].downloadURL);
      }
    }

    const batch = this.db.firestore.batch();

    batch.delete(this.db.firestore.collection('category').doc(categoryId).collection('album').doc(albumId));
    batch.delete(this.db.firestore.doc(`albumList/${formattedAlbumTitle}`))

    return batch.commit();
    // return this.db.collection('album').doc(albumId).delete();
  }

  deleteImage(categoryId: string, albumId: string, fileId: string, downloadURL: string) : Promise<any> {
    return this.storage.storage.refFromURL(downloadURL).delete().then(() => {
      this.db.collection('category').doc(categoryId).collection('album').doc(albumId).collection('gallery').doc(fileId).delete();
    });
  }

  deleteImageFromStorage(downloadURL: string) {
    return this.storage.storage.refFromURL(downloadURL).delete()
  }

  removeSpaceAlbumTitle(albumTitle: string) {
    var str = albumTitle;
    str = str.replace(/\s+/g, '-').toLowerCase();
    return str;
  }

  removeDashAlbumTitle(albumTitle: string) {
    var str = albumTitle;
    str = str.replace(/-/g, ' ').toLowerCase();
    return str;
  }

  // makeCoverPhoto(albumId:string, downloadURL: string, imageId: string) : Promise<any> {
  //   return this.updateAlbumCover(albumId, downloadURL, imageId).then(() => {
  //     console.log('Success.');
  //   })
  //   .catch((e:any) => {
  //     console.log(e);
  //   });
  // }
}
