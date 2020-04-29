import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewpasswordPage } from './newpassword.page';

describe('NewpasswordPage', () => {
  let component: NewpasswordPage;
  let fixture: ComponentFixture<NewpasswordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewpasswordPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewpasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
