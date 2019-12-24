import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, IonInput } from '@ionic/angular';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';
import { PopupProvider } from '../../services/popup';
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

  constructor(public navCtrl: NavController, private native: Native, private didService: DIDService, private authService: AuthService, private popupProvider: PopupProvider) {
  }

  onMnemonicSentenceChanged() {
    // Remove all values
    this.mnemonicWords.length = 0;

    //for test
    // this.mnemonicSentence = "income diesel latin coffee tourist kangaroo lumber great ill amazing say left";
    this.mnemonicSentence = this.mnemonicSentence.toLowerCase();

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

  async doImport() {
    if(this.checkParams()){
      // TODO import = create DID, restore from chain if possible, and activate in app
      await this.didService.addDidStore();
      await this.importDid();
    }
  }

  async importDid() {
    console.log('importDid');
    await this.native.showLoading('loading-msg').then(async () => {
      await this.didService.getActiveDidStore().createPrivateIdentity(this.password, this.native.getMnemonicLang(), this.mnemonicSentence);
      this.didService.getActiveDidStore().synchronize(this.password).then(async ()=>{
        console.log('synchronize success');
        this.native.hideLoading();
        //do loadDids
        if (null != this.didService.getActiveDidStore().getActiveDid()) {
          // Save password for later use
          this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), this.password);

          console.log("Redirecting user to his profile page");
          this.native.go("/home/myprofile", {create:false});
        }
        else {
          this.popupProvider.ionicAlert("Store is empty", "ooh, your DID store is empty...");
          //delete didStore?
        }
      })
      .catch( (e)=> {
        this.native.hideLoading();
        console.log('synchronize error:', e);
        this.popupProvider.ionicAlert("Store load error", "Sorry, we were unable to load your DID store... " + e);
        //delete didstore
      })
    });
}

  checkParams(){
    if(Util.isNull(this.password)){
      this.native.toast_trans('text-pay-password');
      return false;
    }

    return true;
  }
}
