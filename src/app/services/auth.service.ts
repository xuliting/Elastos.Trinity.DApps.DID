
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CreatePasswordComponent } from '../components/createpassword/createpassword.component';
import { SecurityCheckComponent } from '../components/securitycheck/securitycheck.component';
import { MnemonicPassCheckComponent } from '../components/mnemonicpasscheck/mnemonicpasscheck.component';
import { WrongPasswordException } from '../model/exceptions/wrongpasswordexception.exception';
import { DIDStore } from '../model/didstore.model';
import { DIDService } from './did.service';
import { LocalStorage } from './localstorage';
import { Native } from './native';
import { DisableBiometricPromptComponent, DisableBiometricPromptChoice } from '../components/disablebiometricprompt/disablebiometricprompt.component';

declare let fingerprintManager: FingerprintPlugin.FingerprintManager;
declare let passwordManager: PasswordManagerPlugin.PasswordManager;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public static instance: AuthService = null;

    private savedPassword: string = null; // Latest password input by user
    private savedPasswordRelatedDIDStoreId: string = null; // Store ID for which the user password was provided.
    private mnemonicPassphrase: string = null; // Temporary passphrase storage while importing fro mmnemonic with passphrase

    constructor(public modalCtrl: ModalController, private native: Native, private didService: DIDService, private storage: LocalStorage) {
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
    async saveCurrentUserPassword(didStore: DIDStore, password: string) {
        console.log("Saving user password for DID Store id " + (didStore ? didStore.getId() : null));

        // When importing a DID, we can save a password without having a related DID store yet.
        if (didStore)
            this.savedPasswordRelatedDIDStoreId = didStore.getId();
        else
            this.savedPasswordRelatedDIDStoreId = null;

        this.savedPassword = password;

        // Saving password to password manager
        try {
            let passwordKey = "didstorepassword-" + didStore.getId();
            let passwordInfo: PasswordManagerPlugin.GenericPasswordInfo = {
                key: passwordKey,
                type: PasswordManagerPlugin.PasswordType.GENERIC_PASSWORD,
                displayName: "DID Store Password",
                password: password
            };
            await passwordManager.setPasswordInfo(passwordInfo);
        }
        catch (e) {
            console.warn("Password manager error, could be nothing: ", e);
            console.log(JSON.stringify(e));
        }
    }

    getCurrentUserPassword(): string {
        return this.savedPassword;
    }

    /**
     * Ask user to provide his password. If biometric auth is enabled, we don't show any popup and let the
     * fingerprint plugin show its UI.
     */
    async promptPasswordInContext(forDidStore: DIDStore, previousPasswordWasWrong: boolean = false): Promise<boolean> {
        console.log("Asking for user password ", previousPasswordWasWrong);

        return new Promise(async (resolve, reject) => {
            if (!previousPasswordWasWrong) {
                // First check if password manager knows this password. If so, use it.
                let passwordKey = "didstorepassword-" + forDidStore.getId();
                try {
                    console.log("Checking if password manager knows our password");
                    let passwordInfo = await passwordManager.getPasswordInfo(passwordKey);
                    if (passwordInfo) {
                        console.log("Found a saved password in password manager");
                        let genericPasswordInfo = passwordInfo as PasswordManagerPlugin.GenericPasswordInfo;
                        this.saveCurrentUserPassword(forDidStore, genericPasswordInfo.password);
                        resolve(true);
                        return;
                    }
                    else {
                        console.log("No saved password in password manager");
                    }
                }
                catch (e) {
                    // Error or cancellation - just forget this and use eh old-school way.
                    console.log("Password manager error: ", e);
                }
            }

            let biometricAuthEnabled = await this.fingerprintAuthenticationEnabled(forDidStore.getId());

            if (!biometricAuthEnabled) {
                // User has to provide a password, so we show the appropriate dialog
                const modal = await this.modalCtrl.create({
                    component: SecurityCheckComponent,
                    componentProps: {
                        didStoreId: forDidStore,
                        previousPasswordWasWrong: previousPasswordWasWrong
                    },
                    cssClass: "security-check-modal"
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
            }
            else {
                // Biometric auth enable, directly request the fingerprint plugin
                let password = await this.authenticateByFingerprintAndGetPassword(forDidStore.getId());
                if (password) {
                    this.saveCurrentUserPassword(forDidStore, password);
                    resolve(true);
                }
                else {
                    // Cancelled or auth error
                    console.log("Biometric authentication cancelled. Asking user to switch back to password auth.");
                    this.promptDisableBiometricAuth(forDidStore).then((ret) => {
                        resolve(ret);
                    })
                }
            }
        })
    }

    private async promptDisableBiometricAuth(forDidStore: DIDStore): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const modal = await this.modalCtrl.create({
                component: DisableBiometricPromptComponent,
                cssClass: "security-check-modal"
            });
            modal.onDidDismiss().then(async (params) => {
                if (params && params.data && params.data.action) {
                    let action = params.data.action as DisableBiometricPromptChoice;
                    if (action == DisableBiometricPromptChoice.KeepUsingBiometricAuth) {
                        // Just dismiss, nothing else to do
                        resolve(false)
                    }
                    else if (action == DisableBiometricPromptChoice.SwitchBackToPasswordAuth) {
                        // Toggle to manual password input
                        await this.deactivateFingerprintAuthentication(forDidStore.getId());
                        this.promptPasswordInContext(forDidStore, false).then((ret) => {
                            resolve(ret);
                        })
                    }
                    else {
                        resolve(false);
                    }
                }
                else {
                    // Cancelled.
                    resolve(false);
                }
            });
            modal.present();
        });
    }

    public promptNewPassword(changePassword = false): Promise<string> {
        console.log("Asking for new user password ");

        return new Promise(async (resolve, reject) => {
            const modal = await this.modalCtrl.create({
                component: CreatePasswordComponent,
                componentProps: {
                    changePassword: changePassword
                },
            });
            modal.onDidDismiss().then((params) => {
                console.log("AuthService got new password");

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

        return new Promise(async (resolve, reject) => {
            const modal = await this.modalCtrl.create({
                component: MnemonicPassCheckComponent,
                componentProps: {
                },
                cssClass: "create-password-modal"
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

    public async checkPasswordThenExecute(writeActionCb: () => Promise<void>, onError: () => void, wrongPasswordCb: () => void, forcePasswordPrompt: boolean = false, previousPasswordWasWrong: boolean = false) {
        return new Promise(async (resolve, reject) => {
            if (previousPasswordWasWrong) {
                // In case a typed password (or retrieved from fingerprint) was wrong, we deactivate fingeprint (if activated), to make sure user
                // tries to type his password again and not use the saved one.
                await this.deactivateFingerprintAuthentication(this.didService.getCurDidStoreId());
            }

            // A write operation requires password. Make sure we have this in memory, or prompt user.
            let passwordProvided: boolean = true;
            if (forcePasswordPrompt || this.needToPromptPassword(this.didService.getActiveDidStore())) {
                passwordProvided = await this.promptPasswordInContext(this.didService.getActiveDidStore(), previousPasswordWasWrong);
                // Password will be saved by the auth service.
            }

            if (passwordProvided) {
                writeActionCb().then(() => {
                    resolve();
                }).catch(async (e) => {
                    console.error(e);
                    if (e instanceof WrongPasswordException) {
                        wrongPasswordCb();
                        // Wrong password provided - try again.
                        await this.checkPasswordThenExecute(writeActionCb, onError, wrongPasswordCb, forcePasswordPrompt = true, previousPasswordWasWrong = true);
                        resolve();
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
     * Activates fingerprint authentication instead of using a password.
     * Password is saved for a given DID store, as later on, if we handle several did stores in the same app
     * (several users), we will have to know for which of them this saved password is for.
     */
    async activateFingerprintAuthentication(didStoreId: string, password: string): Promise<boolean> {
        console.log("Activating fingerprint authentication for did store id " + didStoreId);

        // Ask the fingerprint plugin to save user's password
        try {
            await fingerprintManager.authenticateAndSavePassword(didStoreId, password);

            // Password was securely saved. Now remember this user's choice in settings.
            await this.storage.set("useFingerprintAuthentication-" + didStoreId, true);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    async deactivateFingerprintAuthentication(didStoreId: string) {
        await this.storage.set("useFingerprintAuthentication-" + didStoreId, false);
    }

    async authenticateByFingerprintAndGetPassword(didStoreId: string) {
        // Ask the fingerprint plugin to authenticate and retrieve the password
        try {
            let password = await fingerprintManager.authenticateAndGetPassword(didStoreId);
            return password;
        }
        catch (e) {
            return null;
        }
    }

    async fingerprintAuthenticationEnabled(didStoreId: string): Promise<boolean> {
        return this.storage.get("useFingerprintAuthentication-" + didStoreId) || false;
    }

    async fingerprintIsAvailable() {
        try {
            let isAvailable = await fingerprintManager.isBiometricAuthenticationMethodAvailable();
            return isAvailable;
        }
        catch (e) {
            return false
        }
    }
}

export type ChooseIdentityOptions = {
    redirectPath: string;
}
