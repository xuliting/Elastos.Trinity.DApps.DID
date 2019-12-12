import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController, IonInput } from '@ionic/angular';

import { Config } from '../../services/config';
import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { Util } from '../../services/util';
import { DIDStore } from 'src/app/model/didstore.model';
import { DIDService } from 'src/app/services/did.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { WrongPasswordException } from 'src/app/model/exceptions/wrongpasswordexception.exception';
import { PopupProvider } from 'src/app/services/popup';
import { CountryCodeInfo } from 'src/app/model/countrycodeinfo';
import { area } from '../../../assets/area/area';

@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
  styleUrls: ['editprofile.scss']
})
export class EditProfilePage {
  public birthDate: string = "";
  public isEdit: boolean = false;
  private paramsSubscription: Subscription;

  public editedStore: DIDStore;
  public profile: Profile;

  constructor(public route: ActivatedRoute,
              public zone: NgZone,
              public events: Events,
              public navCtrl: NavController,
              private didService: DIDService,
              private authService: AuthService,
              private popupProvider: PopupProvider,
              private native: Native) {
    this.paramsSubscription = this.route.queryParams.subscribe((data) => {
      console.log("Entering EditProfile page");

      if (data['create'] == 'false') {
        console.log("Editing an existing profile");

        this.editedStore = Config.didStoreManager.getActiveDidStore();
        // Edition - We clone the received profile in case user wants to cancel editing.
        this.profile = Profile.fromProfile(Config.didStoreManager.getActiveDidStore().getBasicProfile());
        this.birthDate = this.profile.birthDate;
        this.isEdit = true;
      }
      else {
        console.log("Editing a new profile");

        // Creation
        this.editedStore = new DIDStore(this.didService, this.events);
        this.profile = new Profile();
      }

      // Unsubscribe to not receive params again when coming back from the "country selection" screen
      // otherwise we would loose our UI state (text inputs).
      this.paramsSubscription.unsubscribe();
    });
  }

  selectArea() {
    this.events.subscribe('selectarea', (params: CountryCodeInfo) => {
      this.zone.run(() => {
        this.profile.nation = params.alpha3;
      });
      this.events.unsubscribe('selectarea');
    });
    this.native.go("/area");
  }

  getDisplayableNation(countryAlpha3) {
    let countryInfo = area.find((a : CountryCodeInfo)=>{
      return countryAlpha3 == a.alpha3;
    })

    if (!countryInfo)
      return null;

    return countryInfo.name;
  }

  /**
   * Move text input focus to the given item
   */
  maybeMoveFocus(element: IonInput, event: KeyboardEvent) {
    if (event.keyCode == 13) {  // Return
      element.setFocus();
    }
  }

  maybeClearFocus(element: IonInput, event: KeyboardEvent) {
    if (event.keyCode == 13) {  // Return
      element.getInputElement().then((el: HTMLInputElement)=>{
        el.blur();
      });
    }
  }
 
  async next() {
    if(this.checkParms()){
      this.profile.birthDate = this.birthDate; //.split("T")[0];

      if (this.isEdit) { // If edition mode, go back to my profile after editing.
        await this.checkPasswordAndWriteProfile();

        // Tell others that DID needs to be refreshed (profile info has changed)
        this.events.publish('did:didstorechanged');
        
        this.navCtrl.pop();
      }
      else { // If creation mode, go to backup did flow.
        Config.didBeingCreated.profile = this.profile; // Save filled profile for later.
        this.native.go("/backupdid", {create: true});
      }
    }
  }

  private async checkPasswordAndWriteProfile(forcePasswordPrompt: boolean = false) {
    // This write operation requires password. Make sure we have this in memory, or prompt user.
    if (forcePasswordPrompt || this.authService.needToPromptPassword(Config.didStoreManager.getCurDidStoreId())) {
      let previousPasswordWasWrong = forcePasswordPrompt;
      await this.authService.promptPasswordInContext(Config.didStoreManager.getCurDidStoreId(), previousPasswordWasWrong);
      // Password will be saved by the auth service.
    }

    try {
      await this.editedStore.writeProfile(this.profile); // Update profile/credentials
    }
    catch (e) {
      console.error(e);
      if (e instanceof WrongPasswordException) {
        // Wrong password provided - try again.
        this.checkPasswordAndWriteProfile(forcePasswordPrompt = true);
      }
      else {
        this.popupProvider.ionicAlert("Save profile error", "Sorry, we are unable to save your edited profile.");
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
