import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, IonInput } from '@ionic/angular';

import { Native } from '../../services/native';

export enum ImportDIDSource {
    ImportFromMnemonic,
    ImportFromWalletApp
};

@Component({
  selector: 'importdidsource',
  templateUrl: './importdidsource.component.html',
  styleUrls: ['./importdidsource.component.scss'],
})
export class ImportDIDSourceComponent implements OnInit {
  constructor(public modalCtrl: ModalController, 
              public native: Native) { 
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
  }

  public importFromMnemonic() {
    this.submit(ImportDIDSource.ImportFromMnemonic);
  }

  public importFromWalletApp() {
    this.submit(ImportDIDSource.ImportFromWalletApp);
  }

  submit(source: ImportDIDSource) {
    this.modalCtrl.dismiss({
      source: source
    });
  }
}
