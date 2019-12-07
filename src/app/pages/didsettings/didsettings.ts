import { Component, NgZone } from '@angular/core';
import { Events, ModalController, NavController } from '@ionic/angular';
import { DIDService } from '../../services/did.service';
import { SecurityCheckComponent } from '../../components/securitycheck/securitycheck.component';
import { Profile } from 'src/app/model/profile.model';
import { Config } from 'src/app/services/config';
import { Native } from 'src/app/services/native';

@Component({
  selector: 'page-didsettings',
  templateUrl: 'didsettings.html',
  styleUrls: ['didsettings.scss']
})
export class DIDSettingsPage {
  public activeProfile: Profile = null;
  
  constructor(
        private native: Native,
        public navCtrl: NavController, 
        public modalCtrl: ModalController, 
        private didService: DIDService,
        public event: Events,
        public zone: NgZone) {
  }

  ngOnInit() {
    this.init();
    this.event.subscribe('did:didstorechanged', ()=> {
      this.zone.run(() => {
        this.refreshActiveProfile();
      });
    });
  }

  ngOnDestroy() {
    this.event.unsubscribe('did:didstorechanged');
  }

  async init() {
    this.refreshActiveProfile();
  }

  refreshActiveProfile() {
    this.activeProfile = Config.didStoreManager.getActiveDidStore().getBasicProfile();
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

  viewActiveProfile() {
    this.native.setRootRouter("/home/myprofile", {create: false});
  }
}
