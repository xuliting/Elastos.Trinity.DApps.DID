import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, IonInput } from '@ionic/angular';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'page-importdid',
  templateUrl: 'importdid.html',
  styleUrls: ['importdid.scss']
})
export class ImportDIDPage {
  public mnemonicWords = new Array<String>()
  public mnemonicSentence: string = "";
  private password: string = null;

  @ViewChild('addMnemonicWordInput', { static:false }) addMnemonicWordInput: IonInput;

  constructor(public navCtrl: NavController, private native: Native, private didService: DIDService, private authService: AuthService) {
  }

  onMnemonicSentenceChanged() {
    // Remove all values
    this.mnemonicWords.length = 0;

    // Rebuild words based on typed sentence
    this.mnemonicWords = this.mnemonicSentence.trim().split(" ");
  }

  allWordsFilled(): boolean {
    return this.mnemonicWords.length == 12;
  }

  async promptPassword() {
    this.password = await this.authService.promptNewPassword();
    if (this.checkParams()) {
      this.doImport();
    }
  }

  doImport() {
    if(this.checkParams()){
      // TODO import = create DID, restore from chain if possible, and activate in app
      this.native.go("/home/myprofile");
    }
  }

  checkParams(){
    if(Util.isNull(this.password)){
      this.native.toast_trans('text-pay-password');
      return false;
    }

    return true;
  }
}
