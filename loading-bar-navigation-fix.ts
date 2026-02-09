import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationExtras,
  Router,
  RouterLink,
  Scroll,
} from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter, take, takeUntil, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingBarService {
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading: Observable<boolean> = this.loadingSubject$.asObservable();

  showLoadingBar() {
    this.loadingSubject$.next(true);
  }

  hideLoadingBar() {
    timer(400).subscribe(() => {
      this.loadingSubject$.next(false);
    });
  }

  showForNavigation(router: Router) {
    this.showLoadingBar();
    router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
        take(1),
      )
      .subscribe(() => this.hideLoadingBar());
  }
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[loadingRouterLink]',
})
export class LoadingRouterLinkDirective extends RouterLink implements OnDestroy {
  @Input() exact = false;
  @Input() activeClass = 'is-active';

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('loadingRouterLink')
  set loadingRouterLink(value: any) {
    super.routerLink = value;
    this.url = value;
  }
  private url: string;
  private destroy$ = new Subject<void>();
  private routerInstance: Router;
  private renderer2Instance: Renderer2;
  private elInstance: ElementRef;
  private isNavigating = false;

  constructor(
    private loadingBarService: LoadingBarService,
    router: Router,
    route: ActivatedRoute,
    renderer: Renderer2,
    el: ElementRef,
    locationStrategy: LocationStrategy,
  ) {
    super(router, route, undefined, renderer, el, locationStrategy);
    this.routerInstance = router;
    this.renderer2Instance = renderer;
    this.elInstance = el;

    this.routerInstance.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        (event instanceof Scroll && event?.routerEvent instanceof NavigationEnd)
      ) {
        this.loadingBarService.hideLoadingBar();
        this.isNavigating = false;
        this.updateActiveClass();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy?.();
  }

  @HostListener('click', ['$event'])
  override onClick(button = 0, ctrlKey = false, shiftKey = false, altKey = false, metaKey = false): boolean {
    if (!this.isNavigating) {
      this.isNavigating = true;
      this.loadingBarService.showLoadingBar();

      setTimeout(() => {
        super.onClick(button, ctrlKey, shiftKey, altKey, metaKey);
      });
      return false;
    }

    return super.onClick(button, ctrlKey, shiftKey, altKey, metaKey);
  }

  private updateActiveClass() {
    const isActive = this.exact ? this.routerInstance.url === this.url : this.routerInstance.url.startsWith(this.url);

    if (isActive) {
      this.renderer2Instance.addClass(this.elInstance.nativeElement, this.activeClass);
    } else {
      this.renderer2Instance.removeClass(this.elInstance.nativeElement, this.activeClass);
    }
  }
}

export class GameThumbnailComponent {
  constructor(private router: Router, private loadingBarService: LoadingBarService) {}

  navigateToGameUrl(gameUrl: string, navigationExtras: NavigationExtras, event: Event) {
    if (event.defaultPrevented) {
      return;
    }

    this.loadingBarService.showForNavigation(this.router);
    void this.router.navigateByUrl(gameUrl, navigationExtras);
  }
}
