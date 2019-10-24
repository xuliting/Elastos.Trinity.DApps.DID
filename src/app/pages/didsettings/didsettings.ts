import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DIDService } from '../../services/did.service';

@Component({
  selector: 'page-didsettings',
  templateUrl: 'didsettings.html',
  styleUrls: ['didsettings.scss']
})
export class DIDSettingsPage {
  constructor(public navCtrl: NavController, 
    private didService: DIDService) {
  }

  managePassword() {
    // TODO
  }

  exportDID() {
    // TODO
  }

  deleteDID() {
    // TODO
  } 
}
