import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../services/profile.model';
import { Native } from '../../services/native';
import { Util } from '../../services/util';

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['editprofile.scss']
})
export class EditProfilePage {
  public birthday: String = "";
  public isEdit: boolean = false;
  public hasArea:boolean = false;

  public profile: Profile = {
    name:"",
    birthday:"",
    gender:"",
    area:"",
    email:"",
    IM:"",
    phone:"",
    ELAAddress:"",
  };

  constructor(public route: ActivatedRoute,
              public zone: NgZone,
              public events: Events,
              public navCtrl: NavController,
              private native: Native) {
    this.route.queryParams.subscribe((data) => {
      if (data['create'] == 'false') {
        this.profile = Config.didStoreManager.getProfile();
        this.hasArea = !Util.isNull(this.profile.area);
        this.isEdit = true;
      }
    });
  }

  selectArea() {
    this.events.subscribe('selectarea', (params) => {
      this.zone.run(() => {
        this.profile.area = params.en;//TODO
      });
      this.events.unsubscribe('selectarea');
    });
    this.native.go("/area");
  }

  next() {
    if(this.checkParms()){
      this.profile.birthday = this.birthday.split("T")[0];
      Config.didStoreManager.saveProfile(this.profile);
      this.native.go("/myprofile", {create: !this.isEdit});
    }
  }

  checkParms(){
    if(Util.isNull(this.profile.name)){
      this.native.toast_trans('text-full-name');
      return false;
    }
    return true;
  }
}
