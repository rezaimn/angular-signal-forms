import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PageService } from '@app-core/index';
import { NavigationBarService } from '@app-core/mobile/navigationbar.service';
import { environment as appenv } from '@app-environments/environment';
import { GameActionTypes } from '@app-main/actions/game.actions';
import { selectGame } from '@app-main/reducers/game.reducer';
import { FullScreenService } from '@app-pages/game/partials/game-play/full-screen.service';
import { FocusPageScrollOnHoverDirective } from '@app-shared/directives/appFocusPageScrollOnHoverElement.directive';
import { CdnPipe } from '@app-shared/pipes/cdn/cdn.pipe';
import { clearIntegrationMode, loadTemplateConnectionLostModal } from '@matrix-game-widget/actions/integration-mode.actions';
import { loadTemplateClosed } from '@matrix-game-widget/actions/template.actions';
import { HelpersService } from '@matrix-game-widget/core/services/helpers.service';
import { environment } from '@matrix-game-widget/environments/environment';
import { AppViewContainerRefDirective } from '@matrix-game-widget/lib/directives/appViewContainerRef.directive';
import { IGameWidgetParameters } from '@matrix-game-widget/lib/game-widget-parameters';
import { StartGameService } from '@matrix-game-widget/lib/services/startGame/start-game.service';
import { ConnectionHandlerService } from '@matrix-game-widget/lib/services/utilities/connection-handler.service';
import { BonusMoneyConvertedResultModalComponent } from '@matrix-game-widget/modals/shared/bonus-money-converted-result-modal/bonus-money-converted-result-modal.component';
import { MessageModalComponent } from '@matrix-game-widget/modals/shared/message-modal/message-modal.component';
import { MoneyTypeDisplayModal } from '@matrix-game-widget/modals/shared/money-type-display-modal/money-type-display-modal.component';
import { NbeGenericModalComponent } from '@matrix-game-widget/modals/shared/nbe-generic-modal/nbe-generic-modal.component';
import { NoRealMoneyLeftModalComponent } from '@matrix-game-widget/modals/shared/no-real-money-left-modal/no-real-money-left-modal.component';
import { RealityCheckModalComponent } from '@matrix-game-widget/modals/shared/reality-check-modal/reality-check-modal.component';
import { State } from '@matrix-game-widget/reducers/index';
import { selectTemplate as selectIntegrationMode } from '@matrix-game-widget/selectors/integration-modes.selectors';
import { selectTemplate } from '@matrix-game-widget/selectors/template.selectors';
import { Store, select } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { delay, distinctUntilChanged, distinctUntilKeyChanged, filter, takeUntil } from 'rxjs/operators';
import { SanitizePipe } from './core/pipes/sanitize.pipe';
import { NotificationsViewContainerRefDirective } from './directives/notificationsViewContainerRef.directive';
import { GameIframeMobileComponent } from './main/game-iframe-mobile/game-iframe-mobile.component';
import { GameIFrameMyntComponent } from './main/game-iframe-mynt/game-iframe-mynt.component';
import { GameIframeNoSandboxComponent } from './main/game-iframe-no-sandbox/game-iframe-no-sandbox.component';
import { GameIframeComponent } from './main/game-iframe/game-iframe.component';
import { GameNetentComponent } from './main/game-netent/game-netent.component';
import { GameSGComponent } from './main/game-sg/game-sg.component';
import { QuestionaryModalABESComponent } from './modals/abes/questionary-abes-modal/questionary-abes-modal.component';
import { ReminderABESModalComponent } from './modals/abes/reminder-abes-modal/reminder-abes-modal.component';
import { ConnectionLostModalComponent } from './modals/shared/connection-lost-modal/connection-lost-modal.component';
import { FreeSpinsModalComponent } from './modals/shared/free-spins-modal/free-spins-modal.component';
import { FreeSpinsResultModalComponent } from './modals/shared/free-spins-result-modal/free-spins-result-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'matrix-game-widget',
  templateUrl: './matrix-game-widget.component.html',
  styleUrls: ['./matrix-game-widget.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SanitizePipe,
    CdnPipe,
    TranslateModule,
    GameIframeComponent,
    GameIframeMobileComponent,
    GameIFrameMyntComponent,
    GameNetentComponent,
    GameSGComponent,
    GameIframeNoSandboxComponent,
    FreeSpinsModalComponent,
    FreeSpinsResultModalComponent,
    ReminderABESModalComponent,
    QuestionaryModalABESComponent,
    ConnectionLostModalComponent,
    AppViewContainerRefDirective,
    NotificationsViewContainerRefDirective,
    FocusPageScrollOnHoverDirective,
  ],
})
export class MatrixGameWidgetComponent implements AfterViewInit, OnDestroy {
  @HostListener('window:keydown', ['$event'])
  onkeydown(event) {
    event = event || window.event;
    if (event.stopPropagation !== undefined && this.template.type && this.template.type !== 'Loading') {
      event.stopPropagation();
      event.cancelBubble = true;
      window.event.cancelBubble = true;
      window.event.stopImmediatePropagation();
    }
  }

