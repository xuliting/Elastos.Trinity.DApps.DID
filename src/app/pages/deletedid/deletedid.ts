import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { ShowQRCodeComponent } from 'src/app/components/showqrcode/showqrcode.component';
import { Profile } from '../../model/profile.model';
import { DIDDocument } from 'src/app/model/diddocument.model';
import { DIDURL } from 'src/app/model/didurl.model';
import { DIDPublicationStatusEvent } from 'src/app/model/eventtypes.model';
import { DIDHelper } from '../../helpers/did.helper';
import { UXService } from '../../services/ux.service';
import { Native } from '../../services/native';
import { DIDService } from 'src/app/services/did.service';
import { AuthService } from 'src/app/services/auth.service';
import { DIDSyncService } from 'src/app/services/didsync.service';
import { Config } from 'src/app/services/config';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'page-deletedid',
  templateUrl: 'deletedid.html',
  styleUrls: ['deletedid.scss']
})
export class DeleteDIDPage {
  public didString: string = "";
  public profile: Profile;

  constructor(public events: Events,
              public route:ActivatedRoute,
              public zone: NgZone,
              private advancedPopup: AdvancedPopupController,
              private authService: AuthService,
              private translate: TranslateService,
              private didService: DIDService,
              private didSyncService: DIDSyncService,
              private appService: UXService,
              private modalCtrl: ModalController,
              private uxService: UXService,
              private native: Native) {
    this.init();
  }

  init() {
    this.profile = this.didService.getActiveDid().getBasicProfile();
    this.didString = this.didService.getActiveDid().getDIDString();
  }

  ionViewWillEnter() {
    this.uxService.makeAppVisible();

    titleBarManager.setTitle(this.translate.instant('delete-did'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
  }

  /**
   * Permanently delete the DID after user confirmation.
   */
  deleteDID() {
    this.advancedPopup.create({
      color:'#FF4D4D',
      info: {
          picture: '/assets/images/Local_Data_Delete_Icon.svg',
          title: this.translate.instant("deletion-popup-warning"),
          content: this.translate.instant("deletion-popup-content")
      },
      prompt: {
          title: this.translate.instant("deletion-popup-confirm-question"),
          confirmAction: this.translate.instant("confirm"),
          cancelAction: this.translate.instant("go-back"),
          confirmCallback: async ()=>{
            console.log("Deletion confirmed by user");
            let activeDid = this.didService.getActiveDid();
            await this.didService.deleteDid(activeDid);

            // DID has been deleted. Now go back to the callin app (normally, DID session)
            console.log("Identity has been deleted. Sending intent response");
              this.uxService.sendIntentResponse("deletedid", {
                  didString: this.didString
              }, Config.requestDapp.intentId);

              // Close the app, operation completed.
              this.uxService.close();
          }
      }
    }).show();
  }
}
