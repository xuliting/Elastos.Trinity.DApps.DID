import { Component } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { DIDService } from '../../services/did.service';
import { SecurityCheckComponent } from '../../components/securitycheck/securitycheck.component';


@Component({
  selector: 'page-didsettings',
  templateUrl: 'didsettings.html',
  styleUrls: ['didsettings.scss']
})
export class DIDSettingsPage {
  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private didService: DIDService) {
  }

  managePassword() {
    // TODO
    this.openPayModal();
  }

  exportDID() {
    // TODO
  }

  deleteDID() {
    // TODO
  }

  async openPayModal() {
    const modal = await this.modalCtrl.create({
        component: SecurityCheckComponent,
        componentProps: null
    });
    modal.onDidDismiss().then((params) => {
        if (params.data) {
          // console.log(params.data);
        }
    });
    return modal.present();
  }
}
