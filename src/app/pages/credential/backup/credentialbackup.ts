import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Native } from '../../../services/native';

@Component({
  selector: 'page-credentialbackup',
  templateUrl: 'credentialbackup.html',
  styleUrls: ['credentialbackup.scss']
})
export class CredentialBackupPage {
  public credentialString: any;

  constructor(public route:ActivatedRoute, private native: Native) {
    this.init();
  }

  init() {
    this.route.queryParams.subscribe((data) => {
        this.credentialString = data["content"];
    });
  }

  copyToClipboard() {
    this.native.copyClipboard(this.credentialString);
    this.native.toast_trans('copy-ok');
  }
}
