import { Component, OnInit } from '@angular/core';
import { DIDService } from 'src/app/services/did.service';
import { Util } from 'src/app/services/util';
import { NewDID } from 'src/app/model/newdid.model';
import { Native } from 'src/app/services/native';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Router } from '@angular/router';
import { UXService } from 'src/app/services/ux.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-newpassword',
  templateUrl: './newpassword.page.html',
  styleUrls: ['./newpassword.page.scss'],
})
export class NewpasswordPage implements OnInit {

  public password: string = null;
  public isfirst = false;

  constructor(
    public router: Router,
    private didService: DIDService,
    private authService: AuthService,
    private uxService: UXService,
    private native: Native,
    public theme: ThemeService
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
      if (!Util.isEmptyObject(navigation.extras.state)) {
        this.isfirst = false;
      }
  }

  ionViewWillEnter() {
    this.uxService.makeAppVisible();
    titleBarManager.setTitle('Identity');
    if(this.isfirst) {
      titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.HOME);
    } else {
      this.uxService.setTitleBarBackKeyShown(true);
    }
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
