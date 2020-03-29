import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';

import { Util } from '../../services/util';
import { Native } from '../../services/native';
import { DIDEntry } from '../../model/didentry.model';
import { DIDService } from 'src/app/services/did.service';
import { UXService } from 'src/app/services/ux.service';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-choosedid',
  templateUrl: 'choosedid.html',
  styleUrls: ['choosedid.scss']
})

export class ChooseDIDPage {
  public didList: DIDEntry[];
  private redirectOptions: any = null;

  constructor(
    private native: Native,
    public event: Events,
    private router: Router,
    private didService: DIDService,
    public zone: NgZone,
    private uxService: UXService,
    private translate: TranslateService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (!Util.isEmptyObject(navigation.extras.state)) {
      this.redirectOptions = navigation.extras.state;
    }

    this.init();
  }

  async init() {
    this.refreshStoreList();
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('choose-did'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
  }

  ionViewDidEnter() {
    this.uxService.makeAppVisible();
  }

  async refreshStoreList() {
    this.didList = await this.didService.getDidEntries();
  }

  async selectDid(didEntry: DIDEntry) {
    await this.didService.activateSavedDidStore();
    await this.didService.activateDid(this.didService.getActiveDidStore().getId(), didEntry.didString);
    this.native.setRootRouter(this.redirectOptions.redirectPath);
  }
}
