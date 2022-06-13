import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private meta: Meta) { }

  generateTags(tags?: any) {
    tags = {
      description: 'Domov - Adrian Juríček Photography',
      image: 'https://firebasestorage.googleapis.com/v0/b/juricek-upload-dev.appspot.com/o/images%2F1B1CC34Tto0GNXLqildL%2F1654084243749_scott-broome-BcVvVvqiCGA-unsplash.jpg?alt=media&token=c6c2c685-17ba-45db-b5b7-6da59b1c10eb',
      ...tags
    }

    this.meta.updateTag ({ property: 'og:site_name', content: 'Adrian Juríček Photography' });
    this.meta.updateTag ({ property: 'og:title ', content: 'Domov - Adrian Juríček Photography' });
    this.meta.updateTag ({ property: 'og:description', content: tags.description })
    this.meta.updateTag ({ property: 'og:image ', content : tags.image });
    this.meta.updateTag ({ property: 'og:url', content : 'https://juricek-photos.netlify.app/'});
  }
}
