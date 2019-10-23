import { Component } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';

@Component({
  template: `
    <ion-list>
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

  constructor(public navCtrl: NavController, public popoverController: PopoverController, private didService: DIDService) {
  }

  async menuClicked(event) {
    const popover = await this.popoverController.create({
      component: MyProfilePageMenu,
      event: event
    });
    return await popover.present();
  }
}
