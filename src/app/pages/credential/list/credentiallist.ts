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
  }

  async getCredentialList() {
    await this.didService.listCredentials(this.didString).then( (ret)=> {
      this.credentials = ret.items;
      this.hasCredential = ret.items.length > 0 ? true : false;
      this.loadAllCredential();
    });
  }

  loadAllCredential() {
    for (let entry of this.credentials) {
      this.loadCredential(this.didString, entry);
    }
  }

  loadCredential(didString, entry) {
    this.didService.loadCredential(didString, entry['didurl']).then( (ret)=> {
      let info = {
        fragment: ret['info']['fragment'],
        type: ret['info']['type'],
        issuance: ret['info']['issuance'],
        expiration: ret['info']['expiration'],
        title: ret['info']['title'],
        url: ret['info']['props']['url'],
        remark: ret['info']['props']['remark'],
      }
      entry['info'] = info;
      entry['isChecked'] = false;
    });
  }

  createCredential() {
    this.native.go('/credentialcreate');
  }

  backupCredential() {

  }

  deleteCredential() {
    this.credentials.forEach((credential,index,array)=>{
      if (credential.isChecked === true) {
        this.didService.deleteCredential(this.didString, credential['didurl']).then( (ret)=> {
          this.credentials.splice(index, 1);
        })
      }
    });
  }
}
