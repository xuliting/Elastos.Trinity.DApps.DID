import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';
import { LocalStorage } from '../../services/localstorage';
import { Native } from '../../services/native';

@Component({
  selector: 'page-setpassword',
  templateUrl: 'setpassword.html',
  styleUrls: ['setpassword.scss']
})
export class SetPasswordPage {
  public password: string = "";
  public passwordConfirmation: string = "";

  constructor(public navCtrl: NavController,
      private didService: DIDService,
      private localStorage: LocalStorage,
      private native: Native) {
  }

  passwordsMatch() {
    // TODO: more check such as password size and special characters.
    return (this.password != "" && this.password == this.passwordConfirmation);
  }

  canSave() {
    return this.passwordsMatch();
  }

  confirmPassword() {
    //TODO
    this.localStorage.setPassword(this.password);
    this.didService.initDidStore(this.password);
    this.native.go('/editprofile');
  }
}
