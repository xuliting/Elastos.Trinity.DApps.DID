import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { DIDStore } from 'src/app/model/didstore.model';
import { DIDService } from 'src/app/services/did.service';

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['editprofile.scss']
})
export class EditProfilePage {
  public birthday: String = "";
  public isEdit: boolean = false;
  public hasArea:boolean = false;

  public editedStore: DIDStore;
  public profile: Profile;

  constructor(public route: ActivatedRoute,
              public zone: NgZone,
              public events: Events,
              public navCtrl: NavController,
              private didService: DIDService,
              private native: Native) {
    this.route.queryParams.subscribe((data) => {
      console.log("Entering EditProfile page");

      if (data['create'] == 'false') {
        console.log("Editing an existing profile");

        // Edition - We clone the received profile in case user wants to cancel editing.
        this.profile = Profile.fromProfile(Config.didStoreManager.getActiveDidStore().getBasicProfile());
        this.hasArea = !Util.isNull(this.profile.area);
        this.isEdit = true;
      }
      else {
        console.log("Editing a new profile");

        // Creation
        this.editedStore = new DIDStore(this.didService, this.events);
        this.profile = new Profile();
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

  async next() {
    if(this.checkParms()){
      this.profile.birthday = this.birthday.split("T")[0];

      if (this.isEdit) { // If edition mode, go back to my profile after editing.
        await this.editedStore.writeProfile(this.profile); // Update profile/credentials
        this.native.go("/profile/myprofile", {create: !this.isEdit});
      }
      else { // If creation mode, go to backup did flow.
        Config.didBeingCreated.profile = this.profile; // Save filled profile for later.
        this.native.go("/backupdid");
      }
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
