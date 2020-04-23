import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile-options',
  templateUrl: './profile-options.component.html',
  styleUrls: ['./profile-options.component.scss'],
})
export class ProfileOptionsComponent implements OnInit {

  @Output() cancelEvent = new EventEmitter<boolean>();

  options: string = '';

  constructor(
    private popover: PopoverController,
    private navParams: NavParams,
    public translate: TranslateService,
    public theme: ThemeService,
    public profileService: ProfileService
  ) { }

  ngOnInit() {
    this.options = this.navParams.get('options');
    console.log('Options ', this.options);
  }

  ionViewWillLeave() {
    this.popover.dismiss();
  }

  deleteDID() {
    this.profileService.deleteDID();
    this.popover.dismiss();
  }
}
