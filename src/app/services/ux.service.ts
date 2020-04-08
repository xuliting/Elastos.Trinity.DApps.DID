import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform, NavController } from '@ionic/angular';
import { Native } from './native';

import { Config } from './config';
import { Util } from './util';
import { BrowserSimulation } from './browsersimulation';
import { AuthService } from './auth.service';
import { DIDService } from './did.service';
import { PopupProvider } from './popup';
import { Router } from '@angular/router';

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

@Injectable({
    providedIn: 'root'
})
export class UXService {
    public static instance: UXService = null;
    private isReceiveIntentReady = false;
    private appIsLaunchingFromIntent = false; // Is the app starting because of an intent request?

    constructor(
        public translate: TranslateService,
        private platform: Platform,
        private zone: NgZone,
        private native: Native,
        private popup: PopupProvider,
        private didService: DIDService,
        private authService: AuthService,
        private navCtrl: NavController,
        private router: Router,
    ) {
        selfUxService = this;
        UXService.instance = this;
    }

    init() {
        console.log("UXService init");

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
        appManager.hasPendingIntent((hasPendingIntent: boolean)=>{
            if (hasPendingIntent) {
                // Do nothing, the intent listener will show the appropriate screen.
                console.log("There are some pending intents.");
            }
            else {
                console.log("No pending intent.");

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
        titleBarManager.setBackgroundColor("#FFFFFF");
        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.DARK);
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
                switch (params.action) {
                    case "currentLocaleChanged":
                        selfUxService.setCurLang(params.data);
                        break;
                }
                break;
            case MessageType.EX_INSTALL:
                break;
            case MessageType.INTERNAL:
                switch (ret.message) {
                    case 'navback':
                        this.navCtrl.back();
                }
                    break;
        }
    }

    onReceiveIntent(intent: AppManagerPlugin.ReceivedIntent) {
        console.log("Intent received", intent);

        switch (intent.action) {
            case "createdid":
                console.log("Received create did intent request");
                if (selfUxService.checkCreateDIDIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;

                    this.authService.chooseIdentity({
                        redirectPath: "/importdid"
                    });
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

                    this.authService.chooseIdentity({
                        redirectPath: "/credaccessrequest"
                    });
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

                    // Don't choose a DID manually here, the credissue screen automatically finds this
                    // for the target DID.
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

                    this.authService.chooseIdentity({
                        redirectPath: "/regappprofilerequest"
                    });
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

                    this.authService.chooseIdentity({
                        redirectPath: "/signrequest"
                    });
                }
                else {
                    console.error("Missing or wrong intent parameters for "+intent.action);

                    // Something wrong happened while trying to handle the intent: send intent response with error
                    this.showErrorAndExitFromIntent(intent);
                }
                break;
        }
    }

    sendIntentResponse(action, result, intentId) {
        if (!BrowserSimulation.runningInBrowser()) {
            appManager.sendIntentResponse(action, result, intentId, null);
        } else {
            console.warn("Not sending intent response, we are in browser");
        }
    }

    async showErrorAndExitFromIntent(intent: AppManagerPlugin.ReceivedIntent) {
        let errorMessage = "Sorry, there are invalid parameters in the request";
        errorMessage += "\n\n"+JSON.stringify(intent.params);

        await this.popup.ionicAlert("Action error", errorMessage, "Close");

        this.sendIntentResponse(intent.action, {}, intent.intentId);
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
            requestProfile: intent.params.claims || [] // We are allowed to request no claim except the DID itself
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
            issuedCredentials: intent.params.issuedcredentials
        }
        return true;
    }

    /**
     * Checks generic parameters in the received intent, and fills our requesting DApp object info
     * with intent info for later use.
     */
    checkGenericIntentParams(intent): boolean {
        console.log("Checking generic intent parameters");

        if (Util.isEmptyObject(intent.params)) {
            console.error("Intent parameters are empty");
            return false;
        }

        Config.requestDapp = {
            appPackageId: intent.from,
            intentId: intent.intentId,
            action: intent.action,
            allParams: intent.params
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

        // Config.requestDapp was already initialized earlier.
        Config.requestDapp.allParams = intent.params;

        return true;
    }
}
