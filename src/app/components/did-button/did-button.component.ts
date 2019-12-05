import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'did-button',
    templateUrl: './did-button.component.html',
    styleUrls: ['./did-button.component.scss'],
})
export class DIDButtonComponent implements OnInit {
    @Input('title') title: string = "Button";
    @Input('textcolor') textcolor: string = "#FFFFFF";
    @Input('bgcolor') bgcolor: string = "#444444";
    @Input('bordercolor') bordercolor: string = "#444444";
    @Input('shadow') shadow: boolean = true;

    constructor() { 
    }

    ngOnInit() { }
}
