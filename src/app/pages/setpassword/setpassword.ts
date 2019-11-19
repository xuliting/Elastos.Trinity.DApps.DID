import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Config } from '../../services/config';
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
    Config.didStoreManager.addDidStore(this.password);
    this.native.go('/editprofile', {create: true});
  }
}
