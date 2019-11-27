import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Native } from './native';

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

    constructor(public translate: TranslateService, private platform: Platform, private native: Native) {
        selfUxService = this;
    }

    init() {
        console.log("UXService init");
        if (this.platform.platforms().indexOf("cordova") >= 0) {
            appManager.setListener(this.onReceive);
            this.getLanguage();
        }
    }

    /**
     * Close this application.
     */
    close() {
        appManager.close();
    }

    minimize() {
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
        if (!this.isReceiveIntentReady) {
            this.isReceiveIntentReady = true;
            appManager.setIntentListener(this.onReceiveIntent);
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

    onReceiveIntent(ret) {
        console.log("Intent received", ret);

        switch (ret.action) {
            case "credaccess":
                console.log("Received credential access intent request");

                selfUxService.native.go("/credaccessrequest", {
                    intentId: ret.intentId,
                    appName: ret.params.appName
                });
                break;
        }
    }

    sendIntentResponse(action, result, intentId) {
        appManager.sendIntentResponse(action, result, intentId, null);
    }
}
