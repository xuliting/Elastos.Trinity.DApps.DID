import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DrawerState } from 'ion-bottom-drawer';

import { AdvancedPopupController } from 'src/app/components/advanced-popup/advancedpopup.controller';
import { NewDID } from 'src/app/model/newdid.model';
import { AuthService } from 'src/app/services/auth.service';
import { DIDService } from 'src/app/services/did.service';
import { Native } from 'src/app/services/native';
import { Styling } from 'src/app/services/styling';
import { Util } from 'src/app/services/util';

@Component({
    selector: 'page-noidentity',
    templateUrl: 'noidentity.html',
    styleUrls: ['noidentity.scss']
})
export class NoIdentityPage {
    public isfirst: boolean = true;
    public styling = Styling;
    public passwordSheetState = DrawerState.Bottom;
    public passwordSheetMinHeight = 0;
    public passwordSheetDockedHeight = 350;
    public password: string = "";
    public passwordConfirmation: string = "";

    constructor(public route:ActivatedRoute, private native: Native, private didService: DIDService,
                private authService: AuthService, private advancedPopup: AdvancedPopupController, private translate: TranslateService) {
    this.route.queryParams.subscribe((data) => {
        if (!Util.isEmptyObject(data)) this.isfirst = false;
    });
  }

    async createIdentity() {
        this.didService.didBeingCreated = new NewDID();

        // If there is an already active DID store, we don't need to create a new password to
        // create a new DID Store. We will only prompt user password for the existing DID store later
        // in the UI flow.
        if (this.didService.getActiveDidStore() != null) {
            this.native.go('/editprofile');
        }
        else {
            // Need to create a new DID store with a password
            this.password = await this.authService.promptNewPassword();
            if (this.password != null) {
                this.didService.didBeingCreated.password = this.password;
                await this.didService.addDidStore();
                this.native.go('/newpasswordset');
            }
        }
    }

    importIdentity() {
        console.log('importIdentity');
        if (this.didService.getActiveDidStore() == null) {
            this.native.go('/importdid');
        } else {
            this.advancedPopup.create({
                color:'#FF4D4D',
                info: {
                    picture: '/assets/images/Local_Data_Delete_Icon.svg',
                    title: this.translate.instant("deletion-popup-warning"),
                    content: this.translate.instant("import-did-popup-content")
                },
                prompt: {
                    title: this.translate.instant("import-did-popup-confirm-question"),
                    confirmAction: this.translate.instant("confirm"),
                    cancelAction: this.translate.instant("go-back"),
                    confirmCallback: async ()=>{
                        this.native.go('/importdid');
                    }
                }
            }).show();
        }
    }

    prevSlide(slider) {
        slider.slidePrev();
    }

    nextSlide(slider) {
        slider.slideNext();
    }
}
