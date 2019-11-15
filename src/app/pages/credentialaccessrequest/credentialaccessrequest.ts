import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

declare let appManger: any;

@Component({
  selector: 'page-credentialaccessrequest',
  templateUrl: 'credentialaccessrequest.html',
  styleUrls: ['credentialaccessrequest.scss']
})
export class CredentialAccessRequestPage {
  public requestingAppName: string = "";
  private intentId: Number;

  constructor(public navCtrl: NavController, private actRoute: ActivatedRoute, private router: Router) {
    this.actRoute.queryParams.subscribe(params => {
      this.requestingAppName = params.appName;
      this.intentId = params.intentId;
    });
  }

  acceptRequest() {
    console.log("Sending credaccess intent response for intent id "+this.intentId)
    appManger.sendIntentResponse("credaccess", {result:"success"}, this.intentId)
    appManger.close();
  }

  rejectRequest() {
    appManger.close();
  }
}
