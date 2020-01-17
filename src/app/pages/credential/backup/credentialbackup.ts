import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Native } from '../../../services/native';
import { Util } from '../../../services/util';

@Component({
  selector: 'page-credentialbackup',
  templateUrl: 'credentialbackup.html',
  styleUrls: ['credentialbackup.scss']
})
export class CredentialBackupPage {
  public credentialString: any;

  constructor(public router: Router, private native: Native) {
    this.init();
  }

  init() {
    const navigation = this.router.getCurrentNavigation();
    if (!Util.isEmptyObject(navigation.extras.state)) {
        this.credentialString = navigation.extras.state["content"];
    }
  }

  copyToClipboard() {
    this.native.copyClipboard(this.credentialString);
    this.native.toast_trans('copy-ok');
  }
}
