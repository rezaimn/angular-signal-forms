/**
 * Service Worker Testing Utilities
 * 
 * Use these utilities in your Angular app to test service worker functionality
 */

import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerTestService {
  constructor(private swUpdate: SwUpdate) {}

  /**
   * Check if service worker is enabled
   */
  isServiceWorkerEnabled(): boolean {
    return this.swUpdate.isEnabled;
  }

  /**
   * Manually check for updates
   */
  checkForUpdate(): Promise<boolean> {
    return this.swUpdate.checkForUpdate();
  }

  /**
   * Listen for version updates and log them
   */
  listenForUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(() => {
        console.log('New version available! Reloading...');
        window.location.reload();
      });

    this.swUpdate.versionUpdates.subscribe(event => {
      console.log('Service Worker Update Event:', event);
    });
  }

  /**
   * Activate update immediately
   */
  async activateUpdate(): Promise<void> {
    await this.swUpdate.activateUpdate();
    window.location.reload();
  }

  /**
   * Get current service worker version
   */
  getCurrentVersion(): string {
    return this.swUpdate.currentVersion || 'Unknown';
  }

  /**
   * Log service worker status
   */
  logStatus(): void {
    console.log('Service Worker Enabled:', this.isServiceWorkerEnabled());
    console.log('Current Version:', this.getCurrentVersion());
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Active Service Worker Registrations:', registrations.length);
        registrations.forEach((reg, index) => {
          console.log(`Registration ${index + 1}:`, {
            scope: reg.scope,
            active: reg.active?.scriptURL,
            waiting: reg.waiting?.scriptURL,
            installing: reg.installing?.scriptURL
          });
        });
      });
    }
  }
}
