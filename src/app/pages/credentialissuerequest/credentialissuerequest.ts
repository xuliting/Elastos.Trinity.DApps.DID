import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { Profile } from '../../model/profile.model';
import { UXService } from '../../services/ux.service';
import { PopupProvider } from '../../services/popup';
import { Util } from '../../services/util';
import { AuthService } from 'src/app/services/auth.service';
import { WrongPasswordException } from 'src/app/model/exceptions/wrongpasswordexception.exception';
import { BrowserSimulation } from 'src/app/services/browsersimulation';
import { VerifiableCredential } from 'src/app/model/verifiablecredential.model';
import { TranslateService } from '@ngx-translate/core';
import { DIDURL } from 'src/app/model/didurl.model';

declare let didManager: DIDPlugin.DIDManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

// TODO: Verify and show clear errors in case data is missing in credentials (expiration date, issuer, etc).
// TODO: Resolve issuer's DID and try to display more user friendly information about the issuer
// TODO: check if the credentials have not already been imported to avoid duplicates? (or update them if something has changed)


// Displayable version of a verifiable credential subject entry (a credential can contain several information
// in its subject).
type IssuedCredentialItem = {
  name: string,
  value: any,
}

// Displayable version of a verifiable credential. Can contain one or more IssuedCredentialItem that
// are displayable version of verifiable credential subject entries.
type IssuedCredential = {
  identifier: string, 
  receiver: string,
  expirationDate: Date,
  values: IssuedCredentialItem[]
}

@Component({
  selector: 'page-credentialissuerequest',
  templateUrl: 'credentialissuerequest.html',
  styleUrls: ['credentialissuerequest.scss']
})
export class CredentialIssueRequestPage {
  requestDapp: any = null;
  public displayableCredential: IssuedCredential = null; // Displayable reworked material
  preliminaryChecksCompleted: boolean = false;

  constructor(
    private zone: NgZone,
    private didService: DIDService,
    private popup: PopupProvider,
    private uxService: UXService,
    private authService: AuthService,
    private popupProvider: PopupProvider,
    private appServices: UXService,
    private translate: TranslateService
  ) {
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('credential-issue'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);

    this.zone.run(async () => {
      if (!BrowserSimulation.runningInBrowser()) {
        this.requestDapp = Config.requestDapp;
        console.log("DEBUG REQUEST: "+JSON.stringify(this.requestDapp));
      }
      else {
        // Simulation - in browser
        this.requestDapp = {
          appPackageId: "org.mycompany.myapp",
          identifier: "customcredentialkey", // unique identifier for this credential
          types: [], // Additional credential types (strings) such as BasicProfileCredential.
          subjectDID: "did:elastos:abc", // DID targeted by the created credential. Only that did will be able to import the credential.
          properties: [{
              someCustomData: "Here is a test data that will appear in someone else's DID document after he imports it."
          }],
          expirationDate: new Date(2024,12,12)
        };
      }

      this.runPreliminaryChecks();
      this.organizeDisplayableInformation();

      console.log("Displayable credential:", this.displayableCredential)

      this.uxService.makeAppVisible();
    });
  }

  ionViewDidEnter() {
    console.log("Cred Issue screen did enter");
  }

  /**
   * Check a few things after entering the screen. Mostly, issued credential content quality.
   */
  runPreliminaryChecks() {
    // Nothing yet 

    this.preliminaryChecksCompleted = true; // Checks completed and everything is all right.
  }

  /**
   * From the raw data provided by the caller, we create our internal model ready for UI.
   */
  organizeDisplayableInformation() {
    // Generate a displayable version of each entry found in the credential subject
    let displayableEntries: IssuedCredentialItem[] = [];
    for (let propertyEntryKey of Object.keys(this.requestDapp.properties)) {
      let propertyEntryValue = this.requestDapp.properties[propertyEntryKey];

      let displayableEntry: IssuedCredentialItem = {
        name: propertyEntryKey,
        value: propertyEntryValue
      }

      displayableEntries.push(displayableEntry);
    }

    this.displayableCredential = {
      // The received identitier should NOT start with #, but DID SDK credentials start with #.
      identifier: new DIDURL("#"+this.requestDapp.identifier).getFragment(),
      receiver: this.requestDapp.subjectDID,
      expirationDate: null,
      values: displayableEntries
    };

    if (this.requestDapp.expirationDate) // Should be a ISO date string
      this.displayableCredential.expirationDate = new Date(this.requestDapp.expirationDate);
    else {
      let now = new Date().getTime();
      let fiveDaysAsMs = 5*24*60*60*1000;
      this.displayableCredential.expirationDate = new Date(now+fiveDaysAsMs);
    }
  }

  getDisplayableEntryValue(value: any) {
    if (value instanceof Object) {
      return JSON.stringify(value);
    }

    return value;
  }

  async acceptRequest() {
    // Save the credentials to user's DID.
    // NOTE: For now we save all credentials, we can't select them individually.
    AuthService.instance.checkPasswordThenExecute(async ()=>{
      console.log("CredIssueRequest - issuing credential");

      let validityDays = (this.displayableCredential.expirationDate.getTime() - Date.now()) / 1000 / 60 / 60 / 24;

      this.didService.getActiveDid().pluginDid.issueCredential(
        this.displayableCredential.receiver,
        "#"+this.displayableCredential.identifier, 
        this.requestDapp.types,
        validityDays,
        this.requestDapp.properties,
        this.authService.getCurrentUserPassword(),
        (issuedCredential)=>{
          this.popup.ionicAlert("Credential issued", "Great, the credential has been created!", "Done").then(async ()=>{
            console.log("Sending credissue intent response for intent id "+this.requestDapp.intentId)
            let credentialAsString = await issuedCredential.toString();
            await this.appServices.sendIntentResponse("credissue", {
              credential: credentialAsString
            }, this.requestDapp.intentId);
            this.appServices.close();
          })
        }, async (err)=>{
          await this.popup.ionicAlert("Error", "Sorry, the credential could not be issued. "+JSON.stringify(err), "Close");
          this.rejectRequest();
        });
    }, ()=>{
      // Cancelled
    });
  }

  async rejectRequest() {
    await this.appServices.sendIntentResponse("credissue", {}, this.requestDapp.intentId);
    this.appServices.close();
  }
}
