import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { Profile } from '../../model/profile.model';
import { UXService } from '../../services/ux.service';
import { PopupProvider } from '../../services/popup';
import { Util } from '../../services/util';

@Component({
  selector: 'page-credentialaccessrequest',
  templateUrl: 'credentialaccessrequest.html',
  styleUrls: ['credentialaccessrequest.scss']
})
export class CredentialAccessRequestPage {
  requestDapp: any = null;
  credentials = [];
  denyReason = '';
  public profile: Profile = {
    name:"",
    birthday:"",
    gender:"",
    area:"",
    email:"",
    IM:"",
    phone:"",
    ELAAddress:"",
  };

  constructor(private zone: NgZone,
              private didService: DIDService,
              private popup: PopupProvider,
              private appServices: UXService) {
    this.zone.run(() => {
      this.requestDapp = Config.requestDapp;
      this.profile = Config.didStoreManager.getActiveDidStore().getBasicProfile();
      this.credentials = Config.didStoreManager.getActiveDidStore().credentials;
    });
  }

  checkRequest() {
    // check profile
    let hasProfile = true;
    Object.values(this.requestDapp.requestProfile).forEach(val => {
      if (!this.hasProfile(val)) {
        hasProfile = false;
        return false;
      }
    })
    return hasProfile;
  }

  hasProfile(profile) {
    let value = "";
    switch (profile) {
      case 'email':
        value = this.profile.email;
      break;
      case 'name':
        value = this.profile.name;
      break;
      case 'phone':
        value = this.profile.phone;
      break;
    }
    if (Util.isEmptyObject(value)) {
      this.denyReason = profile + ' is empty';
      return false;
    }
    return true;
  }

  acceptRequest() {
    if (!this.checkRequest()) {
      console.log("acceptRequest false");
      this.popup.ionicAlert(this.denyReason, 'text-request-fail');
      return;
    }

    if (this.credentials.length === 0) {
      this.popup.ionicAlert('text-request-no-credential', 'text-request-fail');
      return;
    }

    //TODO select credential

    this.didService.credentialToJSON(this.credentials[0].object).then( (credential)=> {
      console.log("Sending credaccess intent response for intent id "+this.requestDapp.intentId)
      this.appServices.sendIntentResponse("credaccess", {presentation:credential}, this.requestDapp.intentId)
      this.appServices.close();
    })
  }

  rejectRequest() {
    this.appServices.close();
  }
}
