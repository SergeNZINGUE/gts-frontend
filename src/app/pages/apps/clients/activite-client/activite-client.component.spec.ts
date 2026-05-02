import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiviteClientComponent } from './activite-client.component';

describe('ActiviteClientComponent', () => {
  let component: ActiviteClientComponent;
  let fixture: ComponentFixture<ActiviteClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiviteClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiviteClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
