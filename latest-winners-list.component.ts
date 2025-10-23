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
      this.initializeCarousel();
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
   * Initialize the carousel
   */
  private initializeCarousel() {
    const items = this.winnerItemElements.toArray();
    if (items.length === 0) return;

    this.containerElement = items[0].nativeElement.parentElement;
    if (!this.containerElement) return;

    this.startCarousel();
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
   * Perform the slide animation
   */
  private async performSlideAnimation() {
    if (this.isAnimating || !this.containerElement || this.winnerItemElements.length === 0) return;

    this.isAnimating = true;

    // Calculate first item width + gap
    const slideDistance = this.calcFirstItemWidth();
    if (!slideDistance) {
      this.isAnimating = false;
      return;
    }

    // Slide entire container to the left
    this.containerElement.style.transform = `translateX(-${slideDistance}px)`;
    this.containerElement.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    // Wait for slide animation to complete
    await this.wait(500);

    // Move first item to end and reset position instantly
    this.containerElement.style.transition = 'none';
    this.containerElement.style.transform = 'translateX(0)';
    
    this.moveFirstItemToTheEndOfTheList();
    this.cdr.detectChanges();

    // Wait a frame for DOM to update
    await this.waitFrame();

    // Re-enable transitions
    this.containerElement.style.transition = '';

    // Schedule next animation with random delay
    this.nextAnimationTime = Date.now() + this.random(600, 4000);
    this.isAnimating = false;
  }

  /**
   * Calculate the width of the first item including gap
   */
  private calcFirstItemWidth(): number | null {
    if (!this.winnerItemElements.first) return null;

    const item = this.winnerItemElements.first.nativeElement;
    const parent = item.parentElement;

    if (!parent) return null;

    const styles = this.pageService.windowService.window.getComputedStyle(item);
    const parentStyles = this.pageService.windowService.window.getComputedStyle(parent);

    const itemWidth = parseFloat(styles.width);
    const gap = parseFloat(parentStyles.gap || '0');

    return itemWidth + gap;
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
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  /**
   * Helper to wait for next animation frame
   */
  private waitFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
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
