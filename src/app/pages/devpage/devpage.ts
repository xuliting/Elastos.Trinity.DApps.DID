import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Native } from '../../services/native';
import { Util } from '../../services/util';

declare let appManager: AppManagerPlugin.AppManager;

@Component({
  selector: 'page-devpage',
  templateUrl: 'devpage.html',
  styleUrls: ['devpage.scss']
})
export class DevPage {
  public isfirst: boolean = true;

  constructor(private native: Native) {
  }

  registerAppProfileIntent() {
    console.log("Sending registerapplicationprofile intent");

    let params = {
      identifier: "mytestappprofile",
      connectactiontitle: "Test title",
      customcredentialtypes: ["TestAppApplicationProfileCredential"],
      sharedclaim1: "not sure what goes here yet",
      unsharedcustomdata1: "not sure either"
    }

    appManager.sendIntent("registerapplicationprofile", params, {}, ()=>{
      console.log("registerAppProfileIntent intent success");
    }, (err)=>{
      console.error("registerAppProfileIntent intent ERROR");
      console.log(err);
    })
  }
}
