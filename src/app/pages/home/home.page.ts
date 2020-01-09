import { Component, OnInit } from '@angular/core';
import { UXService } from 'src/app/services/ux.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private uxService: UXService) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.uxService.makeAppVisible();
  }
}
