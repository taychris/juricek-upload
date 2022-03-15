import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) { }

  createAlbumTitle(fsId: string, albumTitle: string, albumCategory: string, coverImageURL: string, published: boolean) : Promise<any> {
    return this.db.collection('album').doc(fsId).set({ albumTitle: albumTitle, albumCategory: albumCategory, coverImageURL: coverImageURL, published: published});
  }

  setAlbumCover(fsId: string, coverImageURL: string, imageId: string) : Promise<any> {
    console.log(false);
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
    this.db.collection('gallery', ref => ref.where('albumTitle', '==', albumTitleBefore)).snapshotChanges().pipe(map(actions => actions.map(a => {
      const data = a.payload.doc.data() as {};
      const id = a.payload.doc.id;
      return { id, ...data };
    }))).subscribe((_doc:any) => {
      for(let i = 0; i < _doc.length; i++) {
        this.db.doc(`gallery/${_doc.id}`).update({ albumTitle: albumTitle });
      }
    });
    return this.db.collection('album').doc(fsId).update({ albumTitle: albumTitle });
  }

  updateAlbumCategory(fsId: string, albumCategory: string) : Promise<any> {
    return this.db.collection('album').doc(fsId).update({ albumCategory: albumCategory });
  }

  deleteAlbum(albumId: string, fileList?: any) : Promise<any> {
    if(fileList) {
      for(let i = 0; i < fileList.length; i++) {
        this.deleteImage(fileList[i].id, fileList[i].downloadURL);
      }
    }
    return this.db.collection('album').doc(albumId).delete();
  }

  deleteImage(fileId: string, downloadURL: string) : Promise<any> {
    this.storage.storage.refFromURL(downloadURL).delete();
    return this.db.collection('gallery').doc(fileId).delete();
    
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
