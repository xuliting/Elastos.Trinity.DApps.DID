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
    private mnemonicLanguage: DIDPlugin.MnemonicLanguage;
    public readonly = false; // set true if import mnemonic form wallet app

    // for keyboard
    private rootContent: any;
    private sentenceInput: any;
    private showHandle: any;
    private hideHandle: any;
    private scrollHeight: Number = -1;

    @ViewChild('addMnemonicWordInput', { static: false }) addMnemonicWordInput: IonInput;

    constructor(
        public router: Router,
        public zone: NgZone,
        public navCtrl: NavController,
        private modalCtrl: ModalController,
        private native: Native,
        private didService: DIDService,
        private authService: AuthService,
        private popupProvider: PopupProvider,
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

        this.getElements();

        window.addEventListener('native.keyboardshow', this.showHandle = (event: any)=> {
            if (this.scrollHeight == -1) {
                this.scrollHeight = this.calcScrollHeight(event.keyboardHeight);
            }
            if (this.scrollHeight != 0) {
                console.log('scrollHeight:', this.scrollHeight)
                this.rootContent.style.top = this.scrollHeight + 'px';
            }
        });
        window.addEventListener('native.keyboardhide', this.hideHandle = () =>{
            this.rootContent.style.top = '0px';
        });
    }

    ionViewWillLeave() {
        window.removeEventListener('native.keyboardshow', this.showHandle);
        window.removeEventListener('native.keyboardhide', this.hideHandle);
    }

    getElements() {
        this.rootContent = document.getElementById('rootcontent')
        this.sentenceInput = document.getElementById('sentenceInput')
    }

    calcScrollHeight(keyboardHeight) {
        let scrollHeight = this.rootContent.clientHeight - this.sentenceInput.offsetTop - this.sentenceInput.clientHeight - keyboardHeight;
        return scrollHeight > 0 ? 0 : scrollHeight;
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
        for (let i = 0; i < this.mnemonicSentence.length; i++) {
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
            this.popupProvider.ionicAlert('mnemonic-invalid', 'mnemonic-invalid-prompt');
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
            cssClass: "create-password-modal"
        });
        modal.onDidDismiss().then(async (params) => {
            console.log("params", params);

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
        didStore.synchronize(storePass).then(async () => {
            console.log('Synchronization success. Now loading DID store information');

            await didStore.loadAll(didStore.getId(), true);

            this.native.hideLoading();

            if (didStore.dids.length > 0) {
                console.log("Synchronized and loaded " + didStore.dids.length + " from chain");

                // Now that we could correctly retrieve DID data, we can active this new store. Not before.
                this.didService.activateDidStore(didStore.getId());

                // Save password for later use
                this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), storePass);

                // Last DID on the list as default DID ("last" because that's probably the most recently created)
                let didToActivate = didStore.dids[didStore.dids.length - 1];
                console.log("Activating the last DID in the list", didToActivate);
                await this.didService.activateDid(didStore.getId(), didToActivate.getDIDString());

                // Rebuild DID list UI entries based on imported DIDs (and their names)
                await this.didService.rebuildDidEntries();

                console.log("Redirecting user to his profile page");
                this.native.go("/home/myprofile", { create: false });
            }
            else {
                this.handleEmptyDIDDocumentResolved(didStore, storePass);
            }
        })
            .catch((e) => {
                this.native.hideLoading();
                console.log('synchronize error:', e);
                this.popupProvider.ionicAlert("Store load error", "Sorry, we were unable to load your DID store... " + e);
                // TODO: delete temporary didstore
            });
    }

    /**
     * Called when a mnemonic synchronization was successful but returned an empty document.
     * This could mean 2 things:
     * - Either the user typed a wrong passphrase (so the generated keypair is wrong)
     * - Or user never published anything with this mnemonic (In which case we ask him if he is ok to create a new empty profile).
     */
    async handleEmptyDIDDocumentResolved(didStore: DIDStore, storePass: string) {
        const modal = await this.modalCtrl.create({
            component: EmptyImportedDocumentComponent,
            componentProps: {
            },
            cssClass: "create-password-modal"
        });
        modal.onDidDismiss().then(async (params) => {
            if (params && params.data && params.data.action == EmptyImportedDocumentChoice.CreateNewProfile) {
                // User wants to use the provided mnemonic and create a first DID inside, let's do this
                await this.didService.activateDidStore(didStore.getId());

                // Save password for later use
                this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), storePass);

                this.native.go("/editprofile", { create: true });
            }
            else {
                // Do nothing - cancelled flow, user can go back or try again.
            }
        });
        modal.present();
    }

    getMnemonicLang(): DIDPlugin.MnemonicLanguage {
        let mnemonicSentenceTemp = this.mnemonicSentence.trim();
        if (Util.english(mnemonicSentenceTemp[0])) return DIDPlugin.MnemonicLanguage.ENGLISH;
        if (Util.chinese(mnemonicSentenceTemp[0])) return DIDPlugin.MnemonicLanguage.CHINESE_SIMPLIFIED;
        // TODO
        return this.native.getMnemonicLang();
    }
}
