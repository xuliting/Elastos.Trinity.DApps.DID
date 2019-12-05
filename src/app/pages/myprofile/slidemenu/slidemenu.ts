import { Component } from '@angular/core';

import { Config } from '../../../services/config';
import { Native } from '../../../services/native';
import { DIDStoreEntry } from '../../../model/didstoreentry.model';

@Component({
  selector: 'app-slidemenu',
  templateUrl: 'slidemenu.html',
  styleUrls: ['slidemenu.scss']
})
export class SlideMenuPage {
  public didStoreList: DIDStoreEntry[];

  constructor(private native: Native) {
    this.init();
  }

  async init() {
    this.didStoreList = await Config.didStoreManager.getDidStoreEntries();
  }

  addDidStore() {
    this.native.go("/noidentity", {isfirst: false});
  }

  switchDidStore(didStoreEntry: DIDStoreEntry) {
    Config.didStoreManager.activateDidStore(didStoreEntry.storeId);
    this.native.setRootRouter("/profile/myprofile", {create: false});
  }

  didSettings() {
    this.native.go("/didsettings");
  }

  showCredentials() {
    this.native.go("/credentiallist");
  }

  editProfile() {
    this.native.go("/editprofile", {create: false})
  }

  configureVisibility() {
    // TODO
  }

}