  private destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('nrgsStartGame') gameWidgetEL: ElementRef;
  @Input() translations: { [key: string]: string };
  @Output() onSuccessEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onFailureEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onGameEnd: EventEmitter<any> = new EventEmitter<any>();
  @Output() onGameEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDestroyEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRealityCheckRedirect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAamsIdsLoaded: EventEmitter<any> = new EventEmitter<any>();
  @Output() onMatrixGameEvent: EventEmitter<any> = new EventEmitter<any>();

  public integrationModeTemplate: { type: string; payload?: any } = { type: '' };
  public template: { type: string; payload?: any } = { type: '' };
  public gameWidgetParameters: IGameWidgetParameters;

  public showLoadingOverlay = false;
  public isLoadingOverlayFadingOut = false;

  private currentShownComponent;
  private onGameWidgetELLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private onGameWidgetParametersLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private loadingOverlayFadeTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly loadingOverlayFadeDurationMs = 2000;

  // lazy loading of modals
  @ViewChild(AppViewContainerRefDirective, { static: false }) appViewContainerRef: AppViewContainerRefDirective;
  @ViewChild(NotificationsViewContainerRefDirective, { static: false }) notificationsViewContainerRef: NotificationsViewContainerRefDirective;

  constructor(
    private translate: TranslateService,
    private store: Store<State>,
    private ngZone: NgZone,
    private startGameService: StartGameService,
    private helpersService: HelpersService,
    private connectionHandlerService: ConnectionHandlerService,
    private fullscreenService: FullScreenService,
    private pageService: PageService,
    private navigationBarService: NavigationBarService,
  ) {
    this.store.dispatch(clearIntegrationMode());

    // listen to integrationMode
    this.store
      .pipe(select(selectIntegrationMode), distinctUntilKeyChanged('type'), delay(5), takeUntil(this.destroy$))
      .subscribe((data: { type: string; payload?: any }) => {
        this.ngZone.run(() => {
          this.integrationModeTemplate = Object.assign({}, data);
          this.helpersService.sendMessageToApp('GAME_INTEGRATOR_MODE', this.integrationModeTemplate.payload?.isResponsibleGamingEnabled);
          this.updateLoadingOverlayVisibility();
        });
      });

    // listen to templates
    this.store
      .pipe(
        select(selectTemplate),
        delay(50),
        distinctUntilChanged((old, current) => old?.['type'] === current?.['type'] && current?.['type'] !== 'MessageModal'),
        takeUntil(this.destroy$),
      )
      .subscribe((data: { type: string; payload?: any }) => {
        this.ngZone.run(() => {
          this.selectComponentToLoad(data);
          this.template = Object.assign({}, data);
          this.updateLoadingOverlayVisibility();
        });
      });

    // listen to connection lost event
    this.connectionHandlerService
      .getConnectionLostEventEmitter()
      .pipe(
        filter((connectionLost) => connectionLost),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.store.dispatch(loadTemplateConnectionLostModal()));

    // matrix game event
    startGameService.matrixGameEventFns$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.ngZone.run(() => {
        this.onMatrixGameEvent.emit(data);
      });
    });

    this.onGameWidgetELLoaded$.pipe(takeUntil(this.destroy$));
    this.onGameWidgetParametersLoaded$.pipe(takeUntil(this.destroy$));

    combineLatest([this.onGameWidgetELLoaded$, this.onGameWidgetParametersLoaded$])
      .pipe(
        takeUntil(this.destroy$),
        filter((loaders: Array<boolean>) => {
          return loaders[0] === true && loaders[1] === true;
        }),
      )
      .subscribe(() => {
        // start the inner game service. This is the entry point to start loading data, etc
        this.startGameService.startGameWidget(this.gameWidgetEL.nativeElement, 'nrgs-startGame', this.gameWidgetParameters);
      });
  }

  public get platform() {
    return environment.selectedPlatform;
  }

  public get isProviderLicensed() {
    const commision = appenv?.gamblingCommision;

    return commision?.enabled && commision?.providers?.includes?.(this.gameWidgetParameters?.gameProvider);
  }

  /**
   * After view init, we can guarantee tht the widget element is in the dom.
   * Then, we would just need the game paramters and we can start the widget.
   */
  ngAfterViewInit() {
    if (this.gameWidgetEL && this.gameWidgetEL.nativeElement) {
      this.onGameWidgetELLoaded$.next(true);
    }
  }

  /**
   * Public outside game widget library endpoint to start the game widget
   */
  public startGame(gameWidgetParameters: IGameWidgetParameters) {
    this.hideNavigationBarAndroid(gameWidgetParameters);
    this.ngZone.run(() => {
      this.gameWidgetParameters = gameWidgetParameters;
      const isJwtTokenValid = !!((this.gameWidgetParameters.gameNrgsMode === 'cash' && this.gameWidgetParameters.jwt) || this.gameWidgetParameters.gameNrgsMode !== 'cash');
      if (
        isJwtTokenValid &&
        this.gameWidgetParameters.gameId &&
        this.gameWidgetParameters.gameNrgsMode &&
        this.gameWidgetParameters.platformId &&
        (this.gameWidgetParameters.withCredentials === true || this.gameWidgetParameters.withCredentials === false)
      ) {
        environment.apiRootUrl = this.gameWidgetParameters.apiRootUrl;
        const selectedPlatform = environment.platforms.find((platform) => {
          return !!(platform.id === this.gameWidgetParameters.platformId);
        });
        this.setTranslationLanguage(this.gameWidgetParameters.translations);
        environment.selectedPlatform = environment.platforms.find((platform) => {
          return !!(platform.id === this.gameWidgetParameters.platformId);
        });
        this.onGameWidgetParametersLoaded$.next(true);
        this.updateLoadingOverlayVisibility();
      }
    });
  }

  /**
   * Set translations from outside
   * @param translations: { 'en': { [key: string]: string }}
   */
  private setTranslationLanguage(translations: { string: { [key: string]: string } }) {
    let lng = 'en';
    let values = {};
    if (translations) {
      lng = Object.keys(translations)[0];
      values = translations[lng];
    }

    this.translate.setTranslation(lng, values);

    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang(lng);

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(lng);
  }

  async selectComponentToLoad(data: { type: string; payload?: any } = { type: '' }) {
    if (data.type && data.payload) {
      data.payload.platformId = this.gameWidgetParameters?.platformId;
    }

    if (!this.gameWidgetParameters?.params?.['hasGameOverlay']) {
      this.fullscreenService.disableFullscreen();
    }

    switch (data.type) {
      case 'RealityCheckModal':
        this.loadComponent(RealityCheckModalComponent, data);
        break;
      case 'BonusMoneyConvertedResultModal':
        this.loadComponent(BonusMoneyConvertedResultModalComponent, data);
        break;
      case 'MoneyTypeDisplayModal':
        this.loadComponent(MoneyTypeDisplayModal, data, true);
        break;
      case 'NoRealMoneyLeftModal':
        this.loadComponent(NoRealMoneyLeftModalComponent, data);
        break;
      case 'NbeModal':
        this.loadComponent(NbeGenericModalComponent, data);
        break;
      case 'MessageModal':
        this.loadComponent(MessageModalComponent, data, true);
        break;
      default:
        this.unloadComponent();
        break;
    }
  }

  /**
   * Load a component inside the modal
   * @param component
   * @param properties to be passed to the component once is loaded in ngOnInit
   * @param isNotification indicates whether it's a notification or not
   */
  async loadComponent(component: Type<any>, properties: { type: string; payload?: any } = null, isNotification = false) {
    const viewContainerRef = isNotification ? this.notificationsViewContainerRef?.viewContainerRef : this.appViewContainerRef?.viewContainerRef;
    if (viewContainerRef && !this.currentComponent(viewContainerRef)) {
      viewContainerRef.clear();
      const viewContainerComponent = viewContainerRef.createComponent(component);
      this.currentShownComponent = viewContainerComponent.instance;
      this.currentShownComponent['data'] = properties?.payload;

      // Subscribe to modal event
      this.currentShownComponent.modalEvent.subscribe((event) => {
        this.unloadComponent(event, isNotification);
      });
    }
  }

  /**
   * Remove component from the dom
   * @param event
   * @param isNotification indicates whether it's a notification or not
   */
  unloadComponent(event?, isNotification = false) {
    const viewContainerRef = isNotification ? this.notificationsViewContainerRef?.viewContainerRef : this.appViewContainerRef?.viewContainerRef;
    if (this.currentComponent(viewContainerRef)) {
      viewContainerRef.clear();
      this.currentShownComponent = undefined;
      this.modalEvent(event, isNotification);
    }
  }

  // Check if the current component is already shown
  private currentComponent(viewContainerRef: ViewContainerRef): any {
    return viewContainerRef?.length > 0;
  }

  /**
   * Process all events from all modals all platforms
   * @param modalEvent
   */
  modalEvent(
    modalEvent: {
      action:
        | ''
        | 'freeSpinsAccepted'
        | 'freeSpinsRejected'
        | 'acknowledgeFreeSpinsResult'
        | 'acknowlege'
        | 'exit'
        | 'viewAccountHistory'
        | 'viewResponsibleGaming'
        | 'openResponsibleGaming'
        | 'restartGameAfterBonusMoneyConversion'
        | 'closeGameAfterBonusMoneyConversion'
        | 'depositMoneyAfterNoRealMoneyLeft'
        | 'restartGameAfterNoRealMoneyLeft'
        | 'viewBonusMoneyGames'
        | 'connectionLost';
      payload?: any;
    },
    isNotification = false,
  ) {
    if (!isNotification) {
      this.store.dispatch(loadTemplateClosed({}));
    }

    switch (modalEvent?.action) {
      case 'freeSpinsAccepted':
        this.startGameService.acceptFreeSpins();
        break;
      case 'freeSpinsRejected':
        this.startGameService.rejectFreeSpins();
        break;
      case 'acknowledgeFreeSpinsResult':
        this.startGameService.acknowledgeFreeSpinsResult(modalEvent.payload);
        break;
      case 'exit':
      case 'closeGameAfterBonusMoneyConversion':
      case 'connectionLost':
        this.startGameService.exitGame();
        break;
      case 'viewAccountHistory':
        this.startGameService.reportRealityCheckRedirect({ redirectUrlKey: 'user-game-history' });
        break;
      case 'viewResponsibleGaming':
        this.startGameService.reportRealityCheckRedirect({ redirectUrlKey: 'responsible-gaming' });
        break;
      case 'openResponsibleGaming':
        this.startGameService.reportRealityCheckOpenPage({ redirectUrlKey: 'responsible-gaming' });
        break;
      case 'viewBonusMoneyGames':
        this.startGameService.viewBonusMoneyGames();
        break;
      case 'restartGameAfterBonusMoneyConversion':
      case 'restartGameAfterNoRealMoneyLeft':
        this.startGameService.exitGame(true);
        break;
      case 'depositMoneyAfterNoRealMoneyLeft':
        this.startGameService.reportRealityCheckRedirect({ redirectUrlKey: 'user-deposit' });
        break;
      default:
        break;
    }
  }

  hideNavigationBarAndroid(gameWidgetParameters: IGameWidgetParameters) {
    const isAndroidApp = this.pageService.isAndroidApp();
    const platformID = gameWidgetParameters.platformId;
    const gameProvider = gameWidgetParameters.gameProvider;
    if (isAndroidApp && platformID === 'aduk' && gameProvider === 'playtech') {
      this.pageService.store.pipe(selectGame, takeUntil(this.destroy$)).subscribe((results) => {
        if (results.state === GameActionTypes.USER_PLAYING) {
          this.navigationBarService.hide();
        }
      });
    }
  }
  /**
   * close game
   */
  closeGame() {
    this.modalEvent({ action: 'exit', payload: {} });
  }

  /**
   * Clean component
   */
  ngOnDestroy() {
    if (this.loadingOverlayFadeTimer) {
      clearTimeout(this.loadingOverlayFadeTimer);
    }
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private shouldDisplayLoadingOverlay(): boolean {
    return this.template?.type === 'Loading' && !this.integrationModeTemplate?.type && !!this.platform?.gameLoadingAnimation;
  }

  private updateLoadingOverlayVisibility(): void {
    const shouldShow = this.shouldDisplayLoadingOverlay();

    if (shouldShow) {
      if (this.loadingOverlayFadeTimer) {
        clearTimeout(this.loadingOverlayFadeTimer);
        this.loadingOverlayFadeTimer = undefined;
      }
      this.isLoadingOverlayFadingOut = false;
      this.showLoadingOverlay = true;
      return;
    }

    if (!this.showLoadingOverlay || this.isLoadingOverlayFadingOut) {
      return;
    }

    this.isLoadingOverlayFadingOut = true;
    this.loadingOverlayFadeTimer = setTimeout(() => {
      this.showLoadingOverlay = false;
      this.isLoadingOverlayFadingOut = false;
      this.loadingOverlayFadeTimer = undefined;
    }, this.loadingOverlayFadeDurationMs);
  }
}
