import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { UXService } from '../../services/ux.service';
import { PopupProvider } from '../../services/popup';
import { BrowserSimulation } from 'src/app/services/browsersimulation';
import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { TranslateService } from '@ngx-translate/core';
import { DIDURL } from 'src/app/model/didurl.model';
import { AuthService } from 'src/app/services/auth.service';
import { Events } from '@ionic/angular';
import { DIDDocumentPublishEvent } from 'src/app/model/eventtypes.model';

// TODO: Show credential(s) content that will be created to the user. He needs to make sure for example
// that no shared credential will overwrite existing ones like "name" or "email"...

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

type RegAppProfileIntentParamLocalizedString = {
  lang: string,
  value: string
}
type RegAppProfileIntentParamActionTitle = string | RegAppProfileIntentParamLocalizedString[];

type RegAppProfileIntentParamFlatClaim = {}; // "key": "value"

type RegAppProfileIntentParams = {
    identifier: string,
    connectactiontitle: RegAppProfileIntentParamActionTitle
    customcredentialtypes: string[],
    sharedclaims: RegAppProfileIntentParamFlatClaim[]
}

@Component({
  selector: 'page-regappprofilerequest',
  templateUrl: 'regappprofilerequest.html',
  styleUrls: ['regappprofilerequest.scss']
})
export class RegisterApplicationProfileRequestPage {
  requestDapp: {
    intentId: number,
    appPackageId: string,
    allParams: RegAppProfileIntentParams
  } = null;
  credentials = [];
  denyReason = '';

  public shouldPublishOnSidechain: boolean = true;

  constructor(
    private zone: NgZone,
    private didService: DIDService,
    private popup: PopupProvider,
    private events: Events,
    private uxService:UXService,
    private translate: TranslateService,
    private advancedPopup: AdvancedPopupController,
    private appServices: UXService
  ) {
  }

  ionViewWillEnter() {
    titleBarManager.setTitle('Application Profile');
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);

    if (!BrowserSimulation.runningInBrowser()) {
      console.log("Received request data:", Config.requestDapp);
      this.requestDapp = Config.requestDapp;

      // Fix missing or wrong values, just in case
      if (!this.requestDapp.allParams.customcredentialtypes)
        this.requestDapp.allParams.customcredentialtypes = [];

      if (!this.requestDapp.allParams.sharedclaims)
        this.requestDapp.allParams.sharedclaims = [];

      console.log("Modified request data:", this.requestDapp);
    }
    else {
      // Simulation - in browser
      this.requestDapp = {
        appPackageId: "org.mycompany.myapp",
        intentId: -1,
        allParams: {
          identifier: "",
          connectactiontitle: "", // Or [{lang:"", value:""},...]
          customcredentialtypes: [],
          sharedclaims:[
            {name: "Updated Ben"}
          ]
        }
      };
      (this.requestDapp.allParams as any).customParam1 = "";
    }
  }

  ionViewDidEnter() {
    this.uxService.makeAppVisible();

    // Listen to publication result event to know when the wallet app returns from the "didtransaction" intent
    // request initiated by publish() on a did document.
    this.events.subscribe("diddocument:publishresultpopupclosed", (result: DIDDocumentPublishEvent)=>{
      console.log("diddocument:publishresultpopupclosed event received in regappprofile request", result);
      if (result.published) {
        this.sendIntentResponse();
      }
    });
  }

  async acceptRequest() {
    // Prompt password if needed
    AuthService.instance.checkPasswordThenExecute(async ()=>{
      let password = AuthService.instance.getCurrentUserPassword();

      // Create the main application profile credential
      await this.createMainApplicationProfileCredential(password)

      // Create individual credentials for each shared claim
      await this.createIndependantCredentials(password)

      // If asked by user, add credentials to the did document and send intent to save the DID document on chain (if user checked the box)
      await this.publishOnChainIfNeeded(password);
    }, ()=>{
      // Error
    }, ()=>{
      // Wrong password
    });
  }

  publishOnChainIfNeeded(password: string) {
    return new Promise((resolve, reject)=>{
      console.log("Publish on chain if needed: ", this.shouldPublishOnSidechain);

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
                // Publish will open the wallet app to send the DID transaction
                this.didService.getActiveDid().getDIDDocument().publish(password);
                resolve();
              },
              cancelCallback: ()=>{
                resolve();
              }
          }
        }).show();
      }
      else {
        // User doesn't want to publish this profile on the DID sidechain - so we just end the process.
        resolve();
      }
    });
  }

  sendIntentResponse() {
    // Send the intent response as everything is completed
    this.appServices.sendIntentResponse("registerapplicationprofile", {}, this.requestDapp.intentId, true);
  }

  async createMainApplicationProfileCredential(password: string) {
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
      if (key == "identifier" || key == "sharedclaims" || key == "customcredentialtypes" || key == "connectactiontitle")
        return;

      let value = this.requestDapp.allParams[key];
      console.log("Including field in app profile credential: key:",key," value:",value);
      props[key] = value;
    });

    // Append mandatory credential properties
    props["identifier"] = this.requestDapp.allParams.identifier;
    props["action"] = this.requestDapp.allParams.connectactiontitle;
    props["apppackage"] = this.requestDapp.appPackageId;
    props["apptype"] = "elastosbrowser";

    console.log("Credential properties:", props);

    // Create and append the new ApplicationProfileCredential credential to the local store.
    let credentialId = new DIDURL("#"+credentialTitle);
    let createdCredential = await this.didService.getActiveDid().addCredential(credentialId, props, password, customCredentialTypes);

    // Add this credential to the DID document.
    await this.didService.getActiveDid().getDIDDocument().updateOrAddCredential(createdCredential, password);

    console.warn("diddoc after main app profile added:", this.didService.getActiveDid().getDIDDocument());
  }

  async createIndependantCredentials(password: string) {
    console.log("Creating independant credentials");

    let sharedClaims = this.requestDapp.allParams.sharedclaims;
    for (let sharedClaim of sharedClaims) {
      Object.keys(sharedClaim).map(async (key)=>{
        let value = sharedClaim[key];

        console.log("Creating independant credential with key "+key+" and value:", value);
        let credentialId = new DIDURL("#"+key);
        let createdCredential = await this.didService.getActiveDid().addCredential(credentialId, {key:value}, password);

        // Add this credential to the DID document.
        await this.didService.getActiveDid().getDIDDocument().updateOrAddCredential(createdCredential, password);

        console.warn("diddoc after shared claim added:", this.didService.getActiveDid().getDIDDocument());
      });
    }
  }

  rejectRequest() {
    this.appServices.close();
  }
}
