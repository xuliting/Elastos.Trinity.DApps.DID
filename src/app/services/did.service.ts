import { Injectable, NgZone } from '@angular/core';
import { Platform, AlertController, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController } from '@ionic/angular';

declare let appService: any;
let selfDIDService: DIDService = null;

@Injectable({
    providedIn: 'root'
})
export class DIDService {
    constructor(
        private platform: Platform,
        public zone: NgZone,
        public toastCtrl: ToastController,
        private navController: NavController) {
            selfDIDService = this;
    }

    init() {
        console.log("DID Service is initializing...");

        // Load app manager only on real device, not in desktop browser - beware: ionic 4 bug with "desktop" or "android"/"ios"
        if (this.platform.platforms().indexOf("cordova") >= 0) {
            console.log("Listening to intent events")
            appService.setIntentListener(
                this.onReceiveIntent
            );
        }
    }

    /*toast(msg: string = '', duration: number = 2000): void {
        this.toastCtrl.create({
            message: msg,
            duration: duration,
            position: 'top'
        }).then(toast => toast.present());
    }*/

    onReceiveIntent(ret) {
        console.log("Intent received", ret);

        switch (ret.action) {
            case "credaccess":
                console.log("Received credential access intent request");

                selfDIDService.navController.navigateRoot("/credaccessrequest", {queryParams: {
                    intentId: ret.intentId,
                    appName: ret.params.appName
                }});
                break;
        }
    }

    /**
     * Close this application.
     */
    close() {
        appService.close();
    }

    /**
     * Creates a new local user identity.
     */
    createIdentity() {
        return new Promise((resolve, reject)=>{
           resolve() 
        });
    }
}
