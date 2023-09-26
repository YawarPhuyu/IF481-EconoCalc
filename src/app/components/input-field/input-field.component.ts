import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { ValidatorsService } from 'src/app/shared/validators';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: InputFieldComponent
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: InputFieldComponent
    }
  ]
})
export class InputFieldComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  @Input() required: boolean = false;
  @Input() icon?: string;
  @Input() hint?: string;
  @Input() label?: string;
  @Input() type: string = "";
  @Input() extra_validation?: ValidatorFn[] | ValidatorFn;
  @Input() option_list?: string[] | null;
  @Input() place_holder: string = "";

  translate_sub$?: Subscription;
  update_errors_sub$?: Subscription;

  user_input: any = null;
  disabled: boolean = false;
  focused: boolean = false;
  input_type: string = "";
  validators: ValidatorFn[] = [];

  errors_tooltip: string = "";
  private errors_obj$: Subject<ValidationErrors> = new Subject<ValidationErrors>();

  onChange!: (user_input: string) => {};
  onTouched!: () => {};

  constructor(
    private translate: TranslateService
  ){

  }
  
  ngOnInit(): void {
    // this.visible_input_fields_svc.registerInputField(this);
    this.input_type = this.checkType(this.type);

    let class_validation = ValidatorsService.getClassValidation(this.type);

    if(class_validation) {
      if(!this.option_list){
        this.option_list = class_validation.options_list;
      }
      this.validators = this.getValidators(class_validation.validators);
    }
    else{
      this.validators = this.getValidators();
    }
    
    this.errors_obj$ = new Subject<ValidationErrors>();
    this.update_errors_sub$ = this.errors_obj$.asObservable().subscribe(this.updateErrorTooltip);
  }

  ngOnDestroy(): void {
    
    this.translate_sub$?.unsubscribe();
    this.update_errors_sub$?.unsubscribe();
    // this.visible_input_fields_svc.discardInputField(this);
  }

  writeValue(obj: any): void {
    if(obj)
      this.user_input = obj.toString();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  getValidators(class_validators?: ValidatorFn[] | null): ValidatorFn[] {
    let validators: ValidatorFn[] = [];

    if(this.required)
      validators.push(Validators.required);

    if(class_validators)
      validators.push(...class_validators);

    if(this.extra_validation){
      if(Array.isArray(this.extra_validation))
        validators.push(...this.extra_validation);
      else
        validators.push(this.extra_validation);
    }

    return validators;
  }

  validate(control: AbstractControl): ValidationErrors {
    let errors_obj = {};

    for(let validation of this.validators) {
      let result = validation(control);

      if(result) {
        errors_obj = {...errors_obj, ...result};
      }
    }

    this.errors_obj$.next(errors_obj);

    return errors_obj;
  }

  updateErrorTooltip = (errors_obj: ValidationErrors) => {
    if(Object.keys(errors_obj).length === 0){
      this.errors_tooltip = "";
      return;
    }

    let errors_translate_keys: Array<string> = new Array<string>();

    for(let error in errors_obj) {
      if(typeof errors_obj[error] === 'object')
        errors_translate_keys.push(errors_obj[error]['translate_key']);
      else
        errors_translate_keys.push(`CLASS_VALIDATION.GENERAL.FIELD_${error.toUpperCase()}`)
    }

    this.errors_tooltip = "";
    this.translate_sub$?.unsubscribe();
    this.translate_sub$ = this.translate.get(errors_translate_keys).subscribe((values) => {
      this.errors_tooltip = (Object.values(values) as Array<string>).join('\n');
    });
  }

  checkType(type: string | undefined): string {
    if(!type) return "text";

    type = type.toLowerCase();
    switch(type) {
      case 'datetime' : return 'datetime-local';
      case 'integer' : return 'number';
      case 'button' : return 'button';
      case 'checkbox' : return 'checkbox';
      case 'color' : return 'color';
      case 'date' : return 'date';
      case 'datetime' : return 'datetime';
      case 'email' : return 'email';
      case 'file' : return 'file';
      case 'hidden' : return 'hidden';
      case 'image' : return 'image';
      case 'month' : return 'month';
      case 'password' : return 'password';
      case 'radio' : return 'radio';
      case 'range' : return 'range';
      case 'reset' : return 'reset';
      case 'search' : return 'search';
      case 'submit' : return 'submit';
      case 'tel' : return 'tel';
      case 'time' : return 'time';
      case 'url' : return 'url';
      case 'week' : return 'week';
      default: return 'text';
    }
  }
}
