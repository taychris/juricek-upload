import { Component, OnInit, OnDestroy, HostListener, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { GalleryService } from 'src/app/shared/gallery.service';
import { DOCUMENT } from '@angular/common';
import * as AOS from 'aos'; 
import { SeoService } from '../../shared/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  categorySubscription!: Subscription;
  categoryList!: any;
  isScrolled!: boolean;
  showSpinner: boolean = true;

  // @ViewChild('categories', {static: true}) categoryImg!: ElementRef<HTMLDivElement>
  // @ViewChildren('aboutChild', {read: ElementRef}) aboutChildren!: QueryList<ElementRef>
  constructor(private seo: SeoService,private gSvc: GalleryService, @Inject(DOCUMENT) private document: Document) { }

  @HostListener('window:scroll', [])

  onWindowScroll() {
    return this.isScrolled = (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200)
  }

  scrollToElementOffset($element: any) {
    var element = document.getElementById($element);
    var elementPositon = element?.getBoundingClientRect().top;
    var position = elementPositon ? elementPositon + window.pageYOffset - 68 : null;
    position ? window.scrollTo({top: position ,behavior: "smooth"}) : null;
  }

  scrollToElement($element: any): void {
    if($element !== 'categories') {
      const element = document.getElementById($element);
      element ? element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"}) : null;
    } else {
      this.scrollToElementOffset($element);
    }
  }

  ngOnInit(): void {
    AOS.init();
    this.seo.generateTags();
    this.categorySubscription = this.gSvc.getAllCategories().valueChanges({idField: 'id'}).subscribe((data) => {
      data ? this.categoryList = data : console.log('No categories found.');
      this.showSpinner = false;
    })
  }

  ngOnDestroy(): void {
    this.categorySubscription ? this.categorySubscription.unsubscribe() : null;
  }
}
