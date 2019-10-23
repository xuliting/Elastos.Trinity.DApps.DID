import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';

@Component({
  selector: 'page-backupdid',
  templateUrl: 'backupdid.html',
  styleUrls: ['backupdid.scss']
})
export class BackupDIDPage {  
  constructor(public navCtrl: NavController, private didService: DIDService) {
  }

  nextClicked() {
    // Next button pressed: go to mnemonic verification screen.
    this.navCtrl.navigateForward("/verifymnemonics");
  }
}
