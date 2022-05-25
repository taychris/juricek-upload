import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) { }

  getAllCategories() {
    return this.db.collection('category');
  }

  getAlbum(category: string) {
    return this.db.collection('album', ref => ref.where('albumCategory', '==', category));
  }
  
  getAllAlbums() {
    return this.db.collection('album');
  }

  getGallery(albumTitle: string) {
    return this.db.collection('gallery', ref => ref.where('albumTitle', '==', albumTitle));
  }

  createAlbumTitle(fsId: string, albumTitleFormat: string, albumTitle: string, albumCategory: string, coverImageURL: string, published: boolean) : Promise<any> {
    const formattedAlbumTitle = albumTitleFormat.replace(/ /g, '-').toLowerCase();

    const batch = this.db.firestore.batch();

    batch.set(this.db.firestore.doc(`album/${fsId}`), { 
      albumTitleDisplay: albumTitle, 
      albumTitleFormatted: formattedAlbumTitle, 
      albumCategory: albumCategory, 
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
    const formattedAlbumTitle = albumTitle.replace(/ /g, '-').toLowerCase();

    return this.db.collection('albumList').doc(formattedAlbumTitle).set({albumId: fsId});
  }

  checkAlbumTitleList(albumTitle: string) {
    console.log(albumTitle);
    return this.db.doc(`albumList/${albumTitle}`).get();
  }

  setAlbumCover(fsId: string, coverImageURL: string, imageId: string) : Promise<any> {
    this.db.collection('gallery').doc(imageId).update({ isCover: true });
    return this.db.collection('album').doc(fsId).update({ coverImageURL: coverImageURL });
  }

  updateAlbumCover(fsId: string, coverImageURL: string, imageId: string, imageIdBefore: string) : Promise<any> {
    this.db.collection('gallery').doc(imageIdBefore).get().toPromise().then((data: any) => {
     if(data.data().downloadURL) {
      this.db.collection('gallery').doc(imageIdBefore).update({ isCover: false });
     }
    });
    this.db.collection('gallery').doc(imageId).update({ isCover: true });
    return this.db.collection('album').doc(fsId).update({ coverImageURL: coverImageURL });
  }

  publishAlbum(fsId: string) : Promise<any> {
    return this.db.collection('album').doc(fsId).update({ published: true });
  }

  updateAlbumTitle(fsId: string, albumTitle: string, albumTitleBefore: string) : Promise<any> {
    const formattedAlbumTitle = albumTitle.replace(/ /g, '-').toLowerCase();
    const formattedAlbumTitleBefore = albumTitleBefore.replace(/ /g, '-').toLowerCase();

    this.db.collection('gallery', ref => ref.where('albumTitle', '==', formattedAlbumTitleBefore)).snapshotChanges().pipe(map(actions => actions.map(a => {
      const data = a.payload.doc.data() as {};
      const id = a.payload.doc.id;
      return { id, ...data };
    }))).subscribe((_doc:any) => {
      for(let i = 0; i < _doc.length; i++) {
        this.db.doc(`gallery/${_doc[i].id}`).update({ albumTitleDisplay: albumTitle, albumTitleFormatted: formattedAlbumTitle });
      }
    });

    const batch = this.db.firestore.batch();

    batch.update(this.db.firestore.doc(`album/${fsId}`), { albumTitleDisplay: albumTitle, albumTitleFormatted: formattedAlbumTitle });
    batch.delete(this.db.firestore.doc(`albumList/${formattedAlbumTitleBefore}`));
    batch.set(this.db.firestore.doc(`albumList/${formattedAlbumTitle}`), { albumId: fsId });

    return batch.commit();
  }

  updateAlbumCategory(fsId: string, albumCategory: string) : Promise<any> {
    return this.db.collection('album').doc(fsId).update({ albumCategory: albumCategory });
  }

  deleteAlbum(albumId: string, fileList?: any, albumTitle?: string) : Promise<any> {
    const formattedAlbumTitle = albumTitle?.replace(/ /g, '-').toLowerCase();

    if(fileList) {
      for(let i = 0; i < fileList.length; i++) {
        this.deleteImage(fileList[i].id, fileList[i].downloadURL);
      }
    }

    const batch = this.db.firestore.batch();

    batch.delete(this.db.firestore.doc(`album/${albumId}`));
    batch.delete(this.db.firestore.doc(`albumList/${formattedAlbumTitle}`))

    return batch.commit();
    // return this.db.collection('album').doc(albumId).delete();
  }

  deleteImage(fileId: string, downloadURL: string) : Promise<any> {
    return this.storage.storage.refFromURL(downloadURL).delete().then(() => {
      this.db.collection('gallery').doc(fileId).delete();
    });
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
