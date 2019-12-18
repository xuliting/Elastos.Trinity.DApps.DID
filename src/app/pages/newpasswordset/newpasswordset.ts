import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Native } from '../../services/native';
import { DIDService } from 'src/app/services/did.service';

@Component({
  selector: 'page-newpasswordset',
  templateUrl: 'newpasswordset.html',
  styleUrls: ['newpasswordset.scss']
})
export class NewPasswordSetPage {
  constructor(public navCtrl: NavController, private didService: DIDService, private native: Native) {}

  async createProfile() {
    this.native.go('/editprofile', {create: true});
  }
}
