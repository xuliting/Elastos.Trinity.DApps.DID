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
import { resolve } from 'url';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

type SignIntentParams = {
  data: string
}

type SignIntentResponse = {
  type: string,
  signingdid: string,
  publickey: string,
  signature: string
}

@Component({
  selector: 'page-signrequest',
  templateUrl: 'signrequest.html',
  styleUrls: ['signrequest.scss']
})
export class SignRequestPage {
  requestDapp: {
    intentId: number,
    appPackageId: string,
    allParams: SignIntentParams,
    originalJwtRequest?: string
  } = null;

  constructor(
    private zone: NgZone,
    private didService: DIDService,
    private popup: PopupProvider,
    private uxService:UXService,
    private translate: TranslateService,
    private advancedPopup: AdvancedPopupController,
    private appServices: UXService,
    private authService: AuthService
  ) {
  }

  ionViewWillEnter() {
    titleBarManager.setTitle('Sign');
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);

    if (!BrowserSimulation.runningInBrowser()) {
      this.requestDapp = Config.requestDapp;
    }
    else {
      // Simulation - in browser
      this.requestDapp = {
        appPackageId: "org.mycompany.myapp",
        intentId: -1,
        allParams: {
          data: "please-sign-this"
        }
      }
    }
  }

  ionViewDidEnter() {
    this.uxService.makeAppVisible();
  }

  async acceptRequest() {
    console.log("Signing user data now");

    // Prompt password if needed
    AuthService.instance.checkPasswordThenExecute(async ()=>{
      let password = AuthService.instance.getCurrentUserPassword();

      let signature = await this.didService.getActiveDid().signData(this.requestDapp.allParams.data, password);
      let publicKey = await this.didService.getActiveDid().getDIDDocument().getDefaultPublicKey();

      let payload: SignIntentResponse = {
        type: "credaccess",
        signingdid: this.didService.getActiveDid().getDIDString(),
        publickey: publicKey,
        signature: signature
      }

      // Return the original JWT token in case this intent was called by an external url (elastos scheme definition)
      // TODO: Currently adding elastos://sign/ in front of the JWT because of CR website requirement. But we should cleanup this and pass only the JWT itself
      if (this.requestDapp.originalJwtRequest) {
        payload["req"] = "elastos://sign/"+this.requestDapp.originalJwtRequest;
      }

      // Return the signature info as a signed JWT in case runtime needs to send this response through a URL
      // callback. If that's inside elastOS, the JWT will be parsed and the calling app will receive the
      // signature payload.
      let jwtToken = await this.didService.getActiveDid().getDIDDocument().createJWT(payload,
      1, this.authService.getCurrentUserPassword());
    
      // Send the intent response as everything is completed
      console.log("Data signed, sending intent response");
      try {
        await this.appServices.sendIntentResponse("sign", {jwt: jwtToken}, this.requestDapp.intentId);
      }
      catch (e) {
        this.popup.ionicAlert("Response error", "Sorry, we were unable to return the signed information to the calling app.");
      }
      
      this.appServices.close();
    }, ()=>{
      // Error
    }, ()=>{
      // Wrong password
    });
  }

  async rejectRequest() {
    await this.appServices.sendIntentResponse("sign", {}, this.requestDapp.intentId);
    this.appServices.close();
  }
}
