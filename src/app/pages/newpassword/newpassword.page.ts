import { Component, OnInit } from '@angular/core';
import { DIDService } from 'src/app/services/did.service';
import { NewDID } from 'src/app/model/newdid.model';
import { Native } from 'src/app/services/native';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-newpassword',
  templateUrl: './newpassword.page.html',
  styleUrls: ['./newpassword.page.scss'],
})
export class NewpasswordPage implements OnInit {

  public password: string = null;

  constructor(
    private didService: DIDService,
    private authService: AuthService,
    private native: Native,
    public theme: ThemeService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.HOME);
  }

  async createIdentity() {
    this.didService.didBeingCreated = new NewDID();
    this.password = await this.authService.promptNewPassword();

    if (this.password !== null) {
      this.didService.didBeingCreated.password = this.password;
      await this.didService.addDidStore();
    }
  }

  createProfile() {
    this.native.go('/editprofile', { create: true });
  }
}
