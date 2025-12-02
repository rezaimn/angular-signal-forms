import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EnvironmentService, PageService } from '@app-core/index';
import { NewBonusEngineLoadBonuses } from '@app-main/actions/newBonusEngine.actions';
import { selectNewBonusEngineActiveBonus } from '@app-main/reducers/newBonusEngine.reducer';
import { FullScreenService } from '@app-pages/game/partials/game-play/full-screen.service';
import { GamePlayService, SessionMoney } from '@app-pages/game/partials/game-play/game-play.service';
import { GameSearchComponent } from '@app-shared/partials/game-search/game-search.component';
import { RacesNavComponent } from '@app-shared/partials/races/races-nav/races-nav.component';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerActiveBonus } from 'app/api/aggregator/models/backend/player-active-bonus';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GameBonusOverviewComponent } from '../game-bonus-overview/game-bonus-overview.component';
import { FullscreenState, SideNavState } from '../game-overlay/game-overlay.interfaces';
import { GameOverlayService } from '../game-overlay/game-overlay.service';
import { GameSideNavService } from './game-side-nav.service';

@Component({
  selector: 'app-game-side-nav',
  standalone: true,
  templateUrl: './game-side-nav.component.html',
  styleUrls: ['./game-side-nav.component.scss'],
  imports: [
    GameBonusOverviewComponent,
    RacesNavComponent,
    GameSearchComponent,
    CommonModule,
    TranslateModule,
  ],
})
export class GameSideNavComponent implements OnInit, OnDestroy {
  @Input() showRacesSidenav: boolean;

  @Input()
  public isMobileDevice?: boolean = false;

  @Input()
  public gameId: number;

  @Input()
  public userRankPos: number;

  private destroy$ = new Subject<void>();
  public sideNavState$: Observable<SideNavState> = this.gameSidenavService.sideNavState$;
  public currentSideNavState: SideNavState = 'closed';
  public fullscreen = false;
  public fullscreenState: FullscreenState | undefined;
  public bonusInstance: PlayerActiveBonus;
  public isNbeEnabled: boolean;
  public currentSessionMoney$: Observable<SessionMoney | null> = this.gamePlayService.currentSessionMoney$;

  constructor(
    private gameOverlayService: GameOverlayService,
    private gameSidenavService: GameSideNavService,
    private pageService: PageService,
    private environmentService: EnvironmentService,
    private gamePlayService: GamePlayService,
    private fullScreenService: FullScreenService,
  ) {}

  ngOnInit(): void {
    this.fullScreenService.fullscreenState$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fullscreenState) => {
          this.fullscreenState = fullscreenState;
          this.fullscreen = fullscreenState === 'enabled';
        },
        error: (error) => console.log(error),
      });

    this.isNbeEnabled = this.environmentService.getEnvironment().nbe.isEnabled;
    if (this.isNbeEnabled) {
      this.pageService.store.pipe(selectNewBonusEngineActiveBonus, takeUntil(this.destroy$)).subscribe({
        next: (bonus: PlayerActiveBonus) => {
          this.bonusInstance = bonus;
        },
      });
    }

    this.sideNavState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((sidenavState: SideNavState) => {
        this.currentSideNavState = sidenavState;
        if (sidenavState === 'open') {
          this.getBonusInstance();
        }
      });
  }

  private getBonusInstance(): void {
    if (this.isNbeEnabled) {
      this.pageService.store.dispatch(new NewBonusEngineLoadBonuses());
    }
  }

  public closeNavigation(): void {
    this.gameSidenavService.closeSideNav();
    if (this.fullscreenState === 'enabled') {
      this.fullScreenService.disableFullscreen();
    }
    const gameInfoPage = this.pageService.getGameUrl(
      this.gamePlayService.gamePlayStartParameters.game,
      'info',
    );
    this.pageService.navigateByUrl(gameInfoPage);
  }

  ngOnDestroy(): void {
    this.gameSidenavService.closeSideNav();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
