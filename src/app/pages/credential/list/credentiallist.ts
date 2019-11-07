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

  async init() {
    this.didString = this.didService.getCurrentDidString();
    await this.getCredentialList();
    console.log("end init");
  }

  async getCredentialList() {
    await this.didService.listCredentials(this.didString).then( (ret)=> {
      this.credentials = ret.items;
      this.hasCredential = ret.items.length > 0 ? true : false;
      this.loadAllCredential();
      console.log("credential count:" + ret.items.length+ "<br>" + JSON.stringify(ret.items));
    });
  }

  loadAllCredential() {
    for (let entry of this.credentials) {
      this.loadCredential(this.didString, entry);
    }
    console.log("loadAllCredential end")
  }

  loadCredential(didString, entry) {
    this.didService.loadCredential(didString, entry['didurl']).then( (ret)=> {
      let info = {
        fragment: ret['info']['fragment'],
        type: ret['info']['type'],
        issuance: ret['info']['issuance'],
        expiration: ret['info']['expiration'],
        url: ret['info']['props']['url'],
        remark: ret['info']['props']['remark']
      }
      entry['info'] = info;
    });
    console.log("loadCredential end")
  }

  createCredential() {
    this.native.go('/credentialcreate');
  }

  backupCredential() {

  }
}
