import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, input } from '@angular/core';
import { NavigationStart } from '@angular/router';
import { MobileService } from '@app-core/mobile/mobile.service';
import { PageScrollService } from '@app-core/page/page-scroll.service';
import { PageService } from '@app-core/page/page.service';
import { ScrollLockService } from '@app-core/page/scroll-lock.service';
import { ModalActionTypes, ModalClosed } from '@app-main/actions/modal.actions';
import { APP_MODAL_DEFAULT_PRIORITY, State as ModalState, selectModal } from '@app-main/reducers/modal.reducer';
import { TestIdDirective } from '@app-shared/directives/testId.directive';
import { DeviceInfo } from 'ngx-device-detector';
import { Subject, Subscription, fromEvent as observableFromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppIconComponent } from '../app-icon/app-icon.component';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule, TestIdDirective, AppIconComponent],
})
export class ModalComponent implements AfterViewInit, OnDestroy, OnInit {
  // https://bitsofco.de/accessible-modal-dialog/

  private destroy$: Subject<boolean> = new Subject<boolean>();
  private keyboardEventListener$: Subscription;
  private isOpen = false;
  private deviceInfo: DeviceInfo;
  private currentDocumentScroll: number;

  public themeClass: string;
  public sizeClass: string;

  @Input() public title: string;
  @Input() public background: string;
  @Input() public logo: string;
  @Input() public id: string | undefined = undefined;
  @Input() public autoFocus = false;
  @Input() public backdrop = false;
  @Input() public hasCloseIcon = true;
  @Input() public theme = 'default';
  @Input() public size = 'default';
  @Input() public bodyScrollLock = true;
  @Input() public priority: number = APP_MODAL_DEFAULT_PRIORITY;
  @Input() public dialogInnerContainerBackground: string;
  @Input() public padding = true;
  @Input() public borderBottom = false;

  @Output() public onHide: EventEmitter<any> = new EventEmitter();

  @ContentChild('dialog', { static: true, read: TemplateRef }) public dialogTemplate;
  @ContentChild('content', { static: true, read: TemplateRef }) public contentTemplate;
  @ContentChild('contentTeaserTop', { static: true, read: TemplateRef }) public contentTeaserTopTemplate;
  @ContentChild('contentTeaserBottom', { static: true, read: TemplateRef }) public contentTeaserBottomTemplate;
  @ContentChild('actions', { read: TemplateRef }) public actionsTemplate;

  @ViewChild('backdrop', { static: true }) private backdropElement: ElementRef;
  @ViewChild('dialog') private dialogElement: ElementRef;

  hasHiddenBackground = input(false);
  backdropClass: string;

  constructor(
    private elementRef: ElementRef,
    private mobileService: MobileService,
    private pageScrollService: PageScrollService,
    private pageService: PageService,
    private scrollLockService: ScrollLockService,
  ) {
    this.deviceInfo = this.mobileService.getDeviceInfo();

    // always close modal on navigationStart of the router
    this.pageService.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event) => event instanceof NavigationStart && this.isOpen === true),
      )
      .subscribe(() => {
        this.hideModal();
      });

    // listen to the modal state and react to it
    this.pageService.store
      .pipe(selectModal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((modalState: ModalState) => {
        this.closeModalAsOtherIsOpen(modalState);
      });
  }

  /**
   * init component
   */
  ngOnInit() {
    this.themeClass = this.theme !== 'default' ? `is-${this.theme}` : '';
    this.sizeClass = this.size !== 'default' ? `size-${this.size}` : '';
    this.backdropClass = this.hasHiddenBackground() ? 'backdrop-hide-background' : 'backdrop';
  }

  /**
   * after view init component
   */
  ngAfterViewInit() {
    // Trigger animation on next frame to ensure initial styles are applied
    requestAnimationFrame(() => {
      this.showModal();
    });
  }

  /**
   * Should close the modal if open and other one is opening right now.
   * The other modal has to have more priority
   * @param modalState
   */
  private closeModalAsOtherIsOpen(modalState: ModalState) {
    if (this.isOpen === true && modalState.priority >= this.priority && modalState.type === ModalActionTypes.MODAL_CLOSE_REQUEST) {
      this.hideModal();
    }
  }

  /**
   * autofocus the first input in the modal
   */
  private autoFocusInput() {
    if (this.autoFocus) {
      const firstInput = this.elementRef.nativeElement.querySelector('input');

      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  /**
   * listen to keyboard events
   * close modal by hitting the esc key
   */
  private subscribeToKeyboard() {
    return observableFromEvent(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event.keyCode === 27) {
          this.hideModal('backdrop');
        }
      });
  }

  /**
   * set modal overflow
   */
  private preventBodyFromScrolling(state) {
    if (this.bodyScrollLock === false) {
      return;
    }

    const contentElement = this.elementRef.nativeElement.querySelector('[data-modal-scrollable-content]') || this.elementRef.nativeElement;

    if (state === 'show') {
      if (contentElement) {
        this.scrollLockService.disable();
        return;
      }
    }

    if (contentElement) {
      this.scrollLockService.enable();
    }
  }

  /**
   * set safari input fix
   * we apply it to iphone and ipad
   */
  private safariBrokenInputFix(state) {
    if (state === 'show') {
      // TODO if ngx-device-detector provides us the correct OS version for iphone then
      // we could apply the fix only for ios <= 11
      if (this.deviceInfo.device === 'iphone' || this.deviceInfo.device === 'ipad') {
        if (this.elementRef.nativeElement.querySelector('input[type="text"]')) {
          this.currentDocumentScroll = this.pageScrollService.getCurrentScrollPosition();
          document.body.style.position = 'fixed';
          document.body.style.maxWidth = '100vw';
          return;
        }
      }
    }

    document.body.style.position = '';
    document.body.style.maxWidth = '';

    if (this.currentDocumentScroll) {
      this.pageScrollService.scrollToPosition(this.currentDocumentScroll, false);
    }
  }

  /**
   * show modal
   */
  public showModal(): void {
    this.isOpen = true;
    this.keyboardEventListener$ = this.subscribeToKeyboard();
    this.preventBodyFromScrolling('show');
    this.safariBrokenInputFix('show');
    // this.store.dispatch(new ModalOpened({ id: this.id }));
    this.autoFocusInput();

    // Add animation classes
    this.backdropElement.nativeElement.classList.add('fade-in');
    this.dialogElement.nativeElement.classList.add('fade-in');
  }

  /**
   * hide modal
   */
  public hideModal(target: string = null): void {
    // don't close modal if backdrop is set to false
    if (target === 'backdrop' && !this.backdrop) {
      return;
    }

    if (this.keyboardEventListener$) {
      this.keyboardEventListener$.unsubscribe();
    }

    this.isOpen = false;
    this.preventBodyFromScrolling('close');
    this.safariBrokenInputFix('close');
    this.pageService.store.dispatch(new ModalClosed({ id: null /* this.id */ }));
    this.onHide.emit();
  }

  /**
   * cleanup component
   */
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
