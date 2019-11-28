import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { Profile } from '../../services/profile.model';
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

  constructor(private zone: NgZone, private popup: PopupProvider, private appServices: UXService) {
    this.zone.run(() => {
      this.requestDapp = Config.requestDapp;
      this.profile = Config.didStoreManager.getProfile();
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

    console.log("Sending credaccess intent response for intent id "+this.requestDapp.intentId)
    this.appServices.sendIntentResponse("credaccess", {result:"success"}, this.requestDapp.intentId)
    this.appServices.close();
  }

  rejectRequest() {
    this.appServices.close();
  }
}
