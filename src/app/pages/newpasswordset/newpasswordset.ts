import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Native } from '../../services/native';

@Component({
  selector: 'page-newpasswordset',
  templateUrl: 'newpasswordset.html',
  styleUrls: ['newpasswordset.scss']
})
export class NewPasswordSetPage {
  constructor(public navCtrl: NavController, private native: Native) {}

  async createProfile() {
    await Config.didStoreManager.addDidStore();
    this.native.go('/editprofile', {create: true});
  }
}
