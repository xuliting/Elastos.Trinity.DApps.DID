import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';

import { Util } from '../../services/util';
import { Native } from '../../services/native';
import { DIDEntry } from '../../model/didentry.model';
import { DIDService } from 'src/app/services/did.service';

@Component({
  selector: 'page-choosedid',
  templateUrl: 'choosedid.html',
  styleUrls: ['choosedid.scss']
})
export class ChooseDIDPage {
  public didList: DIDEntry[];
  private redirectOptions: any = null;

  constructor(private native: Native,
              public event: Events,
              private router: Router,
              private didService: DIDService,
              public zone: NgZone) {
    const navigation = this.router.getCurrentNavigation();
    if (!Util.isEmptyObject(navigation.extras.state)) {
      this.redirectOptions = navigation.extras.state;
    }

    this.init();
  }

  async init() {
    this.refreshStoreList();
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
