import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { Profile } from '../../model/profile.model';
import { UXService } from '../../services/ux.service';
import { PopupProvider } from '../../services/popup';
import { Util } from '../../services/util';
import { AuthService } from 'src/app/services/auth.service';
import { WrongPasswordException } from 'src/app/model/exceptions/wrongpasswordexception.exception';

@Component({
  selector: 'page-credentialaccessrequest',
  templateUrl: 'credentialaccessrequest.html',
  styleUrls: ['credentialaccessrequest.scss']
})
export class CredentialAccessRequestPage {
  requestDapp: any = null;
  credentials: DIDPlugin.VerifiableCredential[] = [];
  denyReason = '';
  public profile: Profile = {
    name:"",
    birthDate:"",  // RFC 3339
    gender:"",
    nation:"", // ISO ALPHA 3
    email:"",
    telephone:""
  };

  constructor(private zone: NgZone,
              private didService: DIDService,
              private popup: PopupProvider,
              private authService: AuthService,
              private popupProvider: PopupProvider,
              private appServices: UXService) {
  }

  ionViewWillEnter() {
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
      case 'telephone':
        value = this.profile.telephone;
      break;
    }
    if (Util.isEmptyObject(value)) {
      this.denyReason = profile + ' is empty';
      return false;
    }
    return true;
  }

  async acceptRequest() {
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
    let selectedCredentials = this.credentials; // TMP: EVERYTHING FOR NOW

    // Create and send the verifiable presentation that embeds the selected credentials
    await this.checkPasswordAndSendPresentation(selectedCredentials, false);
  }

  private async checkPasswordAndSendPresentation(selectedCredentials: DIDPlugin.VerifiableCredential[], forcePasswordPrompt: boolean = false): Promise<DIDPlugin.VerifiablePresentation> {
    // This write operation requires password. Make sure we have this in memory, or prompt user.
    if (forcePasswordPrompt || this.authService.needToPromptPassword(Config.didStoreManager.getCurDidStoreId())) {
      let previousPasswordWasWrong = forcePasswordPrompt;
      await this.authService.promptPasswordInContext(Config.didStoreManager.getCurDidStoreId(), previousPasswordWasWrong);
      // Password will be saved by the auth service.
    }

    let presentation = null;
    let currentDidString = Config.didStoreManager.getActiveDidStore().getCurrentDid();
    try {
      presentation = await this.didService.createVerifiablePresentationFromCredentials(currentDidString, selectedCredentials, this.authService.getCurrentUserPassword());  
      console.log("Created presentation:", presentation);
    }
    catch (e) {
      console.error(e);
      // (Probably...) wrong password provided - try again.
      this.checkPasswordAndSendPresentation(selectedCredentials, forcePasswordPrompt = true);
      return;
    }

    console.log("Sending credaccess intent response for intent id "+this.requestDapp.intentId)
    this.appServices.sendIntentResponse("credaccess", {did:currentDidString, presentation: presentation}, this.requestDapp.intentId)
    this.appServices.close();
  }

  rejectRequest() {
    this.appServices.close();
  }
}
