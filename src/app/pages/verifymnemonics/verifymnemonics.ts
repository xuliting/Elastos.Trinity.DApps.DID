import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { DIDService } from 'src/app/services/did.service';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';
import { AlertController, NavController } from '@ionic/angular';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

type MnemonicWord = {
    text: string;
    selected: boolean;
}

@Component({
    selector: 'page-verifymnemonics',
    templateUrl: 'verifymnemonics.html',
    styleUrls: ['verifymnemonics.scss']
})
export class VerifyMnemonicsPage {
    mnemonicList: Array<MnemonicWord> = [];
    selectedList = [];
    mnemonicStr: string;

    constructor(
      public router: Router,
      public zone: NgZone,
      private didService: DIDService,
      private authService: AuthService,
      private native: Native,
      private translate: TranslateService,
      public theme: ThemeService,
      private alertCtrl: AlertController,
      private navCtrl: NavController
    ) {
      this.init();
    }

    ionViewWillEnter() {
      titleBarManager.setTitle(this.translate.instant('verification'));
      titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.BACK);
    }

    init() {
        this.createEmptySelectedList();
        const navigation = this.router.getCurrentNavigation();
        if (!Util.isEmptyObject(navigation.extras.state)) {
            this.mnemonicStr = this.native.clone(navigation.extras.state["mnemonicStr"]);
            this.mnemonicList = this.mnemonicStr.split(" ").map((word)=>{
                return {text: word, selected: false}
            });
            this.mnemonicList = this.mnemonicList.sort(function () { return 0.5 - Math.random() });
        }
    }

    createEmptySelectedList() {
      this.selectedList = [];
      for(let i = 0; i < 12; i++) {
        this.selectedList.push(i);
      }
    }

    isWord(word): boolean {
      if(isNaN(word)) {
        return true
      } else {
        return false;
      }
    }

    public addButton(index: number, item: MnemonicWord): void {
      let nextItem = this.selectedList.find((word) => Number.isInteger(word));
      this.selectedList[nextItem] = item.text;
      this.mnemonicList[index].selected = true;
    }

    /*public removeButton(index: number, item: any): void {
        this.zone.run(() => {
            this.selectedList.splice(index, 1);
            this.mnemonicList[item.prevIndex].selected = false;
        });
    }*/

    nextClicked() {
      if(this.allWordsMatch()) {
        this.createDid();
      } else {
        this.returnToBackup();
      }
    }

    async returnToBackup() {
      const alert = await this.alertCtrl.create({
        header: 'Mnemonics are Incorrect',
        mode: 'ios',
        message: 'Please check your mnemonics and try again',
        buttons: [
          {
            text: 'Okay',
            handler: () => {
              this.navCtrl.back();
            }
          }
        ]
      });

      await alert.present();
    }

    async createDid() {
        // Create a new identity, without any mnemonic passphrase, only a did store password.
        await this.didService.getActiveDidStore().createPrivateIdentity(null, this.didService.didBeingCreated.password, this.native.getMnemonicLang(), this.mnemonicStr);
        this.native.showLoading('loading-msg').then(() => {
            this.didService.finalizeDidCreation(this.didService.didBeingCreated.password).then(()=> {
                this.native.hideLoading();
                // Save password for later use
                this.authService.saveCurrentUserPassword(this.didService.getActiveDidStore(), this.didService.didBeingCreated.password);

                console.log("Redirecting user to his profile page");
                this.native.setRootRouter("/home/myprofile");
            })
        });
    }

    allWordsMatch() {
        // return true;// for test
        let selectComplete = this.selectedList.length === this.mnemonicList.length ? true : false;
        if (selectComplete) {
            let mn = "";
            for (let i = 0; i < this.selectedList.length; i++) {
                mn += this.selectedList[i];
            }
            if (!Util.isNull(mn) && mn == this.mnemonicStr.replace(/\s+/g, "")) {
                return true;
            }
        }
        return false;
    }
}
