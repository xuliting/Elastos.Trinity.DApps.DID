import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DrawerState } from 'ion-bottom-drawer';

import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { Config } from '../../services/config';
import { NewDID } from 'src/app/model/newdid.model';
import { Styling } from '../../services/styling';

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

  constructor(public route:ActivatedRoute, private native: Native) {
    this.route.queryParams.subscribe((data) => {
        if (!Util.isEmptyObject(data)) this.isfirst = false;
    });
  }

  createIdentity(e: MouseEvent) {
    e.stopImmediatePropagation();

    Config.didBeingCreated = new NewDID();

    this.passwordSheetState = DrawerState.Docked;
  }

  importIdentity(e: MouseEvent) {
    e.stopImmediatePropagation();
    this.native.go("/importdid");
  }

  prevSlide(e: MouseEvent, slider) {
    e.stopImmediatePropagation();
    slider.slidePrev();
  }

  nextSlide(e: MouseEvent, slider) {
    e.stopImmediatePropagation();
    slider.slideNext();
  }

  hidePasswordSheet(e: MouseEvent) {
    this.passwordSheetState = DrawerState.Bottom;
  }

  passwordsMatch() {
    // TODO: more check such as password size and special characters.
    return this.password == this.passwordConfirmation;
  }

  canSave() {
    return this.password != "" && this.passwordsMatch();
  }

  async confirmPassword() {
    if (!this.canSave())
      return;
      
    Config.didBeingCreated.password = this.password;

    this.native.go('/newpasswordset');
  }
}
