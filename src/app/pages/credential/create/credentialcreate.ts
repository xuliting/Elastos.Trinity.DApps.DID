import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Config } from '../../../services/config';
import { Native } from '../../../services/native';

@Component({
  selector: 'page-credentialcreate',
  templateUrl: 'credentialcreate.html',
  styleUrls: ['credentialcreate.scss']
})
export class CredentialCreatePage {
  title: String = "";
  url: String = "";
  remark: String = "";
  profile:any = {};

  constructor(public route:ActivatedRoute, private native: Native) {
    this.init();
  }

  init() {
    this.profile = Config.didStoreManager.getProfile();
  }

  async createCredential() {

    let props = {
        // fullname: this.profile.fullname,
        // email: this.profile.email,
        // phonenumber: this.profile.phonenumber,
        title: this.title,
        url: this.url,
        remark: this.remark,
    }

    await Config.didStoreManager.addCredential(this.title, props);
  }

  add() {
    this.createCredential();
    this.native.pop();
  }
}
