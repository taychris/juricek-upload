import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { GalleryService } from 'src/app/shared/gallery.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  categorySubscription!: Subscription;
  categoryList!: any;
  isScrolled!: boolean;

  constructor(private gSvc: GalleryService) { }

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
    this.categorySubscription = this.gSvc.getAllCategories().valueChanges({idField: 'id'}).subscribe((data) => {
      data ? this.categoryList = data : console.log('No categories found.');
    })
  }

  ngOnDestroy(): void {
    this.categorySubscription ? this.categorySubscription.unsubscribe() : null;
  }
}
