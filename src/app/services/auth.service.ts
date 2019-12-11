
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SecurityCheckComponent } from '../components/securitycheck/securitycheck.component';
import { Config } from './config';
import { UXService } from './ux.service';
import { Native } from './native';
import { CreatePasswordComponent } from '../components/createpassword/createpassword.component';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public static instance: AuthService = null;

    private savedPassword: string = null; // Latest password input by user
    private savedPasswordRelatedDIDStoreId: string = null; // Store ID for which the user password was provided.

    constructor(public modalCtrl: ModalController, private native: Native) {
        AuthService.instance = this;
    }

    /**
     * Do we know the DID store password for the currently active store?
     */
    needToPromptPassword(didStoreId: string): boolean {
        if (didStoreId == this.savedPasswordRelatedDIDStoreId && this.savedPassword != null) {
            // We already know the password for current 
            return false;
        }

        // We don't know the password for the given did store yet
        console.log("User password has to be prompted");
        return true;
    }

    /**
     * Remember password provided by user for later.
     */
    saveCurrentUserPassword(didStoreId: string, password: string) {
        console.log("Saving user password for DID Store id "+didStoreId);

        this.savedPasswordRelatedDIDStoreId = didStoreId;
        this.savedPassword = password;
    }

    getCurrentUserPassword() : string {
        return this.savedPassword;
    }

    /**
     * Ask user to provide his password
     */
    async promptPasswordInContext(forDidStore: string, previousPasswordWasWrong: boolean = false) {
        console.log("Asking for user password ", previousPasswordWasWrong);

        return new Promise(async (resolve, reject)=>{
            const modal = await this.modalCtrl.create({
                component: SecurityCheckComponent,
                componentProps: {
                    didStoreId: forDidStore,
                    previousPasswordWasWrong: previousPasswordWasWrong
                },
                cssClass:"security-check-modal"
            });
            modal.onDidDismiss().then((params) => {
                if (params.data && params.data.password)
                    this.saveCurrentUserPassword(forDidStore, params.data.password);

                resolve();
            });
            modal.present();
        })
    }

    public promptNewPassword(): Promise<string> {
        console.log("Asking for new user password ");

        return new Promise(async (resolve, reject)=>{
            const modal = await this.modalCtrl.create({
                component: CreatePasswordComponent,
                componentProps: {
                },
                cssClass:"create-password-modal"
            });
            modal.onDidDismiss().then((params) => {
                if (!params.data)
                    resolve(null);
                else
                    resolve(params.data.password);
            });
            modal.present();
        })
    }

    /**
     * This method lets user choose a DID before going to another screen.
     * If there is only one identity, it will be selected and activated by default.
     * If multiple identities, it goes to the ID chooser screen first before redirecting to the originally
     * requested screen.
     */
    public async chooseIdentity(opts: ChooseIdentityOptions) {
        console.log("ChooseIdentity: checking");

        let didStoreEntries = await Config.didStoreManager.getDidStoreEntries();

        if (!didStoreEntries || didStoreEntries.length == 0) {
            console.log("ChooseIdentity: no DID exists, redirecting to ID creation");

            // No identity? Ask user to create one.
            Config.didStoreManager.displayDefaultScreen();

            // TODO: REDIRECT TO THE INTENT AFTER ID CREATION
        }
        else if (didStoreEntries.length == 1) {
            console.log("ChooseIdentity: only one DID exists, redirecting to the target screen directly");

            // Only one identity? Then use this one directly.
            await Config.didStoreManager.activateSavedDidStore();
            this.native.go(opts.redirectPath);
        }
        else {
            console.log("ChooseIdentity: multiple DID exist, redirecting to the DID chooser screen");

            // Multiple DIDs: go to DID chooser screen
            this.native.go("/choosedid", opts);
        }
    }
}

export type ChooseIdentityOptions = {
    redirectPath: string;
}