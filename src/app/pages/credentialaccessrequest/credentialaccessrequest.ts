import { Component, NgZone } from '@angular/core';

import { Config } from '../../services/config';
import { DIDService } from '../../services/did.service';
import { Profile } from '../../model/profile.model';
import { UXService } from '../../services/ux.service';
import { PopupProvider } from '../../services/popup';
import { AuthService } from 'src/app/services/auth.service';
import { BrowserSimulation } from 'src/app/services/browsersimulation';
import { VerifiableCredential } from 'src/app/model/verifiablecredential.model';
import { TranslateService } from '@ngx-translate/core';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;
declare let didManager: DIDPlugin.DIDManager;

type ClaimRequest = {
  name: string,
  value: string,
  credential: DIDPlugin.VerifiableCredential, // credential related to this claim request
  canBeDelivered: boolean,  // Whether the requested claim can be delivered to caller or not. Almost similar to "credential" being null, except for "did"
  selected: boolean,
  reason: string // Additional usage info string provided by the caller
}

@Component({
  selector: 'page-credentialaccessrequest',
  templateUrl: 'credentialaccessrequest.html',
  styleUrls: ['credentialaccessrequest.scss']
})
export class CredentialAccessRequestPage {
  requestDapp: any = null;
  private credentials: VerifiableCredential[] = [];
  private denyReason = '';
  public profile = new Profile(); // Empty profile waiting to get the real one.
  mandatoryItems: ClaimRequest[] = [];
  optionalItems: ClaimRequest[] = [];
  canDeliver: boolean = true;

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
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
    titleBarManager.setTitle(this.translate.instant('data-access'));
    this.mandatoryItems = [];
    this.optionalItems = [];

