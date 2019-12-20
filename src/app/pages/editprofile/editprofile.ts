import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events, NavController, IonInput } from '@ionic/angular';

import { Profile } from '../../model/profile.model';
import { Native } from '../../services/native';
import { Util } from '../../services/util';
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

        // Edition - We clone the received profile in case user wants to cancel editing.
        this.profile = Profile.fromProfile(this.didService.getActiveDid().getBasicProfile());
        this.birthDate = this.profile.birthDate;
        this.isEdit = true;
      }
      else {
        console.log("Editing a new profile");

        // Creation
        this.profile = new Profile();
      }

      // Unsubscribe to not receive params again when coming back from the "country selection" screen
      // otherwise we would loose our UI state (text inputs).
      this.paramsSubscription.unsubscribe();
    });
  }

  /**
   * Tells if current profile
   */
  isMale() {
    return (!this.profile || this.profile.gender == "" || this.profile.gender == "male")
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
        this.events.publish('did:didchanged');

        this.navCtrl.pop();
      }
      else { // If creation mode, go to backup did flow.
        this.didService.didBeingCreated.profile = this.profile; // Save filled profile for later.

        if (!await this.didService.getActiveDidStore().hasPrivateIdentity())
          this.native.go("/backupdid", {create: true});
        else {
          await this.authService.checkPasswordThenExecute(async ()=>{
            this.didService.didBeingCreated.password = this.authService.getCurrentUserPassword();
            this.native.showLoading('loading-msg').then(() => {
              // Creation mode but no need to create a did store
              this.didService.finalizeDidCreation().then(()=> {
                this.native.hideLoading();
                this.native.go("/home/myprofile", {create: true});
              })
            });
          }, ()=>{
            this.popupProvider.ionicAlert("DID creation error", "Sorry, we are unable to create your DID.");
          });
        }
      }
    }
  }

  // TODO: REPLACE WITH AUTHSERVICE.checkPasswordThenExecute()
  private async checkPasswordAndWriteProfile(forcePasswordPrompt: boolean = false) {
    // This write operation requires password. Make sure we have this in memory, or prompt user.
    if (forcePasswordPrompt || this.authService.needToPromptPassword(this.didService.getActiveDidStore())) {
      let previousPasswordWasWrong = forcePasswordPrompt;
      await this.authService.promptPasswordInContext(this.didService.getActiveDidStore(), previousPasswordWasWrong);
      // Password will be saved by the auth service.
    }

    try {
      // We are editing an existing DID: just ask the DID to save its profile.
      // DID being created are NOT saved here.
      this.native.showLoading('loading-msg').then(() => {
        this.didService.getActiveDid().writeProfile(this.profile, AuthService.instance.getCurrentUserPassword()).then(() => {
            this.native.hideLoading();
          }
        )
      });
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
      this.native.toast_trans('name-is-missing');
      return false;
    }
    return true;
  }
}
