import { Component, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, IonInput, ModalController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';
import { Native } from '../../services/native';
import { PopupProvider } from '../../services/popup';
import { Util } from '../../services/util';
import { AuthService } from 'src/app/services/auth.service';
import { DIDStore } from 'src/app/model/didstore.model';
import { MnemonicPassCheckComponent } from 'src/app/components/mnemonicpasscheck/mnemonicpasscheck.component';
import { EmptyImportedDocumentComponent, EmptyImportedDocumentChoice } from 'src/app/components/emptyimporteddocument/emptyimporteddocument.component';
import { TranslateService } from '@ngx-translate/core';
import { UXService } from 'src/app/services/ux.service';
import { Config } from 'src/app/services/config';
import { DIDURL } from 'src/app/model/didurl.model';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

/**
 * Import algorithm:
 * - We can import from mnemonic (chain) or get mnemonic from wallet app (intent)
 * - We try to resolve on chain with optional mnemonic passphrase
 * - If resolve fails (ex: network error) -> error popup -> end
 * - if resolve succeeds with did document returned -> import
 * - if resolve succeeds with no data -> as user to try to input passphrase again, or to create a profile anyway (will overwrite)
 */
@Component({
  selector: 'page-importdid',
  templateUrl: 'importdid.html',
  styleUrls: ['importdid.scss']
})
export class ImportDIDPage {
  public mnemonicWords = new Array<String>()
  public mnemonicSentence: string = "";
//   public mnemonicSentence: string = "income diesel latin coffee tourist kangaroo lumber great ill amazing say left"; // TMP TESTNET
  private mnemonicLanguage : DIDPlugin.MnemonicLanguage;
  public readonly = false; // set true if import mnemonic form wallet app

  @ViewChild('addMnemonicWordInput', { static:false }) addMnemonicWordInput: IonInput;

  constructor(
    public router: Router,
    public zone: NgZone,
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private native: Native,
    private didService: DIDService,
    private authService: AuthService,
    private popupProvider: PopupProvider,
    private uxService:UXService,
    private translate: TranslateService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (!Util.isEmptyObject(navigation.extras.state)) {
        if (!Util.isEmptyObject(navigation.extras.state.mnemonic)) {
            this.zone.run(() => {
                this.mnemonicSentence = navigation.extras.state.mnemonic;
                this.onMnemonicSentenceChanged();
                this.readonly = true;
            });
        }
      }
  }

  ionViewWillEnter() {
    titleBarManager.setTitle(this.translate.instant('import-my-did'));
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.BACK);
  }

  onMnemonicSentenceChanged() {
    // Remove all values
    this.mnemonicWords.length = 0;

    this.mnemonicSentence = this.mnemonicSentence.toLowerCase();

    this.mnemonicLanguage = this.getMnemonicLang();
    // Rebuild words based on typed sentence
    if (this.mnemonicLanguage === DIDPlugin.MnemonicLanguage.CHINESE_SIMPLIFIED) {
        this.getMnemonicWordsFromChinese();
    }
    else {
        this.mnemonicWords = this.mnemonicSentence.trim().split(" ");
        this.mnemonicWords = this.mnemonicWords.filter(item => item !== '');
    }

    // only one space between word
    this.mnemonicSentence = this.mnemonicWords.join(' ');
  }

  getMnemonicWordsFromChinese() {
    this.mnemonicSentence = this.mnemonicSentence.trim().replace(/ /g, '');
    for (let i =0;i < this.mnemonicSentence.length; i++) {
        this.mnemonicWords.push(this.mnemonicSentence[i]);
    }
  }

  allWordsFilled(): boolean {
    return this.mnemonicWords.length == 12;
  }

  async promptStorePassword() {
    // First make sure that the provided mnemonic format is valid locally.
    this.mnemonicLanguage = this.getMnemonicLang();
    let mnemonicValid = await this.didService.isMnemonicValid(this.mnemonicLanguage, this.mnemonicSentence);
    if (!mnemonicValid) {
      this.popupProvider.ionicAlert("Mnemonic inValid", "Pls check the mnemonic... ");
      return;
    }

    // Ask user for a new store password.
    let storePassword = await this.authService.promptNewPassword();
    if (storePassword) {
      this.authService.saveCurrentUserPassword(null, storePassword);
      this.promptPassPhrase();
    }
    else {
      // Cancelled action
    }
  }

  // Ask for mnemonic passphrase, if any
  async promptPassPhrase() {
    const modal = await this.modalCtrl.create({
      component: MnemonicPassCheckComponent,
      componentProps: {
      },
      cssClass:"create-password-modal"
    });
    modal.onDidDismiss().then(async (params) => {
        console.log("params",params);

        if (params && params.data) {
          this.authService.saveMnemonicPassphrase(params.data.password)
          this.doImport();
        }
        else {
          // Cancelled action

          // Clear previous passphrase if any
          this.authService.saveMnemonicPassphrase("");
        }
    });
    modal.present();
  }

  private async doImport() {
      let didStore = await this.didService.newDidStore();
      this.importDid(didStore);
  }

  private async importDid(didStore: DIDStore) {
    console.log('Importing DIDs');

    let storePass = this.authService.getCurrentUserPassword();
    let passPhrase = this.authService.getMnemonicPassphrase();

    await this.native.showLoading('loading-msg');
    await didStore.createPrivateIdentity(passPhrase, storePass, this.mnemonicLanguage, this.mnemonicSentence);

    console.log("Synchronizing on chain DID info with local device");
    didStore.synchronize(storePass).then(async ()=>{
      console.log('Synchronization success. Now loading DID store information');

      await didStore.loadAll(didStore.getId(), true);

      this.native.hideLoading();

      console.log("Synchronized and loaded "+didStore.dids.length+" from chain");

      // Now that we could correctly retrieve DID data, we can active this new store. Not before.
      await this.didService.activateDidStore(didStore.getId());

      // Rebuild DID list UI entries based on imported DIDs (and their names)
      await this.didService.rebuildDidEntries();

      // Build response object, including the create store ID and a list of did string / suggest name
      let response = {
        didStoreId: this.didService.getActiveDidStore().getId(),
        dids: []
      };

      for (let did of didStore.dids) {
        let suggestedIdentityProfileName = null;
        let nameCredential = did.getCredentialById(new DIDURL("#name"));
        if (nameCredential) {
            suggestedIdentityProfileName = nameCredential.pluginVerifiableCredential.getSubject()["name"];
        }
        
        response.dids.push({
          didString: did.getDIDString(),
          name: suggestedIdentityProfileName
        });
      }

      console.log("Mnemonic import completed. Sending indent response");
      this.uxService.sendIntentResponse("importmnemonic", response, Config.requestDapp.intentId);

      // Close the app, operation completed.
      this.uxService.close();
    })
    .catch( (e)=> {
      this.native.hideLoading();
      console.log('synchronize error:', e);
      this.popupProvider.ionicAlert("Store load error", "Sorry, we were unable to load your DID store... " + e);
      // TODO: delete temporary didstore
    });
  }

  getMnemonicLang(): DIDPlugin.MnemonicLanguage {
    let mnemonicSentenceTemp = this.mnemonicSentence.trim();
    if (Util.english(mnemonicSentenceTemp[0])) return DIDPlugin.MnemonicLanguage.ENGLISH;
    if (Util.chinese(mnemonicSentenceTemp[0])) return DIDPlugin.MnemonicLanguage.CHINESE_SIMPLIFIED;
    // TODO
    return this.native.getMnemonicLang();
  }
}