    this.zone.run(() => {
      this.profile = this.didService.getActiveDidStore().getActiveDid().getBasicProfile();
      this.credentials = this.didService.getActiveDidStore().getActiveDid().credentials;

      if (!BrowserSimulation.runningInBrowser()) {
        this.requestDapp = Config.requestDapp;
      }
      else {
        // Simulation - in browser
        this.requestDapp = {
          appPackageId: "org.mycompany.myapp",
          requestProfile: {
            "email": true,
            "name": false,
            "gender": {
              required:false
            },
            "birthDate":true,
            //"inexistingField":true,
            "otherInexistingField":false,
            "diploma": {
              "required": false,
              "reason": "If provided, will be shown to end user"
            }
          }
        }
      }

      this.organizeRequestedClaims();

      console.log("Mandatory claims:", this.mandatoryItems)
      console.log("Optional claims:", this.optionalItems)
    });
  }

  ionViewDidEnter() {
    this.uxService.makeAppVisible();
  }

  /**
   * From the raw list of claims requested by the caller, we create our internal model
   * ready for UI.
   */
  organizeRequestedClaims() {
    // Manually append the mandatory item "Your DID".
    this.addDIDToMandatoryItems();

    // Split into mandatory and optional items
    for (let key of Object.keys(this.requestDapp.requestProfile)) {
      let claim = this.requestDapp.requestProfile[key];

      let claimIsRequired = this.claimIsRequired(claim);

      // TODO: For now we consider that 1 claim = 1 credential = 1 info inside. In the future we may
      // have several info inside one credential, so even if the caller requests only one field from such
      // credential we will have to display the WHOLE fields inside the credential on this credacess screen
      // so that users know which infos are really going to be shared (credentials can't be split).

      // Retrieve current value from active store credentials
      let relatedCredential = this.findCredential(key);
      if (!relatedCredential) {
        console.warn("No credential found for requested claim:", key);
      }

      let credentialValue: string = null;
      if (relatedCredential)
        credentialValue = this.getBasicProfileCredentialValue(relatedCredential.pluginVerifiableCredential)

      // Don't display optional items that user doesn't have.
      if (!relatedCredential && !claimIsRequired)
        continue;

      let claimRequest: ClaimRequest = {
        name: key,
        value: credentialValue,
        credential: (relatedCredential?relatedCredential.pluginVerifiableCredential:null),
        canBeDelivered: (relatedCredential != null),
        selected: true,
        reason: ""
      };

      if (claimIsRequired) {
        this.mandatoryItems.push(claimRequest);

        // If at least one mandatory item is missing, we cannot complete the intent request.
        if (relatedCredential == null)
          this.canDeliver = false;
      }
      else
        this.optionalItems.push(claimRequest);
    }
  }

  addDIDToMandatoryItems() {
    let claimRequest: ClaimRequest = {
      name: "did",
      value: this.didService.getActiveDidStore().getActiveDid().getDIDString(),
      credential: null,
      canBeDelivered: true,
      selected: true,
      reason: ""
    };

    this.mandatoryItems.push(claimRequest);
  }

  /**
   * NOTE: For now we assume that the credential name (fragment) is the same as the requested claim value.
   * But this may not be tue in the future: we would have to search inside credential properties one by one.
   *
   * key format: "my-key" (credential fragment)
   */
  findCredential(key: string): VerifiableCredential {
    return this.credentials.find((c)=>{
      return c.pluginVerifiableCredential.getFragment() == key;
    })
  }

  /**
   * NOTE: For now we assume that the credential name (fragment) is the same as the requested claim value.
   * But this may not be tue in the future: we would have to search inside credential properties one by one.
   */
  getBasicProfileCredentialValue(credential: DIDPlugin.VerifiableCredential): any {
    return credential.getSubject()[credential.getFragment()];
  }

  /**
   * Check if a raw claim provided by the caller is required or not. The "required" attribute
   * can be in various locations.
   */
  claimIsRequired(claimValue: any): boolean {
    if (claimValue instanceof Object) {
      return claimValue.required || false;
    }
    else {
      return claimValue; // Claim value itself is already a boolean
    }
  }

  claimReason(claimValue: any): string {
    if (claimValue instanceof Object) {
      return claimValue.reason || null;
    }

    return null;
  }

  /**
   * Build a list of credentials ready to be packaged into a presentation, according to selections
   * done by user (some optional items could have been removed).
   */
  buildDeliverableCredentialsList() {
    let selectedCredentials: DIDPlugin.VerifiableCredential[] = [];

    // Add all mandatory credential inconditionally
    for (let i in this.mandatoryItems) {
      let item = this.mandatoryItems[i];

      if (item.credential) // Skip DID
        selectedCredentials.push(item.credential);
    }

    // Add selected optional credentials only
    for (let i in this.optionalItems) {
      let item = this.optionalItems[i];
      if (item.selected)
        selectedCredentials.push(item.credential);
    }

    console.log(JSON.parse(JSON.stringify(selectedCredentials)));

    return selectedCredentials;
  }

  async acceptRequest() {
    let selectedCredentials = this.buildDeliverableCredentialsList();

    // Create and send the verifiable presentation that embeds the selected credentials
    AuthService.instance.checkPasswordThenExecute(async ()=>{
      let presentation = null;
      let currentDidString: string = this.didService.getActiveDid().getDIDString();
      presentation = await this.didService.getActiveDid().createVerifiablePresentationFromCredentials(selectedCredentials, this.authService.getCurrentUserPassword());
      console.log("Created presentation:", presentation);

      let payload = {
        type: "credaccess",
        did:currentDidString, 
        presentation: presentation,
      };

      // Return the original JWT token in case this intent was called by an external url (elastos scheme definition)
      // TODO: Currently adding elastos://credaccess/ in front of the JWT because of CR website requirement. But we should cleanup this and pass only the JWT itself
      if (this.requestDapp.originalJwtRequest) {
        payload["req"] = "elastos://credaccess/"+this.requestDapp.originalJwtRequest;
      }

      let jwtToken = await this.didService.getActiveDid().getDIDDocument().createJWT(payload,
      1, this.authService.getCurrentUserPassword());
      
      console.log("Sending credaccess intent response for intent id "+this.requestDapp.intentId)
      this.appServices.sendIntentResponse("credaccess", {jwt: jwtToken}, this.requestDapp.intentId)
      this.appServices.close();
    }, ()=>{
      // Error
    }, ()=>{
      // Wrong password
    });
  }

  rejectRequest() {
    this.appServices.sendIntentResponse("credaccess", {did:null, presentation: null}, this.requestDapp.intentId)
    this.appServices.close();
  }
}
