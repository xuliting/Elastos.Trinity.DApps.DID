import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Config } from '../../../services/config';
import { Native } from '../../../services/native';
import { DIDService } from 'src/app/services/did.service';
import { DIDURL } from 'src/app/model/didurl.model';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

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

  constructor(
    public route: ActivatedRoute,
    private didService: DIDService,
    private native: Native,
    private translate: TranslateService
  ) {
    this.init();
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('create-credentials'));
  }

  init() {
    this.profile = this.didService.getActiveDid().getBasicProfile();
  }

  async createCredential() {
    let props = {
        name: this.profile.name,
        email: this.profile.email,
        telephone: this.profile.telephone,
        gender: this.profile.gender,
        birthDate: this.profile.birthDate,
        nation: this.profile.nation
    }

    await this.didService.getActiveDid().addCredential(new DIDURL("#"+this.title), props, "PASSWORD-TODO");
  }

  add() {
    this.createCredential();
    this.native.pop();
  }
}
