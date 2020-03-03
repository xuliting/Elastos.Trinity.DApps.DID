import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, IonInput } from '@ionic/angular';

import { Native } from '../../services/native';

export enum DisableBiometricPromptChoice {
  KeepUsingBiometricAuth,
  SwitchBackToPasswordAuth
}

@Component({
  selector: 'disablebiometricprompt',
  templateUrl: './disablebiometricprompt.component.html',
  styleUrls: ['./disablebiometricprompt.component.scss'],
})
export class DisableBiometricPromptComponent implements OnInit {
  constructor(public modalCtrl: ModalController, 
              public native: Native) { 
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
  }

  useBiometricAuth() {
    this.submit(DisableBiometricPromptChoice.KeepUsingBiometricAuth);
  }

  usePasswordAuth() {
    this.submit(DisableBiometricPromptChoice.SwitchBackToPasswordAuth);
  }

  submit(action: DisableBiometricPromptChoice) {
    this.modalCtrl.dismiss({
      action: action
    });
  }
}
