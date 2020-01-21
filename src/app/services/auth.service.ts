
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SecurityCheckComponent } from '../components/securitycheck/securitycheck.component';
import { Config } from './config';
import { UXService } from './ux.service';
import { Native } from './native';
import { CreatePasswordComponent } from '../components/createpassword/createpassword.component';
import { DIDService } from './did.service';
import { DIDStore } from '../model/didstore.model';
import { WrongPasswordException } from '../model/exceptions/wrongpasswordexception.exception';
import { MnemonicPassCheckComponent } from '../components/mnemonicpasscheck/mnemonicpasscheck.component';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public static instance: AuthService = null;

    private savedPassword: string = null; // Latest password input by user
    private savedPasswordRelatedDIDStoreId: string = null; // Store ID for which the user password was provided.
    private mnemonicPassphrase: string = null; // Temporary passphrase storage while importing fro mmnemonic with passphrase

    constructor(public modalCtrl: ModalController, private native: Native, private didService: DIDService) {
        AuthService.instance = this;
    }

    /**
     * Do we know the DID store password for the currently active store?
     */
    needToPromptPassword(didStore: DIDStore): boolean {
        if (didStore.getId() == this.savedPasswordRelatedDIDStoreId && this.savedPassword != null) {
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
    saveCurrentUserPassword(didStore: DIDStore, password: string) {
        console.log("Saving user password for DID Store id "+(didStore?didStore.getId():null));

        // When importing a DID, we can save a password without having a related DID store yet.
        if (didStore)
            this.savedPasswordRelatedDIDStoreId = didStore.getId();
        else
            this.savedPasswordRelatedDIDStoreId = null;

        this.savedPassword = password;
    }

    getCurrentUserPassword() : string {
        return this.savedPassword;
    }

    /**
     * Ask user to provide his password
     */
    async promptPasswordInContext(forDidStore: DIDStore, previousPasswordWasWrong: boolean = false): Promise<boolean> {
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
                if (params.data && params.data.password) {
                    this.saveCurrentUserPassword(forDidStore, params.data.password);
                    resolve(true);
                }
                else {
                    // Cancelled.
                    resolve(false);
                }
            });
            modal.present();
        })
    }

    public promptNewPassword(changePassword = false): Promise<string> {
        console.log("Asking for new user password ");

        return new Promise(async (resolve, reject)=>{
            const modal = await this.modalCtrl.create({
                component: CreatePasswordComponent,
                componentProps: {
                    changePassword: changePassword
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
     * Asks user if he needs to use a mnemonic passphrase. If so, returns the input passphrase.
     * If none, returns null.
     */
    public promptMnemonicPassphrase(): Promise<string> {
        console.log("Asking for mnemonic passphrase");

        return new Promise(async (resolve, reject)=>{
            const modal = await this.modalCtrl.create({
                component: MnemonicPassCheckComponent,
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

    public async checkPasswordThenExecute(writeActionCb: ()=>Promise<void>, onError: ()=>void, wrongPasswordCb: ()=>void, forcePasswordPrompt: boolean = false) {
        return new Promise(async (resolve, reject)=>{
            // A write operation requires password. Make sure we have this in memory, or prompt user.
            let passwordProvided: boolean = true;
            if (forcePasswordPrompt || this.needToPromptPassword(this.didService.getActiveDidStore())) {
                let previousPasswordWasWrong = forcePasswordPrompt;
                passwordProvided = await this.promptPasswordInContext(this.didService.getActiveDidStore(), previousPasswordWasWrong);
                // Password will be saved by the auth service.
            }

            if (passwordProvided) {
                writeActionCb().then(()=>{
                    resolve();
                }).catch(async (e)=>{
                    console.error(e);
                    if (e instanceof WrongPasswordException) {
                        wrongPasswordCb();

                        // Wrong password provided - try again.
                        await this.checkPasswordThenExecute(writeActionCb, onError, wrongPasswordCb, forcePasswordPrompt = true);
                    }
                    else {
                        onError();
                        reject();
                    }
                });
            }
            else {
                // No password provided - stop this check loop as that was cancelled by user.
            }
        });
    }

    saveMnemonicPassphrase(passphrase: string) {
        this.mnemonicPassphrase = passphrase;
    }

    getMnemonicPassphrase(): string {
        return this.mnemonicPassphrase;
    }

    /**
     * This method lets user choose a DID before going to another screen.
     * If there is only one identity, it will be selected and activated by default.
     * If multiple identities, it goes to the ID chooser screen first before redirecting to the originally
     * requested screen.
     */
    public async chooseIdentity(opts: ChooseIdentityOptions) {
        console.log("ChooseIdentity: checking");

        let didEntries = await this.didService.getDidEntries();

        if (!didEntries || didEntries.length == 0) {
            console.log("ChooseIdentity: no DID exists, redirecting to ID creation");

            // No identity? Ask user to create one.
            this.didService.displayDefaultScreen();

            // TODO: REDIRECT TO THE INTENT AFTER ID CREATION
        }
        else if (didEntries.length == 1) {
            console.log("ChooseIdentity: only one DID exists, redirecting to the target screen directly");

            // Only one identity? Then use this one directly.
            await this.didService.activateSavedDid();
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