import { Component, NgZone } from '@angular/core';
import { Events, Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { TranslateService } from '@ngx-translate/core';

import { Config } from './services/config';
import { DIDService } from './services/did.service';
import { LocalStorage } from './services/localstorage';
import { Native } from './services/native';
import { DidStoreManager } from './services/didstoremanager';
import { UXService } from './services/ux.service';

@Component({
  selector: 'my-app',
  templateUrl: 'app.html'
})
export class MyApp {
  constructor(
    public event: Events,
    public platform: Platform,
    public zone: NgZone,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public translate: TranslateService,
    private didService: DIDService,
    private localStorage: LocalStorage,
    private native: Native,
    private uxService: UXService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.uxService.init();
      // this.didService.init();
      Config.didStoreManager = new DidStoreManager(this.event, this.zone, this.platform, this.localStorage, this.didService, this.native);
    });
  }
}
