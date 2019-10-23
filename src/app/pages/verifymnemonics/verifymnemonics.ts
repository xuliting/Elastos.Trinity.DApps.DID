import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';

@Component({
  selector: 'page-verifymnemonics',
  templateUrl: 'verifymnemonics.html',
  styleUrls: ['verifymnemonics.scss']
})
export class VerifyMnemonicsPage {    
  constructor(public navCtrl: NavController, private didService: DIDService) {
  }

  backPressed() {
    this.navCtrl.navigateBack("/backupdid");
  }

  nextClicked() {
  }

  /**
   * True when words provided by user are all right.
   */
  allWordsMatch() {
    return true; // TMP
  }
}
