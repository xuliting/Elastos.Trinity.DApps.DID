import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { PopoverController } from '@ionic/angular';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
})
export class DeleteComponent implements OnInit {

  constructor(
    public profileService: ProfileService,
    public theme: ThemeService,
    private popover: PopoverController
  ) { }

  ngOnInit() {}

  cancel() {
    this.popover.dismiss();
  }

  confirmDeleteDID() {
    this.popover.dismiss();
    this.profileService.confirmDeleteDID();
  }
}
