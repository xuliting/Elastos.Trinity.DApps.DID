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
    this.profile = Config.didStoreManager.getActiveDidStore().getBasicProfile();
  }

  async createCredential() {
    let props = {
        name: this.profile.name,
        email: this.profile.email,
        phone: this.profile.phone,
        gender: this.profile.gender,
        birthday: this.profile.birthday,
        area: this.profile.area,
        title: this.title,
        url: this.url,
        remark: this.remark,
    }

    await Config.didStoreManager.getActiveDidStore().addCredential(this.title, props);
  }

  add() {
    this.createCredential();
    this.native.pop();
  }
}
