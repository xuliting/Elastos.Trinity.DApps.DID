import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Native } from './native';

import { Config } from './config';
import { Util } from './util';
import { BrowserSimulation } from './browsersimulation';
import { DidStoreManager } from './didstoremanager';
import { AuthService } from './auth.service';

declare let appManager: AppManagerPlugin.AppManager;
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
    private isReceiveIntentReady = false;
    private appIsLaunchingFromIntent = false; // Is the app starting because of an intent request?

    constructor(public translate: TranslateService, 
        private platform: Platform, 
        private native: Native,
        private authService: AuthService) {
        selfUxService = this;
    }

    init() {
        console.log("UXService init");
        if (this.platform.platforms().indexOf("cordova") >= 0) {
            appManager.setListener(this.onReceive);
            this.getLanguage();
            this.setIntentListener();
        }

        this.computeAndShowEntryScreen();
    }

    /**
     * This method defines which screen has to be displayed when the app start. This can be the default 
     * no identity or current identity main screen, (defined by the didstoremanager), but the app is maybe
     * starting because we are receiving an intent.
     * 
     * This method must be called only during the initial app start.
     */
    computeAndShowEntryScreen() {
        // DIRTY - but no choice for now because of the asynchronous design of the intent API.
        // Wait for a while and check later if an intent ahs been received asynchronously. Then we can
        // decide where to go.
        // TODO: Replace this with the new API: AppManager.hadPendingIntent()
        setTimeout(()=>{
            if (this.appIsLaunchingFromIntent) {
                // Do nothing, the intent listener will show the appropriate screen.
            }
            else {
                // No intent was received at boot. So we go through the regular screens.
                //Config.didStoreManager.displayDefaultScreen();
                
                this.authService.chooseIdentity({
                    redirectPath: "/credaccessrequest"
                });

                //selfUxService.native.go("/importdid"); // TMP
                //selfUxService.native.go("/noidentity"); // TMP
            }
        }, 500);
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

    getLanguage() {
        appManager.getLocale(
            (currentLang, systemLang) => {
                selfUxService.setCurLang(currentLang);
            }
        );
    }

    setCurLang(lang: string) {
        this.translate.use(lang);
        if (lang == 'en') {
            this.native.setMnemonicLang(0);
        } else if (lang == "zh") {
            this.native.setMnemonicLang(3);
        } else {
            this.native.setMnemonicLang(0);
        }
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

    onReceive(ret) {
        var params: any = ret.message;
        if (typeof (params) == "string") {
            params = JSON.parse(params);
        }
        switch (ret.type) {
            case MessageType.IN_REFRESH:
                switch (params.action) {
                    case "currentLocaleChanged":
                        selfUxService.setCurLang(params.code);
                        break;
                }
                break;
            case MessageType.EX_INSTALL:
                break;
        }
    }

    onReceiveIntent(intent) {
        console.log("Intent received", intent);

        switch (intent.action) {
            case "credaccess":
                console.log("Received credential access intent request");
                if (selfUxService.checkIntentParams(intent)) {
                    this.appIsLaunchingFromIntent = true;

                    this.authService.chooseIdentity({
                        redirectPath: "/credaccessrequest"
                    });
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

    checkIntentParams(intent) {
        console.log("Checking intent parameters");
        if (Util.isEmptyObject(intent.params) || Util.isEmptyObject(intent.params.claims)) return false;

        let requestProfile = [];
        intent.params.claims.forEach((item,index,array)=>{
            for(var prop in item) {
                if (item[prop] === true) {
                    requestProfile.push(prop);
                }
                // TODO if item[prop] is object ?
                // get reason
            }
        });

        Config.requestDapp = {
            appName: intent.from,
            intentId: intent.intentId,
            action: intent.action,
            requestProfile: requestProfile,
            // reason: ret.params.claims.reason
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
            appName: intent.from,
            intentId: intent.intentId,
            action: intent.action
        }

        return true;
    }

    checkRegAppProfileIntentParams(intent): boolean {
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
}
