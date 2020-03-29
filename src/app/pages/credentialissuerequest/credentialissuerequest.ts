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

declare let didManager: DIDPlugin.DIDManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

// TODO: Verify and show clear errors in case data is missing in credentials (expiration date, issuer, etc).
// TODO: Resolve issuer's DID and try to display more user friendly information about the issuer
// TODO: check if the credentials have not already been imported to avoid duplicates? (or update them if something has changed)


// Displayable version of a verifiable credential subject entry (a credential can contain several information
// in its subject).
type IssuedCredentialItem = {
  name: string,
  value: string,
}

// Displayable version of a verifiable credential. Can contain one or more IssuedCredentialItem that
// are displayable version of verifiable credential subject entries.
type IssuedCredential = {
  name: string,
  values: IssuedCredentialItem[],
  credential: VerifiableCredential
}

@Component({
  selector: 'page-credentialissuerequest',
  templateUrl: 'credentialissuerequest.html',
  styleUrls: ['credentialissuerequest.scss']
})
export class CredentialIssueRequestPage {
  requestDapp: any = null;
  private credentials: VerifiableCredential[] = []; // Raw material
  displayableCredentials: IssuedCredential[] = []; // Displayable reworked matarial
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
    titleBarManager.setTitle(this.translate.instant('credential-import'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);

    this.zone.run(async () => {
      if (!BrowserSimulation.runningInBrowser()) {
        this.requestDapp = Config.requestDapp;
      }
      else {
        // Simulation - in browser
        this.requestDapp = {
          appPackageId: "org.mycompany.myapp",
          issuedCredentials: [{
            "id": "did:elastos:icJ4z2DULrHEzYSvjKNJpKyhqFDxvYV7pN#email",
            "type": ["BasicProfileCredential"],
            "issuanceDate": "2020-02-04T19:20:18Z",
            "issuer": "did:elastos:icJ4z2DULrHEzYSvjKNJpKyhqFDxvYV7pN",
            "credentialSubject": {
              "id": "did:elastos:icJ4z2DULrHEzYSvjKNJpKyhqFDxvYV7pN",
              "email": "verifiedemail@provider.com",
              "name": "MyName"
            },
            "proof": {
                "type": "ECDSAsecp256r1",
                "verificationMethod": "did:elastos:icJ4z2DULrHEzYSvjKNJpKyhqFDxvYV7pN#master-key",
                "signatureValue": "pYw8XNi1..Cky6Ed="
            }
          }]
        }
      }

      await this.runPreliminaryChecks();
      await this.organizeIssuedCredentials();

      console.log("Displayable credentials:", this.displayableCredentials)
    });
  }

  ionViewDidEnter() {
    this.uxService.makeAppVisible();
  }

  /**
   * Check a few things after entering the screen. Mostly, issued credentials content quality.
   */
  async runPreliminaryChecks() {
    // Make sure that we received at least one credential in the list
    if (!this.requestDapp.issuedCredentials || this.requestDapp.issuedCredentials.length == 0) {
      await this.popup.ionicAlert("Error", "Sorry, there is actually no credential provided in the given information", "Close");
      return;
    }

    // Check credentials content
    // TODO

    // Auto-select the targeted DID. Show an error if user doesn't have a DID targeted by this issuance.
    let targetDIDString = this.requestDapp.issuedCredentials[0].credentialSubject.id;
    let didEntry = await this.didService.searchDIDEntry(targetDIDString);
    if (!didEntry) {
      console.error("No matching target DID for DID: ", targetDIDString);
      await this.popup.ionicAlert("Error", "Sorry, you currently don't own the DID targeted by the given information", "Close");
      return;
    }

    await this.didService.activateSavedDidStore();
    await this.didService.activateDid(this.didService.getActiveDidStore().getId(), targetDIDString);

    this.preliminaryChecksCompleted = true; // Checks completed and everything is all right.
  }

  /**
   * From the raw list of credentials provided by the caller, we create our internal model
   * ready for UI.
   * NOTE: We can have several credentials passed at the same time. Each credential can have several entries in its subject.
   */
  async organizeIssuedCredentials() {
    this.displayableCredentials = [];
    for (let key of Object.keys(this.requestDapp.issuedCredentials)) {
      let issuedCredential: DIDPlugin.VerifiableCredential = didManager.VerifiableCredentialBuilder.fromJson(JSON.stringify(this.requestDapp.issuedCredentials[key]));
      console.log("Received issued credential:", issuedCredential);

      let credentialSubject = issuedCredential.getSubject();

      // Generate a displayable version of each entry found in the credential subject
      let displayableEntries: IssuedCredentialItem[] = [];
      for (let subjectEntryKey of Object.keys(credentialSubject)) {
        let subjectEntryValue = credentialSubject[subjectEntryKey];

        if (subjectEntryKey == "id") // Don't display the special subject id entry
          continue;

        let displayableEntry: IssuedCredentialItem = {
          name: subjectEntryKey,
          value: subjectEntryValue
        }

        displayableEntries.push(displayableEntry);
      }

      let displayableCredential: IssuedCredential = {
        name: this.didService.getUserFriendlyBasicProfileKeyName(issuedCredential.getFragment()),
        values: displayableEntries,
        credential: new VerifiableCredential(issuedCredential)
      };

      this.displayableCredentials.push(displayableCredential);
    }
  }

  getDisplayableIssuer() {
    // Assume we have checked that there is at least one credential earlier, and assume the issuer
    // is the same for all credentials.
    return this.requestDapp.issuedCredentials[0].issuer;
  }

  async acceptRequest() {
    // Save the credentials to user's DID.
    // NOTE: For now we save all credentials, we can't select them individually.
    AuthService.instance.checkPasswordThenExecute(async ()=>{
      for (let displayableCredential of this.displayableCredentials) {
        console.log("CredIssueRequest - storing credential: ", displayableCredential.credential);
        await this.didService.getActiveDid().addRawCredential(displayableCredential.credential);
        // NOTE: Currently, DID SDK's storeCredential() on a DID doesn't require a storepass, which is strange... // this.authService.getCurrentUserPassword());
      }

      this.popup.ionicAlert("Credential imported", "Great, the credential has been added to your DID profile.", "Done").then(()=>{
        console.log("Sending credissue intent response for intent id "+this.requestDapp.intentId)
        this.appServices.sendIntentResponse("credissue", {}, this.requestDapp.intentId)
        this.appServices.close();
      })
    }, ()=>{
      // Error
    }, ()=>{
      // Wrong password
    });
  }

  rejectRequest() {
    this.appServices.sendIntentResponse("credissue", {}, this.requestDapp.intentId)
    this.appServices.close();
  }
}
