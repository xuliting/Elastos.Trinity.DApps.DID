import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DrawerState } from 'ion-bottom-drawer';

import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { NewDID } from 'src/app/model/newdid.model';
import { AuthService } from 'src/app/services/auth.service';
import { DIDService } from 'src/app/services/did.service';
import { Native } from 'src/app/services/native';
import { Styling } from 'src/app/services/styling';
import { Util } from 'src/app/services/util';
import { ModalController, IonSlides, Platform } from '@ionic/angular';
import { ImportDIDSourceComponent, ImportDIDSource } from 'src/app/components/importdidsource/importdidsource.component';
import { MnemonicPassCheckComponent } from 'src/app/components/mnemonicpasscheck/mnemonicpasscheck.component';
import { UXService, DIDCreationMode } from 'src/app/services/ux.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
    selector: 'page-noidentity',
    templateUrl: 'noidentity.html',
    styleUrls: ['noidentity.scss']
})
export class NoIdentityPage {

    @ViewChild(IonSlides, {static:false}) private slide: IonSlides;

    hidden = true;
    // slider
    slideOpts = {
        initialSlide: 0,
        speed: 400,
        init:false
    };

    public isfirst: boolean = true;
    public styling = Styling;
    public passwordSheetState = DrawerState.Bottom;
    public passwordSheetMinHeight = 0;
    public passwordSheetDockedHeight = 350;
    public password: string = "";
    public passwordConfirmation: string = "";

    constructor(public router: Router,
                private platform: Platform,
                private modalCtrl: ModalController,
                private advancedPopup: AdvancedPopupController,
                private authService: AuthService,
                private didService: DIDService,
                private native: Native,
                private uxService: UXService,
                private translate: TranslateService) {
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            this.isfirst = false;
        }
    }

    ionViewWillEnter() {
        this.uxService.makeAppVisible();
        titleBarManager.setTitle('Identity');
        if(this.isfirst) {
          titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.HOME);
        } else {
            this.uxService.setTitleBarBackKeyShown(true);
        }
    }

    ionViewDidEnter() {
        // Dirty hack because on iOS we are currently unable to understand why the
        // ion-slides width is sometimes wrong when an app starts. Waiting a few
        // seconds (DOM fully rendered once...?) seems to solve this problem.
        if (this.platform.platforms().indexOf('ios') >= 0) {
            setTimeout(()=>{
                this.showSlider();
            }, 3000)
        }
        else {
            this.showSlider();
        }
    }

    showSlider() {
        this.hidden = false
        this.slide.getSwiper().then((swiper)=>{
            swiper.init();
        });
    }

 /*    async createIdentity() {
        this.didService.didBeingCreated = new NewDID();

        if (this.uxService.onGoingDidCreationMode == DIDCreationMode.NEW_DID_TO_NEW_STORE) {
            // Need to create a new DID store with a password
            this.password = await this.authService.promptNewPassword();
            if (this.password != null) {
                this.didService.didBeingCreated.password = this.password;
                await this.didService.addDidStore();
                this.native.go('/newpasswordset');
            }
        }
        else if (this.uxService.onGoingDidCreationMode == DIDCreationMode.IMPORT_MNEMONIC) {
            // TODO: CHECK THIS
            this.native.go('/importdid');
        }

        // If there is an already active DID store, we don't need to create a new password to
        // create a new DID Store. We will only prompt user password for the existing DID store later
        // in the UI flow.
        /* TODO if (this.didService.getActiveDidStore() != null) {
            this.native.go('/editprofile');
        }
        else {
            // Need to create a new DID store with a password
            this.password = await this.authService.promptNewPassword();
            if (this.password != null) {
                this.didService.didBeingCreated.password = this.password;
                await this.didService.addDidStore();
                this.native.go('/newpasswordset');
            }
        }
    } */

  async createIdentity() {
    this.router.navigate(["/newpassword"]);
  }


    /**
     * Ask user which way he wants to use to import his DID
     */
    async promptImportLocation() {
        this.didService.didBeingCreated = new NewDID();

        const modal = await this.modalCtrl.create({
            component: ImportDIDSourceComponent,
            componentProps: {
            },
            cssClass: "security-check-modal"
        });
        modal.onDidDismiss().then((params) => {
            console.log("params", params);

            if (params && params.data) {
                switch (params.data.source) {
                    case ImportDIDSource.ImportFromMnemonic:
                        this.importFromMnemonic('');
                        break;
                    case ImportDIDSource.ImportFromWalletApp:
                        this.importFromWalletApp();
                        break;
                }
            }
        });
        modal.present();
    }

    importFromMnemonic(mnemonic: string) {
        console.log('importIdentity');
        if (this.didService.getActiveDidStore() == null) {
            this.native.go('/importdid', { mnemonic });
        } else {
            this.advancedPopup.create({
                color: '#FF4D4D',
                info: {
                    picture: '/assets/images/Local_Data_Delete_Icon.svg',
                    title: this.translate.instant("deletion-popup-warning"),
                    content: this.translate.instant("import-did-popup-content")
                },
                prompt: {
                    title: this.translate.instant("import-did-popup-confirm-question"),
                    confirmAction: this.translate.instant("confirm"),
                    cancelAction: this.translate.instant("go-back"),
                    confirmCallback: async () => {
                        this.native.go('/importdid', { mnemonic });
                    }
                }
            }).show();
        }
    }

    importFromWalletApp() {
        console.log("send intent to wallet app to get mnemonic");

        // Ask the wallet app to return wallet mnemonics
        appManager.sendIntent("elawalletmnemonicaccess", {}, {}, (response) => {
            console.log("Got mnemonic from the wallet app");
            if (!Util.isEmptyObject(response.result.mnemonic)) {
                this.importFromMnemonic(response.result.mnemonic);
            }
        }, (err) => {
            console.error("Failed to get mnemonics from wallet app");
            this.native.toast("Failed to get mnemonics from the wallet app");
        });
    }

    prevSlide(slider) {
        slider.slidePrev();
    }

    nextSlide(slider) {
        slider.slideNext();
    }

    shouldShowBack() {
        return !this.isfirst;
    }
}
