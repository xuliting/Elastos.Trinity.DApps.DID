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
  //public mnemonicSentence: string = "income diesel latin coffee tourist kangaroo lumber great ill amazing say left"; // TMP TESTNET
  private password: string = null;
  private mnemonicLanguage : DIDPlugin.MnemonicLanguage;

  @ViewChild('addMnemonicWordInput', { static:false }) addMnemonicWordInput: IonInput;

  constructor(public navCtrl: NavController, private native: Native, private didService: DIDService, private authService: AuthService, private popupProvider: PopupProvider) {
  }

  onMnemonicSentenceChanged() {
    // Remove all values
    this.mnemonicWords.length = 0;

    this.mnemonicSentence = this.mnemonicSentence.toLowerCase();

    // Rebuild words based on typed sentence
    this.mnemonicWords = this.mnemonicSentence.trim().split(" ");
  }

  allWordsFilled(): boolean {
    return this.mnemonicWords.length == 12;
  }

  async promptPassword() {
    this.mnemonicLanguage = this.getMnemonicLang();
    let mnemonicValid = await this.didService.isMnemonicValid(this.mnemonicLanguage, this.mnemonicSentence);
    if (!mnemonicValid) {
      this.popupProvider.ionicAlert("Mnemonic inValid", "Pls check the mnemonic... ");
      return;
    }
    let passwordProvided = await this.authService.promptPasswordInContext(null, false);
    if (passwordProvided) {
      this.password = this.authService.getCurrentUserPassword();
      this.doImport();
    }
  }

  async doImport() {
    await this.didService.addDidStore();
    await this.importDid();
  }

  async importDid() {
    console.log('Importing DIDs');

    await this.native.showLoading('loading-msg');
    await this.didService.getActiveDidStore().createPrivateIdentity(this.password, this.mnemonicLanguage, this.mnemonicSentence);

    console.log("Synchronizing on chain DID info with local device");
    this.didService.getActiveDidStore().synchronize(this.password).then(async ()=>{
      console.log('Synchronization success. Now loading DID store information');

      let didStore = this.didService.getActiveDidStore();
      await didStore.loadAll(didStore.getId());

      this.native.hideLoading();

      console.log("Checking active DID")

      if (didStore.dids.length > 0) {
        // Save password for later use
        this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), this.password);

        // Last DID on the list as default DID ("last" because that's probably the most recently created)
        let didToActivate = didStore.dids[didStore.dids.length-1];
        console.log("Activating the last DID in the list", didToActivate);
        await this.didService.activateDid(didStore.getId(), didToActivate.getDIDString());

        // Rebuild DID list UI entries based on imported DIDs (and their names)
        await this.didService.rebuildDidEntries();

        console.log("Redirecting user to his profile page");
        this.native.go("/home/myprofile", {create:false});
      }
      else {
        this.popupProvider.ionicAlert("Store is empty", "Sorry, we could import your identity from your mnemonic but we couldn't find any related DID on the DID sidechain. Make sure you previously published your DIDs, and typed the original password.");
        //delete didStore?
      }
    })
    .catch( (e)=> {
      this.native.hideLoading();
      console.log('synchronize error:', e);
      this.popupProvider.ionicAlert("Store load error", "Sorry, we were unable to load your DID store... " + e);
      //delete didstore
    });
  }

  getMnemonicLang(): DIDPlugin.MnemonicLanguage {
    if (Util.english(this.mnemonicWords[0])) return DIDPlugin.MnemonicLanguage.ENGLISH;
    if (Util.chinese(this.mnemonicWords[0])) return DIDPlugin.MnemonicLanguage.CHINESE_SIMPLIFIED;
    // TODO
    return this.native.getMnemonicLang();
  }
}
