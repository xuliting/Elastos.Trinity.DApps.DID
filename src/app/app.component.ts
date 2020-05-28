import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, IonRouterOutlet } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { TranslateService } from '@ngx-translate/core';

import { UXService } from './services/ux.service';
import { BrowserSimulation } from './services/browsersimulation';
import { BasicCredentialsService } from './services/basiccredentials.service';
import { DIDEvents } from './services/events';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'my-app',
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(IonRouterOutlet, {static: true}) routerOutlet: IonRouterOutlet;

  constructor(
    public platform: Platform,
    public zone: NgZone,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public translate: TranslateService,
    private uxService: UXService,
    public didEvents: DIDEvents,
    public translation: TranslationService,
    public basicCredentialsService: BasicCredentialsService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    console.log("Initialize app");

    if (this.platform.platforms().indexOf("cordova") < 0) {
      BrowserSimulation.setRunningInBrowser();
    }

    this.platform.ready().then(() => {
      console.log("Platform is ready");

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.setupBackKeyNavigation();

      // Call this after the DID store manager is initialized
      this.uxService.init();
    });
  }

  /**
   * Listen to back key events. If the default router can go back, just go back.
   * Otherwise, exit the application.
   */
  setupBackKeyNavigation() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.routerOutlet.pop();
      } else {
        navigator['app'].exitApp();
      }
    });
  }
}
