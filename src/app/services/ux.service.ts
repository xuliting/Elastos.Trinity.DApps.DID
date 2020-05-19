import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { Native } from './native';

import { Config } from './config';
import { Util } from './util';
import { BrowserSimulation } from './browsersimulation';
import { AuthService } from './auth.service';
import { DIDService } from './did.service';
import { PopupProvider } from './popup';
import { Router } from '@angular/router';
import { NewDID } from '../model/newdid.model';
import { ThemeService } from './theme.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

let selfUxService: UXService = null;

enum MessageType {
    INTERNAL = 1,
    IN_RETURN = 2,
    IN_REFRESH = 3,

    EXTERNAL = 11,
    EX_LAUNCHER = 12,
    EX_INSTALL = 13,
    EX_RETURN = 14,
};

export enum DIDCreationMode {
    /** Add a new DID in an existing DID store (same mnemonic) */
    NEW_DID_TO_EXISTING_STORE,
    /** Add a new DID in a new DID store (new mnemonic) */
    NEW_DID_TO_NEW_STORE,
    /** Import all published DIDs from a saved mnemonic */
    IMPORT_MNEMONIC
}

@Injectable({
    providedIn: 'root'
})
export class UXService {
    public static instance: UXService = null;
    private isReceiveIntentReady = false;
    private appIsLaunchingFromIntent = false; // Is the app starting because of an intent request?
    public onGoingDidCreationMode: DIDCreationMode = null; // After opening from a createdid or importmnemonic intent, this defines how to create the DID

    constructor(
        public translate: TranslateService,
        private platform: Platform,
        private zone: NgZone,
        private native: Native,
        private popup: PopupProvider,
        private didService: DIDService,
        private authService: AuthService,
        private modalCtrl: ModalController,
        private navCtrl: NavController,
        private router: Router,
        private theme: ThemeService
    ) {
        selfUxService = this;
        UXService.instance = this;
    }

    async init() {
        console.log("UXService init");
        // this.theme.getTheme();

        if (!BrowserSimulation.runningInBrowser()) {
            this.getLanguage();

            this.computeAndShowEntryScreen();

            appManager.setListener(this.onReceive);
            this.setIntentListener();
        }
        else {
            // Simulated settings
            this.setCurLang("fr");

            this.showEntryScreen();
        }
    }

    /**
     * This method defines which screen has to be displayed when the app start. This can be the default
     * no identity or current identity main screen, (defined by the didstoremanager), but the app is maybe
     * starting because we are receiving an intent.
     *
     * This method must be called only during the initial app start.
     */
    computeAndShowEntryScreen() {
        console.log("Checking if there are pending intents");
        appManager.hasPendingIntent(async (hasPendingIntent: boolean)=>{
            if (hasPendingIntent) {
                // Do nothing, the intent listener will show the appropriate screen.
                console.log("There are some pending intents.");
            }
            else {
                console.log("No pending intent.");

                // Load user's identity
                await this.didService.loadGlobalIdentity();

                // No intent was received at boot. So we go through the regular screens.
                this.showEntryScreen();
            }
        }, (err: string)=>{
            console.error(err);

            // Error while checking - fallback to default behaviour
            this.didService.displayDefaultScreen();
        });
    }

    showEntryScreen() {
        this.didService.displayDefaultScreen();

        //selfUxService.native.go("/editprofile"); // TMP

        /*this.authService.chooseIdentity({
            redirectPath: "/credaccessrequest"
        });*/

        /*this.authService.chooseIdentity({
            redirectPath: "/regappprofilerequest"
        });*/

        //selfUxService.native.go("/importdid"); // TMP
        //selfUxService.native.go("/noidentity"); // TMP
    }

    /**
     * Close this application.
     */
    close() {
        if (!BrowserSimulation.runningInBrowser())
            appManager.close();
    }   

    minimize() {
        if (!BrowserSimulation.runningInBrowser())
            appManager.launcher();
    }

    /**
     * As the app starts invisible, screens have to call this method when they are ready, so that
     * user can actually see the app (but see it only when fully ready)
     */
    makeAppVisible() {
        appManager.setVisible("show");
    }

