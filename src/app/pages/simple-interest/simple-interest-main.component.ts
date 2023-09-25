import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-simple-interest-main',
  templateUrl: './simple-interest-main.component.html',
  styleUrls: ['./simple-interest-main.component.scss']
})
export class SimpleInterestMainComponent {

  form_group: FormGroup;

  constructor(
    private fb: FormBuilder,
  ){
    this.form_group = fb.group({
      capital: ['', [Validators.required]],
      interest: ['', [Validators.required]],
      lapses: ['', [Validators.required]],
      lapse_type: ['', [Validators.required]],
    });
  }
}
