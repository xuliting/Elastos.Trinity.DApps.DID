import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Profile } from 'src/app/model/profile.model';

@Component({
    selector: 'active-did',
    templateUrl: './active-did.component.html',
    styleUrls: ['./active-did.component.scss'],
})
export class ActiveDIDComponent implements OnInit {
    @Input('profile') profile: Profile = new Profile();

    constructor() { 
    }

    ngOnInit() { }
}
