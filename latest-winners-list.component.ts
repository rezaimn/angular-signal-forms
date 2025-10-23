import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChildren, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { PageService } from '@app-core/page/page.service';
import { EnvironmentService } from '@app-core/environment/environment.service';

import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { UserService } from '@app-core/page/user.service';
import { Winner } from '../last-winner.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppDataMxClickDirective } from '@app-shared/directives/appDataMxClick.directive';
import { ImageConverterPipe } from '@app-shared/pipes/image-converter/image-converter.pipe';
import { SiteCurrencyPipe } from '@app-shared/pipes/site-currency/site-currency.pipe';

@Component({
  selector: 'app-latest-winners-list',
  templateUrl: './latest-winners-list.component.html',
  styleUrls: ['./latest-winners-list.component.scss'],
  imports: [CommonModule, TranslateModule, ImageConverterPipe, SiteCurrencyPipe, AppDataMxClickDirective],
})
export class LatestWinnersListComponent implements AfterViewInit, OnDestroy {
  private pageService = inject(PageService);
  private environmentService = inject(EnvironmentService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  public winners$ = new BehaviorSubject<Winner[]>([]);
  public useNickname = this.environmentService.getEnvironment().settings.nicknameInWinnersList;
  public isFirstNameMaskedInLatestWinner = this.environmentService.getEnvironment().settings.isFirstNameMaskedInLatestWinner;
  public isStretching = false;

  @ViewChildren('winnerItem') private winnerItemElements: QueryList<ElementRef>;

  private containerElement: HTMLElement | null = null;
  private carouselInterval: number | null = null;
  private nextAnimationTime = 0;
  private isAnimating = false;

  @Input()
  set winners(winners: Winner[]) {
    this.winners$.next(winners);
  }

  get winners() {
    return this.winners$.getValue();
  }

  @Input() public theme = '';

  ngAfterViewInit() {
    this.winnerItemElements.changes.pipe(first()).subscribe(() => {
      setTimeout(() => {
        this.startInitialAnimation();
      });
    });
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private cleanup() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  /**
   * Start the initial stagger animation for all items
   */
  private startInitialAnimation() {
    const items = this.winnerItemElements.toArray();
    if (items.length === 0) return;

    this.containerElement = items[0].nativeElement.parentElement;
    if (!this.containerElement) return;

    // Stagger animation: animate items appearing one by one
    items.forEach((item, index) => {
      const element = item.nativeElement;
      element.animate(
        [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 400,
          delay: index * 20,
          easing: 'ease-in-out',
          fill: 'forwards',
        },
      );
    });

    // Start the carousel after initial animation
    const totalDelay = items.length * 20 + 400;
    setTimeout(() => {
      this.startCarousel();
    }, totalDelay);
  }

  /**
   * Start the continuous carousel with a single interval
   */
  private startCarousel() {
    // Set initial random delay
    this.nextAnimationTime = Date.now() + this.random(600, 4000);

    // Single interval checking every 50ms
    this.carouselInterval = window.setInterval(() => {
      if (!this.isAnimating && Date.now() >= this.nextAnimationTime) {
        this.performSlideAnimation();
      }
    }, 50);
  }

  /**
   * Perform the slide animation with stretch effect
   */
  private async performSlideAnimation() {
    if (this.isAnimating || !this.containerElement || this.winnerItemElements.length === 0) return;

    this.isAnimating = true;

    // Start stretch animation
    this.isStretching = true;
    this.cdr.detectChanges();

    // Wait for stretch to complete (150ms)
    await this.wait(150);

    // Move first item to end
    this.moveFirstItemToTheEndOfTheList();
    this.cdr.detectChanges();

    // Wait for slide transition (500ms as defined in CSS)
    await this.wait(500);

    // End stretch animation
    this.isStretching = false;
    this.cdr.detectChanges();

    // Wait for stretch return animation (200ms)
    await this.wait(200);

    // Schedule next animation
    this.nextAnimationTime = Date.now() + this.random(600, 4000);
    this.isAnimating = false;
  }

  /**
   * Move first item to the end of the list for infinite carousel effect
   */
  private moveFirstItemToTheEndOfTheList(): void {
    const winnerList = [...this.winners$.getValue()];
    const firstWinner = winnerList.shift();
    if (firstWinner) {
      winnerList.push(firstWinner);
      this.winners$.next(winnerList);
    }
  }

  /**
   * Helper to wait for a duration
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get random number between min and max
   */
  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Track by function for ngFor
   */
  public trackBy(index: number, item: Winner): number {
    return item['uid'];
  }

  /**
   * Get player name based on configuration
   */
  getPlayerName(winner: any): string {
    return this.isFirstNameMaskedInLatestWinner
      ? this.userService.getMaskedPlayerName(winner?.firstName)
      : this.useNickname
        ? this.userService.getMaskedNickName(winner?.nickname)
        : winner?.firstName;
  }

  /**
   * Navigate to game detail page
   */
  public navigateToGameUrl(game: any): void {
    if (game) {
      const gameURL = this.pageService.getGameUrl(game);
      this.pageService.navigateByUrl(gameURL);
    }
  }
}
