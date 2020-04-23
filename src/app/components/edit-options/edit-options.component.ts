import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-edit-options',
  templateUrl: './edit-options.component.html',
  styleUrls: ['./edit-options.component.scss'],
})
export class EditOptionsComponent implements OnInit {

  @Output() cancelEvent = new EventEmitter<boolean>();

  constructor(
    private popover: PopoverController,
    private navParams: NavParams,
    public translate: TranslateService,
    public theme: ThemeService,
    public profileService: ProfileService
  ) { }

  ngOnInit() {
  }

  ionViewWillLeave() {
    this.popover.dismiss();
  }
}
