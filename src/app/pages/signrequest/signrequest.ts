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

type SignIntentParams = {
  data: string
}

type SignIntentResponse = {
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
    allParams: SignIntentParams
  } = null;

  constructor(private zone: NgZone,
              private didService: DIDService,
              private popup: PopupProvider,
              private uxService:UXService,
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

      let response: SignIntentResponse = {
        signingdid: this.didService.getActiveDid().getDIDString(),
        publickey: publicKey,
        signature: signature
      }

      console.log("Data signed, sending intent response", response);
      this.sendIntentResponse(response);
    }, ()=>{
      // Error
    }, ()=>{
      // Wrong password
    });
  }

  sendIntentResponse(response: SignIntentResponse) {
    // Send the intent response as everything is completed
    this.appServices.sendIntentResponse("sign", response, this.requestDapp.intentId);
    this.appServices.close();
  }

  rejectRequest() {
    this.appServices.sendIntentResponse("sign", {}, this.requestDapp.intentId);
    this.appServices.close();
  }
}
