import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { UXService } from '../../services/ux.service';
import { PopupProvider } from '../../services/popup';

@Component({
  selector: 'page-regappprofilerequest',
  templateUrl: 'regappprofilerequest.html',
  styleUrls: ['regappprofilerequest.scss']
})
export class RegisterApplicationProfileRequestPage {
  requestDapp: any = null;
  credentials = [];
  denyReason = '';

  public shouldPublishOnSidechain: boolean = true;

  constructor(private zone: NgZone,
              private didService: DIDService,
              private popup: PopupProvider,
              private appServices: UXService) {
    this.zone.run(() => {
      this.requestDapp = Config.requestDapp;
    });
  }

  async acceptRequest() {
    // Create the main application profile credential
    await this.createMainApplicationProfileCredential()

    // Create individual credentials for each shared claim
    await this.createIndependantCredentials()

    // TODO: add credentials to the did document and send intent to save the DID document on chain (if user checked the box)

    // Send the intent response as everything is completed
    this.appServices.sendIntentResponse("registerapplicationprofile", {}, this.requestDapp.intentId)
    this.appServices.close();
  }

  async createMainApplicationProfileCredential() {
    // The credential title is the identifier given by the application. Ex: "twitter".
    let credentialTitle = Config.requestDapp.identifier;

    // Add the standard "ApplicationProfileCredential" credential type, plus any other type provided by the requester.
    let customCredentialTypes = [
      "ApplicationProfileCredential"
    ];
    Config.requestDapp.customcredentialtypes.map((type)=>customCredentialTypes.push(type));

    // Map each parameter provide by the app as a custom parameter for the main credential
    let props = {};
    Object.keys(Config.requestDapp.allParams).map((key)=>{
      // Skip non-user keys
      if (key == "sharedclaims")
        return;

      let value = Config.requestDapp.allParams[key];
      console.log("Key",key,"value",value);
      props[key] = value;
    });
    
    // Create and append the new ApplicationProfileCredential credential to the local store.
    await Config.didStoreManager.addCredential(credentialTitle, props, customCredentialTypes);
  }

  async createIndependantCredentials() {
    let sharedClaims = Config.requestDapp.allParams.sharedclaims;
    Object.keys(sharedClaims).map(async (key)=>{
      let value = sharedClaims[key];
      console.log("shared claim", key, value);

      console.log("Creating independant credential with key "+key+" and value:", value);
      await Config.didStoreManager.addCredential(key, {key:value});
    });
  }

  rejectRequest() {
    this.appServices.close();
  }
}

/*this.didService.credentialToJSON(this.credentials[0].object).then( (credential)=> {
  console.log("Sending register application profile intent response for intent id "+this.requestDapp.intentId)
  
  this.appServices.close();
})*/