import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DIDService } from '../../../services/did.service';
import { Native } from '../../../services/native';

@Component({
  selector: 'page-credentiallist',
  templateUrl: 'credentiallist.html',
  styleUrls: ['credentiallist.scss']
})
export class CredentialListPage {
  hasCredential: boolean = false;
  didString: String = "";
  public credentials: any = {};

  constructor(public route:ActivatedRoute, private didService: DIDService, private native: Native) {
    this.init();
  }

  init() {
    this.didString = this.didService.getCurrentDidString();
    this.getCredentialList();
  }

  async getCredentialList() {
    await this.didService.listCredentials(this.didString).then( (ret)=> {
      //
      this.credentials = ret.items;
      this.hasCredential = ret.items.length > 0 ? true : false;
      console.log("credential count:" + ret.items.length+ "<br>" + JSON.stringify(ret.items));
    });
  }

  createCredential() {
    this.native.go('/credentialcreate');
  }

  onClick(item): void {
    this.native.go('/credentialdetail');
  }
}
