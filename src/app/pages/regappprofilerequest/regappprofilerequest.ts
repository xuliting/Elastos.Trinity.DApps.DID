import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { UXService } from '../../services/ux.service';
import { PopupProvider } from '../../services/popup';
import { BrowserSimulation } from 'src/app/services/browsersimulation';
import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { TranslateService } from '@ngx-translate/core';

// TODO: Show credential(s) content that will be created to the user. He needs to make sure for example
// that no shared credential will overwrite existing ones like "name" or "email"...

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
              private translate: TranslateService,
              private advancedPopup: AdvancedPopupController,
              private appServices: UXService) {
  }

  ionViewWillEnter() {
    if (!BrowserSimulation.runningInBrowser()) {
      this.requestDapp = Config.requestDapp;
    }
    else {
      // Simulation - in browser
      this.requestDapp = {
        appName: "org.mycompany.myapp",
        allParams: {
          identifier: "",
          connectactiontitle: "", // Or [{lang:"", value:""},...]
          customcredentialtypes: [],
          sharedclaims:[],
          cust1:"",
          cust2:""
        }
      }
    }
  }

  async acceptRequest() {
    // Create the main application profile credential
    await this.createMainApplicationProfileCredential()

    // Create individual credentials for each shared claim
    await this.createIndependantCredentials()

    // If asked by user, add credentials to the did document and send intent to save the DID document on chain (if user checked the box)
    await this.publishOnChainIfNeeded();

    this.sendIntentResponse();
  }

  publishOnChainIfNeeded() {
    if (this.shouldPublishOnSidechain) {
      this.advancedPopup.create({
        color:'var(--ion-color-primary)',
        info: {
            picture: '/assets/images/Visibility_Icon.svg',
            title: this.translate.instant("publish-popup-title"),
            content: this.translate.instant("publish-popup-content")
        },
        prompt: {
            title: this.translate.instant("publish-popup-confirm-question"),
            confirmAction: this.translate.instant("confirm"),
            cancelAction: this.translate.instant("go-back"),
            confirmCallback: async ()=>{
              // TODO
              console.log("TODO - WRITE AND PUBLISH DIDDOCUMENT ON SIDECHAIN")
              this.sendIntentResponse();
            }
        }
      }).show();
    }
    else {
      // User doesn't want to publish this profile on the DID sidechain - so we just end the process.
      this.sendIntentResponse();
    }
  }

  sendIntentResponse() {
    // Send the intent response as everything is completed
    this.appServices.sendIntentResponse("registerapplicationprofile", {}, this.requestDapp.intentId)
    this.appServices.close();
  }

  async createMainApplicationProfileCredential() {
    console.log("Creating application profile credential");

    // The credential title is the identifier given by the application. Ex: "twitter".
    let credentialTitle = this.requestDapp.allParams.identifier;

    // Add the standard "ApplicationProfileCredential" credential type, plus any other type provided by the requester.
    let customCredentialTypes = [
      "ApplicationProfileCredential"
    ];
    this.requestDapp.allParams.customcredentialtypes.map((type)=>customCredentialTypes.push(type));

    // Map each parameter provided by the app as a custom parameter for the main credential
    let props = {};
    Object.keys(this.requestDapp.allParams).map((key)=>{
      // Skip non-user keys
      if (key == "identifier" || key == "sharedclaims" || key =="customcredentialtypes")
        return;

      let value = this.requestDapp.allParams[key];
      console.log("Including field in app profile credential: key:",key," value:",value);
      props[key] = value;
    });
    
    // Create and append the new ApplicationProfileCredential credential to the local store.
    await this.didService.getActiveDid().addCredential(credentialTitle, props, "PASSWORDTODO", customCredentialTypes);
  }

  async createIndependantCredentials() {
    console.log("Creating independant credentials");

    let sharedClaims = this.requestDapp.allParams.sharedclaims;
    Object.keys(sharedClaims).map(async (key)=>{
      let value = sharedClaims[key];

      console.log("Creating independant credential with key "+key+" and value:", value);
      await this.didService.getActiveDid().addCredential(key, {key:value}, "PASSWORDTODO");
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