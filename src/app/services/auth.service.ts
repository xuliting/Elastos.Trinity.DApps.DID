
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SecurityCheckComponent } from '../components/securitycheck/securitycheck.component';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public static instance: AuthService = null;

    private savedPassword: string = null; // Latest password input by user
    private savedPasswordRelatedDIDStoreId: string = null; // Store ID for which the user password was provided.

    constructor(public modalCtrl: ModalController) {
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
}


