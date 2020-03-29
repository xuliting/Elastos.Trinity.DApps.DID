import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { TranslateService } from '@ngx-translate/core';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-devpage',
  templateUrl: 'devpage.html',
  styleUrls: ['devpage.scss']
})
export class DevPage {
  public isfirst: boolean = true;

  constructor(private native: Native, private translate: TranslateService) {
  }

  ionViewWillEnter() {
    titleBarManager.setTitle('Internal Tests');
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
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
