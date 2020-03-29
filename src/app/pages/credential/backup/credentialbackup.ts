import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Native } from '../../../services/native';
import { Util } from '../../../services/util';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-credentialbackup',
  templateUrl: 'credentialbackup.html',
  styleUrls: ['credentialbackup.scss']
})
export class CredentialBackupPage {
  public credentialString: any;

  constructor(public router: Router, private native: Native, private translate: TranslateService) {
    this.init();
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('backup-credentials'));
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
