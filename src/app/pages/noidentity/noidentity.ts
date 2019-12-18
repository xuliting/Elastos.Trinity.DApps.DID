import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DrawerState } from 'ion-bottom-drawer';

import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { Config } from '../../services/config';
import { NewDID } from 'src/app/model/newdid.model';
import { Styling } from '../../services/styling';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DIDService } from 'src/app/services/did.service';

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

  constructor(public route:ActivatedRoute, private native: Native, private didService: DIDService, private authService: AuthService) {
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
    this.native.go("/importdid");
  }

  prevSlide(slider) {
    slider.slidePrev();
  }

  nextSlide(slider) {
    slider.slideNext();
  }
}
