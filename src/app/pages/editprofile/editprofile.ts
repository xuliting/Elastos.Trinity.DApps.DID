import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['editprofile.scss']
})
export class EditProfilePage {
  public creatingIdentity: boolean = false;

  constructor(public navCtrl: NavController, private didService: DIDService) {
  }

  async createIdentity() {
    this.creatingIdentity = true;
    await this.didService.createIdentity();

  }
}
