import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class ValidatorsService {
  static getPattern(parameter: string): RegExp {
    parameter = parameter.trim().toLowerCase();
    return patterns[parameter];
  }

  static getClassValidation(class_name: string): { options_list: string[] | null, validators: ValidatorFn[] | null } | null {
    let class_validation = ClassValidations[class_name.trim().toLowerCase()];

    if(!class_validation)
      return null;
    else
      return class_validation;
  }
}

// interface Patterns {
//   name: RegExp;
//   dictionary_name: RegExp;
//   number: RegExp;
//   integer: RegExp;
//   boolean: RegExp;
//   string: RegExp;
// }

export const patterns: { [key: string]: RegExp} = {
  name: /^[A-Za-z]+\w*$/,
  dictionary_name: /^[A-Za-z0-9]+\w*$/,
  number: /^\-?(((0|([1-9]\d*))\.\d*[1-9])|([1-9]\d*))$/,
  integer: /^\-?[1-9]\d*$/,
  boolean: /^false|true$/i,
  // string: /.*/,
  string: new RegExp('^[^\"\'\`\\\$\#\~\@\Ø\,\!\=\&\%]*$'),
} as const;

export const ClassValidations: { [key: string]: {options_list: string[] | null, validators: ValidatorFn[] | null} } = {
  boolean: {
    options_list: ['True', 'False'],
    validators: null
  },
  datetime: {
    options_list: null,
    validators: null
  },
  dictionary_name: {
    options_list: null,
    validators:
    [
      (control: AbstractControl): ValidationErrors | null => {
        if(!control.value) return null;
        let match = patterns['dictionary_name'].test(control.value.toString());
        return (!match)? { bad_dictionary_name: { translate_key: "CLASS_VALIDATION.DICTIONARY.BAD_NAME" }}: null;
      }
    ]
  },
  number:{
    options_list: null,
    validators:
    [
      (control: AbstractControl): ValidationErrors | null => {
        if(!control.value) return null;
        let control_value = control.value.toString();
        let reg: RegExp = patterns['number'];
        let match = reg.test(control_value);
  
        if(match)
          return null;
  
        let errors: { [key: string]: any } = {};
        errors['bad_format'] = {translate_key: "CLASS_VALIDATION.NUMBER.BAD_FORMAT"};
  
        // Check for too much decimals
        // reg = /\.\d{3,}$/;
        // match = reg.test(control_value);
  
        // if(match)
        //   errors['too_much_decimals'] = { translate_key: "CLASS_VALIDATION.NUMBER.TOO_MUCH_DECIMALS" };
  
        // Check for a plus sign at the start
        reg = /^\+/;
        match = reg.test(control_value);
  
        if(match)
          errors['start_with_plus_sign'] = { translate_key: "CLASS_VALIDATION.NUMBER.START_WITH_PLUS_SIGN" };
  
        // Check for innecesary zeros at the right
        reg = /^((\+|\-)?0+)|(\.\d*0+)$/;
        match = reg.test(control_value);
  
        if(match)
          errors['unnecessary_zeros'] = { translate_key: "CLASS_VALIDATION.NUMBER.UNNECESSARY_ZEROS" };
  
        return errors;
      }
    ]
  },
  string: {
    options_list: null,
    validators:
    [
      (control: AbstractControl): ValidationErrors | null => {
        if(!control.value) return null;
        let match = patterns['string'].test(control.value.toString());
        return (!match)? { bad_format: { translate_key: "CLASS_VALIDATION.STRING.BAD_FORMAT" }}: null;
      }
    ]
  },
  rule_object_type: {
    options_list: ['String', 'Number', 'Datetime', 'Boolean'],
    validators: null
  }
};