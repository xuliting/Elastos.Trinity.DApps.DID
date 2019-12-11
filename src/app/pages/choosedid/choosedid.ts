import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { DIDStoreEntry } from '../../model/didstoreentry.model';

@Component({
  selector: 'page-choosedid',
  templateUrl: 'choosedid.html',
  styleUrls: ['choosedid.scss']
})
export class ChooseDIDPage {
  public didStoreList: DIDStoreEntry[];

  constructor(private native: Native,
              public event: Events,
              public zone: NgZone) {
    this.init();
  }

  async init() {
    this.refreshStoreList();
  }

  async refreshStoreList() {
    this.didStoreList = await Config.didStoreManager.getDidStoreEntries();
  }

  async selectDidStore(didStoreEntry: DIDStoreEntry) {
    await Config.didStoreManager.activateDidStore(didStoreEntry.storeId);
    this.native.setRootRouter("TODO FROM OPTS", {create: false}); // TODO
  }
}
