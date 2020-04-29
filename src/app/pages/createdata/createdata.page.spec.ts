import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedataPage } from './createdata.page';

describe('CreatedataPage', () => {
  let component: CreatedataPage;
  let fixture: ComponentFixture<CreatedataPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatedataPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatedataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
