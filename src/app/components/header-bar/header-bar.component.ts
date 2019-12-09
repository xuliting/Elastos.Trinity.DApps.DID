import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UXService } from '../../services/ux.service';
import { Native } from 'src/app/services/native';

@Component({
    selector: 'header-bar',
    templateUrl: './header-bar.component.html',
    styleUrls: ['./header-bar.component.scss'],
})
export class HeaderBarComponent implements OnInit {
    public back_touched = false;

    @Input('title') title: string = "";
    @Input('showBack') showBack: boolean = false;
    @Input('showMinimize') showMinimize: boolean = true;
    @Input('showClose') showClose: boolean = true;
    @Input('showMenu') showMenu: boolean = false;
    @Input('transparent') transparent: boolean = false;
    // @Output('onMenu') onMenu = new EventEmitter();

    constructor(public uxService: UXService, private native: Native) { }

    ngOnInit() { }

    minimize() {
        this.uxService.minimize();
    }

    close() {
        this.uxService.close()
    }

    navBack() {
        this.native.pop();
    }
}
