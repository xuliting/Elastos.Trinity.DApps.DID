import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'page-noidentity',
  templateUrl: 'noidentity.html',
  styleUrls: ['noidentity.scss']
})
export class NoIdentityPage {
  constructor(public navCtrl: NavController) {
  }

  createIdentity() {
    this.navCtrl.navigateForward('/createidentity')
  }

  importIdentity() {
    this.navCtrl.navigateForward('/xxx')
  }
}
