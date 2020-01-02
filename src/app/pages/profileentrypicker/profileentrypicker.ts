import { Component } from '@angular/core';
import { Events, ModalController, NavParams } from '@ionic/angular';

import { Native } from '../../services/native';
import { area } from '../../../assets/area/area';
import { BasicCredentialInfo } from 'src/app/model/basiccredentialinfo.model';
import { DIDService } from 'src/app/services/did.service';
import { BasicCredentialsService } from 'src/app/services/basiccredentials.service';

@Component({
  selector: 'page-profileentrypicker',
  templateUrl: 'profileentrypicker.html',
  styleUrls: ['profileentrypicker.scss']
})
export class ProfileEntryPickerPage {
  availableItems: BasicCredentialInfo[];

  constructor(private basicCredentialService: BasicCredentialsService, private modalCtrl: ModalController, private navParams: NavParams) {
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
}
