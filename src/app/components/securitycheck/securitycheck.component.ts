import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, IonInput } from '@ionic/angular';

import { Native } from '../../services/native';

@Component({
  selector: 'securitycheck',
  templateUrl: './securitycheck.component.html',
  styleUrls: ['./securitycheck.component.scss'],
})
export class SecurityCheckComponent implements OnInit {
  @ViewChild('pwd',{static:false}) pwd: IonInput;

  public password: string = "";
  public previousPasswordWasWrong: boolean = false;

  constructor(public modalCtrl: ModalController, 
              public native: Native) { 
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.pwd.setFocus();
  }

  close() {
    this.modalCtrl.dismiss(null);
  }

  submit() {
    this.modalCtrl.dismiss({
      password: this.password
    });

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
