import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';
import { Config } from '../../services/config';
import { Native } from '../../services/native';
import { Util } from '../../services/util';

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['editprofile.scss']
})
export class EditProfilePage {
  public fullname: String = "";
  public email: String = "";
  public phonenumber: String = "";
  public gender: String = "";
  public birthday: String = "";
  public area: String = "";

  constructor(public navCtrl: NavController, private didService: DIDService, private native: Native) {
  }

  next() {
    if(this.checkParms()){
      console.log("EditProfilePage");
      Config.profile.fullname = this.fullname;
      Config.profile.email = this.email;
      Config.profile.phonenumber = this.phonenumber;
      Config.profile.gender = this.gender;
      Config.profile.birthday = this.birthday.split("T")[0];
      Config.profile.area = this.area;

      this.native.go("/myprofile", {});
    }
  }

  checkParms(){
    if(Util.isNull(this.fullname)){
      this.native.toast_trans('text-full-name');
      return false;
    }
    return true;
  }
  // async createIdentity() {
  //   this.creatingIdentity = true;
  //   await this.didService.createIdentity();

  // }
}
