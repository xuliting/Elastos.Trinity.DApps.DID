import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopoverController} from '@ionic/angular';
import { DrawerState } from 'ion-bottom-drawer';


import { Config } from '../../services/config';
import { Profile } from '../../services/profile.model';
import { Native } from '../../services/native';
import { DIDService } from '../../services/did.service';

@Component({
  template: `
    <ion-list>
      <ion-item (click)="didSettings()" class="ion-activatable">
        DID Settings
        <ion-ripple-effect></ion-ripple-effect>
      </ion-item>
      <ion-item (click)="showCredentials()" class="ion-activatable">
        Credentials list
        <ion-ripple-effect></ion-ripple-effect>
      </ion-item>
      <ion-item (click)="editProfile()" class="ion-activatable">
        Edit profile
        <ion-ripple-effect></ion-ripple-effect>
      </ion-item>
      <ion-item (click)="configureVisibility()" class="ion-activatable">
        Configure visibility
        <ion-ripple-effect></ion-ripple-effect>
      </ion-item>
    </ion-list>
  `
})
export class MyProfilePageMenu {
  constructor(public popoverController: PopoverController,
              private native: Native)
  {}

  didSettings() {
    this.closePopup();
    this.native.go("/didsettings");
  }

  showCredentials() {
    // TODO
    this.closePopup();
    this.native.go("/credentiallist");
  }

  editProfile() {
    this.closePopup();
    this.native.go("/editprofile", {create: false})
  }

  configureVisibility() {
    // TODO
    this.closePopup();
  }

  async closePopup() {
    await this.popoverController.dismiss();
  }
}

@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
  styleUrls: ['myprofile.scss']
})
export class MyProfilePage {
  public creatingIdentity: boolean = false;
  public bottomDrawerState: DrawerState = DrawerState.Bottom;
  public didString: String = "";
  public profile: Profile = {
    name:"",
    birthday:"",
    gender:"",
    area:"",
    email:"",
    IM:"",
    phone:"",
    ELAAddress:"",
  };

  public createDid = false;

  constructor(public route: ActivatedRoute,
              public popoverController: PopoverController,
              private native: Native,
              private didService: DIDService) {
    this.route.queryParams.subscribe((data) => {
        if (data['create'] == 'true') this.createDid = true;
        else this.createDid = false;
    });
    this.init();
  }

  init() {
    this.profile = Config.didStoreManager.getProfile();
    console.log("MyProfilePage :" + JSON.stringify(this.profile));
  }

  ionViewDidEnter() {
    this.didString = this.didService.getCurrentDidString();
  }

  async menuClicked(event) {
    const popover = await this.popoverController.create({
      component: MyProfilePageMenu,
      event: event
    });
    return await popover.present();
  }

  /**
   * Shows a pop-under with a large qr code and DID string.
   */
  async showQRCode() {
    this.bottomDrawerState = DrawerState.Docked;
  }

  hideBottomDrawer() {
    this.bottomDrawerState = DrawerState.Bottom;
  }

  copyDIDToClipboard() {
    this.native.copyClipboard(this.didString);
    this.native.toast_trans('copy-ok');
  }

  next() {
    this.native.go("/backupdid");
  }
}
