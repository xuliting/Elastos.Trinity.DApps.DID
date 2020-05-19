import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

import { BasicCredentialInfo } from 'src/app/model/basiccredentialinfo.model';
import { BasicCredentialsService } from 'src/app/services/basiccredentials.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'page-profileentrypicker',
  templateUrl: 'profileentrypicker.html',
  styleUrls: ['profileentrypicker.scss']
})
export class ProfileEntryPickerPage {
  availableItems: BasicCredentialInfo[];

  constructor(
    private basicCredentialService: BasicCredentialsService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    public theme: ThemeService
  ) {
    // List of keys we don't want to show (probably already existing in the profile)
    let filterOutKeys: string[] = navParams.get("filterOut");

    this.availableItems = this.basicCredentialService.getBasicCredentialInfoList().filter((item)=>{
      return !filterOutKeys.includes(item.key);
    });
  }

  selectItem(item: BasicCredentialInfo) {
    console.log("Picker profile info entry:", item);
    this.modalCtrl.dismiss({
      pickedItem: item
    })
  }

  close() {
    this.modalCtrl.dismiss(null);
  }
}
