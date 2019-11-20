import { Component } from '@angular/core';

import { Config } from '../../../services/config';
import { Native } from '../../../services/native';

@Component({
  selector: 'app-slidemenu',
  templateUrl: 'slidemenu.html',
  styleUrls: ['slidemenu.scss']
})
export class SlideMenuPage {
  public didStoreList: any;

  constructor(private native: Native) {
    this.init();
  }

  init() {
    this.didStoreList = Config.didStoreManager.getAllDidStore();
  }

  addDidStore() {
    this.native.go("/noidentity", {isfirst: false});
  }

  switchDidStore(didStoreId) {
    Config.didStoreManager.setcurDidStoreId(didStoreId.key, true);
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
