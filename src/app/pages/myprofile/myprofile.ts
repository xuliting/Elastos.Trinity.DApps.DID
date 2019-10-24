import { Component } from '@angular/core';
import { NavController, PopoverController} from '@ionic/angular';
import { DrawerState } from 'ion-bottom-drawer';
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
  constructor(public navCtrl: NavController, public popoverController: PopoverController) {
  }

  didSettings() {
    this.closePopup();
    this.navCtrl.navigateForward("/didsettings");
  }
  
  showCredentials() {
    // TODO
    this.closePopup();
  }

  editProfile() {
    this.closePopup();
    this.navCtrl.navigateForward("/editprofile")
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
  public didString: string = "did:ela:azeeza786zea67zaek221fxi9"

  constructor(public navCtrl: NavController, 
    public popoverController: PopoverController, 
    private didService: DIDService) {
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
    // TODO - copy to clipboard
    // TODO - Show a toast message "Copied to clipboard!"
  }
}
