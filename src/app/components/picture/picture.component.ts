import { Component, OnInit, NgZone } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss'],
})
export class PictureComponent implements OnInit {

  public image = "";

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private zone: NgZone,
    public profileService: ProfileService
  ) {
  }

  ngOnInit() {}

  takePicture() {
    const options = {
      quality: 100,
      destinationType: 0,
      encodingType: 0,
      mediaType:0
    };

    navigator.camera.getPicture((imageData) => {
      this.zone.run(() => {
        this.profileService.profileImage = 'data:image/png;base64,' + imageData;
      });
    }, ((err) => {
      console.error(err);
    }), options);
  }

  photoLibrary() {

  }

  submit(useImg: boolean) {
    this.modalCtrl.dismiss({
      useImg: useImg
    });
  }

  cancel() {
    this.profileService.profileImage = null;
  }
}