    getLanguage() {
        appManager.getLocale(
            (defaultLang, currentLang, systemLang) => {
                selfUxService.setCurLang(currentLang);
            }
        );
    }

    setCurLang(lang: string) {
        console.log("Setting current language to "+lang);

        this.zone.run(()=>{
            // Setting UI/translations language
            this.translate.use(lang);
        });

        // Settings DID SDK language
        if (lang === 'en') {
            this.native.setMnemonicLang(DIDPlugin.MnemonicLanguage.ENGLISH);
        } else if (lang === 'zh') {
            this.native.setMnemonicLang(DIDPlugin.MnemonicLanguage.CHINESE_SIMPLIFIED);
        } else if (lang === 'fr') {
            this.native.setMnemonicLang(DIDPlugin.MnemonicLanguage.FRENCH);
        } else {
            this.native.setMnemonicLang(DIDPlugin.MnemonicLanguage.ENGLISH);
        }
    }

    public translateInstant(key: string): string {
        return this.translate.instant(key);
    }

    setIntentListener() {
        if (!BrowserSimulation.runningInBrowser()) {
            console.log("Setting intent listener");
            if (!this.isReceiveIntentReady) {
                this.isReceiveIntentReady = true;
                appManager.setIntentListener((intent: any)=>{
                    this.onReceiveIntent(intent);
                });
            }
        }
    }

    onReceive = (ret) => {
        console.log('onReceive', ret);
        var params: any = ret.message;
        if (typeof (params) == "string") {
            try {
                params = JSON.parse(params);
            } catch (e) {
                console.log('Params are not JSON format: ', params);
            }
        }
        switch (ret.type) {
            case MessageType.IN_REFRESH:
              if (params.action === "currentLocaleChanged") {
                this.setCurLang(params.data);
              }
         /*      if(params.action === 'preferenceChanged' && params.data.key === "ui.darkmode") {
                this.zone.run(() => {
                  console.log('Dark Mode toggled');
                  this.theme.setTheme(params.data.value);
                });
              } */
              break;
            case MessageType.EX_INSTALL:
                break;
            case MessageType.INTERNAL:
                switch (ret.message) {
                    case 'navback':
                        this.titlebarBackButtonHandle();
                        break;
                }
                break;
        }
    }

    async titlebarBackButtonHandle() {
        // to check alert, action, popover, menu ?
        // ...
        const modal = await this.modalCtrl.getTop();
        if (modal) {
            modal.dismiss();
            return;
        }

        this.navCtrl.back();
    }

