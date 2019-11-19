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
  public mnemonicObj: any = { mnemonic: "", password: "", rePassword: ""};

  @ViewChild('addMnemonicWordInput', { static:false }) addMnemonicWordInput: IonInput;

  constructor(public navCtrl: NavController, private native: Native, private didService: DIDService) {
  }

  async appendMnemonicWord() {
    // TODO: make sure that the typed word contains no space, not empty, etc.

    this.mnemonicWords.push(this.mnemonicWord);
    this.mnemonicWord = "";
    console.log(this.mnemonicWords)

    let input = await this.addMnemonicWordInput.getInputElement();
    input.focus();
  }

  doImport() {
    if(this.checkParms()){
      //TODO import
      this.native.go("/myprofile");
    }
  }

  checkParms(){
    //TODO
    //check menmonic

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
