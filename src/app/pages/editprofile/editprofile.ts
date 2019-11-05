import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

import { DIDService } from '../../services/did.service';
import { LocalStorage } from '../../services/localstorage';
import { Native } from '../../services/native';
import { Util } from '../../services/util';

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['editprofile.scss']
})
export class EditProfilePage {
  profile = {};
  public id:String = "";
  public fullname: String = "";
  public email: String = "";
  public phonenumber: String = "";
  public gender: String = "";
  public birthday: String = "";
  public area: String = "";
  isEdit: boolean = false;

  constructor(public navCtrl: NavController, public route: ActivatedRoute,
              private localStorage: LocalStorage, private didService: DIDService, private native: Native) {
    this.route.queryParams.subscribe((data) => {
      console.log("editprofile constructor");
      if (!Util.isEmptyObject(data)) {
        this.localStorage.get('profile').then((val) => {
          if (val) {
            let profile = JSON.parse(val)[data.id];
            this.id = profile.id;//
            this.fullname = profile.fullname;
            this.email = profile.email;
            this.phonenumber = profile.phonenumber;
            this.gender = profile.gender;
            this.birthday = profile.birthday;
            this.area = profile.area;
            this.isEdit = true;
          }
        });
      }
      else {
        // this.id = Util.uuid();
        this.id = "only-profile";//
        this.fullname = "";
        this.email = "";
        this.phonenumber = "";
        this.gender = "";
        this.birthday = "";
        this.area = "";
      }
    });
  }

  next() {
    if(this.checkParms()){
      let profile = {
        id: this.id,
        fullname: this.fullname,
        email: this.email,
        phonenumber: this.phonenumber,
        area: this.area,
        gender: this.gender,
        bitthday: this.birthday.split("T")[0],
      }
      this.localStorage.add('profile', profile).then((val) => {
        this.native.go("/myprofile", {id: this.id});
      });
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
