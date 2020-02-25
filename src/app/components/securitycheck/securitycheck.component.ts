import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, IonInput } from '@ionic/angular';

import { Native } from '../../services/native';
import { AdvancedPopupController } from '../advanced-popup/advancedpopup.controller';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { DIDService } from 'src/app/services/did.service';

@Component({
  selector: 'securitycheck',
  templateUrl: './securitycheck.component.html',
  styleUrls: ['./securitycheck.component.scss'],
})
export class SecurityCheckComponent implements OnInit {
  @ViewChild('pwd',{static:false}) pwd: IonInput;

  public password: string = "";
  public previousPasswordWasWrong: boolean = false;
  public useFingerprintAuthentication: boolean = false;
  public fingerprintPluginAuthenticationOnGoing: boolean = false;
  public fingerprintAuthenticationIsAvailable: boolean = false;

  constructor(public modalCtrl: ModalController,
              public native: Native,
              private advancedPopup: AdvancedPopupController,
              private translate: TranslateService,
              private authService: AuthService,
              private didService: DIDService) {
  }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.fingerprintAuthenticationIsAvailable = await this.authService.fingerprintIsAvailable();
    if (!this.previousPasswordWasWrong && this.fingerprintAuthenticationIsAvailable)
      this.useFingerprintAuthentication = await this.authService.fingerprintAuthenticationEnabled(this.didService.getCurDidStoreId());
    else {
      // In case previous authentication attempt was wrong, stop using fingerprint. Maybe user provided a wrong
      // password earlier while registering his fingerprint.
      this.useFingerprintAuthentication = false;
    }
  }

  ionViewDidEnter() {
    if (this.pwd)
      this.pwd.setFocus();
  }

  close() {
    this.modalCtrl.dismiss(null);
  }

  submit() {
    this.modalCtrl.dismiss({
      password: this.password
    });
  }

  promptFingerprintActivation() {
    this.advancedPopup.create({
      color:'var(--ion-color-primary)',
      info: {
          picture: '/assets/images/Visibility_Icon.svg',
          title: this.translate.instant("activate-fingerprint-popup-title"),
          content: this.translate.instant("activate-fingerprint-popup-content")
      },
      prompt: {
          title: this.translate.instant("activate-fingerprint-popup-confirm-question"),
          confirmAction: this.translate.instant("activate-fingerprint-activate"),
          cancelAction: this.translate.instant("go-back"),
          confirmCallback: async ()=>{
            this.fingerprintPluginAuthenticationOnGoing = true;

            // User agreed to activate fingerprint authentication. We ask the auth service to
            // save the typed password securely using the fingerprint.
            let couldActivate = await this.authService.activateFingerprintAuthentication(this.didService.getCurDidStoreId(), this.password);
            this.useFingerprintAuthentication = couldActivate;

            if (couldActivate) {
              this.fingerprintPluginAuthenticationOnGoing = false;

              // Right after activation, submit the typed password as password to use.
              this.submit();
            }
            else {
              // Failed to activate
            }
          }
      }
    }).show();
  }

  async promptFingerprintAuthentication() {
    this.fingerprintPluginAuthenticationOnGoing = true;
    this.password = await this.authService.authenticateByFingerprintAndGetPassword(this.didService.getCurDidStoreId());
    if (this.password) {
      // Get a password -> submit this password.
      this.submit();
    }
    else {
      // Only change UI if fingerprint prompt was cancelled or errored, to avoid UI glitch
      // while the password popup closes.
      this.fingerprintPluginAuthenticationOnGoing = false;
    }
  }

  async disableFingerprintAuthentication() {
    this.useFingerprintAuthentication = false;

    await this.authService.deactivateFingerprintAuthentication(this.didService.getCurDidStoreId());
  }

  canPromptFingerprint() {
     return (this.password != "") && this.fingerprintAuthenticationIsAvailable;
  }
}
