import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, IonInput } from '@ionic/angular';

import { Native } from '../../services/native';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'showqrcode',
  templateUrl: './showqrcode.component.html',
  styleUrls: ['./showqrcode.component.scss'],
})
export class ShowQRCodeComponent implements OnInit {
  public didString: string = "";
  public qrCodeString: string = "";

  constructor(
    public modalCtrl: ModalController,
    public native: Native,
    private navParams: NavParams,
    public theme: ThemeService
  ) {
    this.didString = navParams.get("didstring");
    this.qrCodeString = navParams.get("qrcodestring");
  }

  ngOnInit() {
  }

  hideModal() {
    this.modalCtrl.dismiss(null);
  }

  copyDIDToClipboard() {
    this.native.copyClipboard(this.didString);
    this.native.toast_trans('copied-to-clipboard');
  }
}
