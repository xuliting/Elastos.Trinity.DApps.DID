import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DIDService } from '../../../services/did.service';
import { LocalStorage } from '../../../services/localstorage';
import { Native } from '../../../services/native';

@Component({
  selector: 'page-credentialcreate',
  templateUrl: 'credentialcreate.html',
  styleUrls: ['credentialcreate.scss']
})
export class CredentialCreatePage {
  password: String = "";
  didString: String = "";
  title: String = "";
  profile:any = {};

  constructor(public route:ActivatedRoute,
              private didService: DIDService, private localStorage: LocalStorage, private native: Native) {
    this.init();
  }

  init() {
    this.didString = this.didService.getCurrentDidString();
    this.localStorage.getPassword().then( (ret)=> {
      this.password = ret;
    });
    this.localStorage.get('profile').then((val) => {
      if (val) {
        this.profile = JSON.parse(val)['only-profile'];
      }
    });
  }

  async createCredential() {
    let types = new Array();
    // types[0] = "BasicProfileCredential";
    types[0] = "SelfProclaimedCredential";

    let props = {
        fullname: this.profile.fullname,
        email: this.profile.email,
        phonenumber: this.profile.phonenumber,
    }

    let credential = null;
    await this.didService.createCredential(this.didString, this.title, types, 15, props, this.password).then ( (ret)=> {
        credential = ret;
    });
    await this.didService.storeCredential(credential.objId);
    await this.didService.addCredential(credential.objId);
  }

  add() {
    this.createCredential();
    this.native.pop();
    // this.native.go('/credentialcreate');
  }
}
