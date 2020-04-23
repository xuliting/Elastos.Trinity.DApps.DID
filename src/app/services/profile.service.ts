import { Injectable } from '@angular/core';
import { Native } from './native';
import { PopoverController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  public editingVisibility: boolean = false;

  constructor(
    private popover: PopoverController,
    private native: Native,
  ) { }

  editProfile() {
    this.editingVisibility = false;
    this.popover.dismiss();
    this.native.go("/editprofile", { create: false });
  }

  editVisibility() {
    this.editingVisibility = !this.editingVisibility;
  }
}