    async onReceiveIntent(intent: AppManagerPlugin.ReceivedIntent) {
        console.log("Intent received", intent);

        switch (intent.action) {
            case "createdid":
                console.log("Received create did intent request");

                if (intent.from != "org.elastos.trinity.dapp.didsession") {
                    // Security item: Make sure DID creation is only called by the did session app
                    this.sendIntentResponse(intent.action, {
                        error: "Only the DID session app is allowed to call this action"
                    }, intent.intentId);
                    this.close();
                    return;
                }

                if (selfUxService.checkCreateDIDIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;
                    this.handleCreateDIDIntent(intent);
                }
                else {
                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
            case "importmnemonic":
                console.log("Received import mnemonic intent request");

                if (intent.from != "org.elastos.trinity.dapp.didsession") {
                    console.log("importmnemonic not called from the did session app. Exiting.");

                    // Security item: Make sure DID creation is only called by the did session app
                    this.sendIntentResponse(intent.action, {
                        error: "Only the DID session app is allowed to call this action"
                    }, intent.intentId);
                    this.close();
                    return;
                }

                if (selfUxService.checkImportMnemonicIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;
                    this.handleImportMnemonicIntent(intent);
                }
                else {
                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
            case "deletedid":
                console.log("Received delete did intent request");

                if (intent.from != "org.elastos.trinity.dapp.didsession") {
                    // Security item: Make sure DID deletion is only called by the did session app
                    this.sendIntentResponse(intent.action, {
                        error: "Only the DID session app is allowed to call this action"
                    }, intent.intentId);
                    this.close();
                    return;
                }

                if (selfUxService.checkDeleteDIDIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;
                    this.handleDeleteDIDIntent(intent);
                }
                else {
                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
            case "credaccess":
                console.log("Received credential access intent request");
                if (selfUxService.checkCredAccessIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;
                    this.native.go("/credaccessrequest");
                }
                else {
                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
            case "credissue":
                console.log("Received credential issue intent request");
                if (selfUxService.checkCredIssueIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;
                    this.native.go("/credissuerequest");
                }
                else {
                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
            case "registerapplicationprofile":
                console.log("Received register application profile intent request");
                if (selfUxService.checkRegAppProfileIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;
                    this.native.go("/regappprofilerequest");
                }
                else {
                    console.error("Missing or wrong intent parameters for "+intent.action);

                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
            case "sign":
                console.log("Received sign intent request");
                if (selfUxService.checkSignIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;
                    this.native.go("/signrequest");
                }
                else {
                    console.error("Missing or wrong intent parameters for "+intent.action);

                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
        }
    }

    public sendIntentResponse(action, result, intentId): Promise<void> {
      return new Promise((resolve, reject)=>{
        if (!BrowserSimulation.runningInBrowser()) {
          appManager.sendIntentResponse(action, result, intentId,
            (response)=> {
              resolve();
            },
            (err) => {
              console.error('sendIntentResponse failed: ', err);
              reject(err);
            }
          );
        } else {
          console.warn("Not sending intent response, we are in browser");
          resolve();
        }
      });
    }

    private async handleCreateDIDIntent(intent: AppManagerPlugin.ReceivedIntent) {
        if (intent.params.didStoreId) {
            let didStoreId = intent.params.didStoreId;

            // If a DID store ID is provided and defined, we create a new DID in that store.
            this.onGoingDidCreationMode = DIDCreationMode.NEW_DID_TO_EXISTING_STORE;
            this.didService.didBeingCreated = new NewDID();

            // First, try to load the given DID store
            try {
                await this.didService.activateDidStore(didStoreId);

                // Even if the DID store ID doesn't exist, a store can be "activated". What we need to ensure
                // is that this store has a private identity set, meaning that is has actually been created earlier.
                // If it doesn't, this means we don't have such store ID on the device.
                let hasPrivateIdentity = await this.didService.getActiveDidStore().hasPrivateIdentity();
                if (hasPrivateIdentity) {
                    this.native.go('/editprofile', {create: true});
                }
                else {
                    this.sendIntentResponse(intent.action, {
                        error: "No DID store found for ID "+didStoreId
                    }, intent.intentId);
                    this.close();
                }
            }
            catch (e) {
                // Not able to activate the given DID store - maybe it doesn't exist.
                // So we return an error.
                this.sendIntentResponse(intent.action, {
                    error: "No DID store found for ID "+didStoreId
                }, intent.intentId);
                this.close();
            }
        }
        else {
            // No did store provided, so we create a new mnemonic first then a DID inside.
            this.onGoingDidCreationMode = DIDCreationMode.NEW_DID_TO_NEW_STORE;
            this.native.go('/noidentity');
        }
    }

    private async handleImportMnemonicIntent(intent: AppManagerPlugin.ReceivedIntent) {
        this.onGoingDidCreationMode = DIDCreationMode.IMPORT_MNEMONIC;
        this.native.go('/noidentity');
    }

    private async handleDeleteDIDIntent(intent: AppManagerPlugin.ReceivedIntent) {
        // Activate the DID to be deleted. If this fails, directly return an error.
        let couldActivate = await this.didService.activateDid(intent.params.didStoreId, intent.params.didString);
        if (!couldActivate) {
            this.sendIntentResponse(intent.action, {
                error: "No DID store or did object found for DID "+intent.params.didString
            }, intent.intentId);
            this.close();
        }
        else {
            this.native.go('/deletedid');
        }
    }

    async showErrorAndExitFromIntent(intent: AppManagerPlugin.ReceivedIntent) {
        let errorMessage = "Sorry, there are invalid parameters in the request";
        errorMessage += "\n\n"+JSON.stringify(intent.params);

        await this.popup.ionicAlert("Action error", errorMessage, "Close");
 
        console.error(errorMessage);

        await this.sendIntentResponse(intent.action, {}, intent.intentId);
        this.close();
    }

    checkCredAccessIntentParams(intent) {
        console.log("Checking credaccess intent parameters");
        if (Util.isEmptyObject(intent.params)) {
            console.error("Invalid credaccess parameters received. No params.", intent.params);
            return false;
        }

        Config.requestDapp = {
            appPackageId: intent.from,
            intentId: intent.intentId,
            action: intent.action,
            requestProfile: intent.params.claims || [], // We are allowed to request no claim except the DID itself
            originalJwtRequest: intent.originalJwtRequest
        }
        return true;
    }

    checkCredIssueIntentParams(intent) {
        console.log("Checking credissue intent parameters");
        if (Util.isEmptyObject(intent.params) || Util.isEmptyObject(intent.params.issuedcredentials)) {
            console.error("Invalid credissue parameters received. No params or empty credentials list.", intent.params);
            return false;
        }

        Config.requestDapp = {
            appPackageId: intent.from,
            intentId: intent.intentId,
            action: intent.action,
            issuedCredentials: intent.params.issuedcredentials,
            originalJwtRequest: intent.originalJwtRequest
        }
        return true;
    }

    /**
     * Checks generic parameters in the received intent, and fills our requesting DApp object info
     * with intent info for later use.
     */
    checkGenericIntentParams(intent, allowEmptyParams: boolean = false): boolean {
        console.log("Checking generic intent parameters");

        if (!allowEmptyParams && Util.isEmptyObject(intent.params)) {
            console.error("Intent parameters are empty");
            return false;
        }

        Config.requestDapp = {
            appPackageId: intent.from,
            intentId: intent.intentId,
            action: intent.action,
            allParams: intent.params,
            originalJwtRequest: intent.originalJwtRequest
        }

        return true;
    }

    checkRegAppProfileIntentParams(intent: AppManagerPlugin.ReceivedIntent): boolean {
        console.log("Checking intent parameters");

        if (!this.checkGenericIntentParams(intent))
            return false;

        // Check and get specific parameters for this intent
        if (!intent.params.identifier) {
            console.error("Missing profile 'identifier'.");
            return false;
        }

        if (!intent.params.connectactiontitle) {
            console.error("Missing profile 'connectactiontitle'.");
            return false;
        }

        // Config.requestDapp was already initialized earlier.
        Config.requestDapp.identifier = intent.params.identifier;
        Config.requestDapp.connectactiontitle = intent.params.connectactiontitle;
        Config.requestDapp.customcredentialtypes = intent.params.customcredentialtypes;
        Config.requestDapp.allParams = intent.params;

        return true;
    }

    checkSignIntentParams(intent: AppManagerPlugin.ReceivedIntent): boolean {
        console.log("Checking intent parameters");

        if (!this.checkGenericIntentParams(intent))
            return false;

        // Check and get specific parameters for this intent
        if (!intent.params.data) {
            console.error("Missing 'data'.");
            return false;
        }

        // Config.requestDapp was already initialized earlier.
        Config.requestDapp.allParams = intent.params;

        return true;
    }

    checkCreateDIDIntentParams(intent: AppManagerPlugin.ReceivedIntent): boolean {
        console.log("Checking intent parameters");

        if (!this.checkGenericIntentParams(intent))
            return false;

        // Nothing specific to do yet

        return true;
    }

    checkImportMnemonicIntentParams(intent: AppManagerPlugin.ReceivedIntent): boolean {
        console.log("Checking intent parameters");

        if (!this.checkGenericIntentParams(intent, true))
            return false;

        // Nothing specific to do yet

        return true;
    }

    checkDeleteDIDIntentParams(intent: AppManagerPlugin.ReceivedIntent): boolean {
        console.log("Checking intent parameters");

        if (!this.checkGenericIntentParams(intent, true))
            return false;

        // Nothing specific to do yet

        return true;
    }
}
