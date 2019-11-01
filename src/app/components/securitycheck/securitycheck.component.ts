import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Native } from '../../services/native';

@Component({
  selector: 'securitycheck',
  templateUrl: './securitycheck.component.html',
  styleUrls: ['./securitycheck.component.scss'],
})
export class SecurityCheckComponent implements OnInit {
  public password: string = "";

  constructor(public modalCtrl: ModalController, public native: Native) { }

  ngOnInit() { }

  close() {
    this.modalCtrl.dismiss(null);
  }

  check() {
    // if (!this.walltype) {
    //     this.modalCtrl.dismiss(this.transfer);
    //     return;
    // }
    // if (this.transfer.payPassword) {
    //     this.modalCtrl.dismiss(this.transfer.payPassword);
    // } else {
    //     this.native.toast_trans('text-pwd-validator');
    // }
  }
}
