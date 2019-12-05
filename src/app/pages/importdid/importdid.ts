import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, IonInput } from '@ionic/angular';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';
import { Util } from '../../services/util';

@Component({
  selector: 'page-importdid',
  templateUrl: 'importdid.html',
  styleUrls: ['importdid.scss']
})
export class ImportDIDPage {
  public mnemonicWord: string = "";
  public mnemonicWords = new Array<String>()
  public mnemonicSentence: string = "";
  public mnemonicObj: any = { mnemonic: "", password: "", rePassword: ""};

  @ViewChild('addMnemonicWordInput', { static:false }) addMnemonicWordInput: IonInput;

  constructor(public navCtrl: NavController, private native: Native, private didService: DIDService) {
  }

  onMnemonicSentenceChanged() {
    // Remove all values
    this.mnemonicWords.length = 0;

    // Rebuild words based on typed sentence
    this.mnemonicWords = this.mnemonicSentence.trim().split(" ");
  }

  doImport() {
    if(this.checkParams()){
      // TODO import
      this.native.go("/profile/myprofile");
    }
  }

  checkParams(){
    if(Util.isNull(this.mnemonicObj.password)){
      this.native.toast_trans('text-pay-password');
      return false;
    }

    if(this.mnemonicObj.password!=this.mnemonicObj.rePassword){
      this.native.toast_trans('text-passworld-compare');
      return false;
    }
    return true;
  }
}
