/**
 * Example Component for Testing Service Worker
 * 
 * Add this component to your app to test service worker functionality
 */

import { Component, OnInit } from '@angular/core';
import { ServiceWorkerTestService } from './test-service-worker';

@Component({
  selector: 'app-sw-test',
  template: `
    <div class="sw-test-panel" style="position: fixed; top: 10px; right: 10px; background: #f0f0f0; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 9999;">
      <h3 style="margin-top: 0;">Service Worker Test Panel</h3>
      
      <div style="margin-bottom: 10px;">
        <strong>Status:</strong> 
        <span [style.color]="isEnabled ? 'green' : 'red'">
          {{ isEnabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>
      
      <div style="margin-bottom: 10px;">
        <strong>Version:</strong> {{ currentVersion }}
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button (click)="checkUpdate()" style="padding: 5px 10px;">
          Check for Update
        </button>
        <button (click)="activateUpdate()" style="padding: 5px 10px;">
          Activate Update
        </button>
        <button (click)="logStatus()" style="padding: 5px 10px;">
          Log Status
        </button>
        <button (click)="clearCache()" style="padding: 5px 10px;">
          Clear Cache
        </button>
        <button (click)="unregisterSW()" style="padding: 5px 10px;">
          Unregister SW
        </button>
      </div>
      
      <div *ngIf="updateMessage" style="margin-top: 10px; padding: 5px; background: #fff; border-radius: 3px;">
        {{ updateMessage }}
      </div>
    </div>
  `
})
export class ServiceWorkerTestComponent implements OnInit {
  isEnabled = false;
  currentVersion = 'Unknown';
  updateMessage = '';

  constructor(private swTest: ServiceWorkerTestService) {}

  ngOnInit(): void {
    this.isEnabled = this.swTest.isServiceWorkerEnabled();
    this.currentVersion = this.swTest.getCurrentVersion();
    this.swTest.listenForUpdates();
  }

  checkUpdate(): void {
    this.swTest.checkForUpdate().then(available => {
      this.updateMessage = available 
        ? 'Update available!' 
        : 'No update available';
    });
  }

  activateUpdate(): void {
    this.swTest.activateUpdate();
  }

  logStatus(): void {
    this.swTest.logStatus();
  }

  clearCache(): void {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
        this.updateMessage = 'Cache cleared!';
      });
    }
  }

  unregisterSW(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
        this.updateMessage = 'Service Worker unregistered!';
        setTimeout(() => window.location.reload(), 1000);
      });
    }
  }
}
