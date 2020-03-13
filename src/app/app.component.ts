import { Component, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { TranslateService } from '@ngx-translate/core';

import { Config } from './services/config';
import { DIDService } from './services/did.service';
import { LocalStorage } from './services/localstorage';
import { Native } from './services/native';
import { UXService } from './services/ux.service';
import { BrowserSimulation } from './services/browsersimulation';
import { AuthService } from './services/auth.service';
import { PopupProvider } from './services/popup';
import { BasicCredentialsService } from './services/basiccredentials.service';
import { TranslationService } from './services/translation.service';
import { DIDSyncService } from './services/didsync.service';
import { DIDEvents } from './services/events';

@Component({
  selector: 'my-app',
  templateUrl: 'app.html'
})
export class MyApp {
  constructor(
    public platform: Platform,
    public zone: NgZone,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public translate: TranslateService,
    private localStorage: LocalStorage,
    private native: Native,
    private didEvents: DIDEvents,
    private popupProvider: PopupProvider,
    private didService: DIDService,
    private didSyncService: DIDSyncService,
    private translationService: TranslationService,
    private uxService: UXService,
    private basicCredentialsService: BasicCredentialsService
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

      /*appManager.getTitleBar().setBackgroundColor("#FFFFFF");
      appManager.getTitleBar().setForegroundMode(AppManagerPlugin.TitleBarForegroundMode.DARK);
      appManager.getTitleBar().setTitle("My Profile");*/

      // Call this after the DID store manager is initialized
      this.uxService.init();
    });
  }
}
