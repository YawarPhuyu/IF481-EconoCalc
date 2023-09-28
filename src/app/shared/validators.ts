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

export const patterns: { [key: string]: RegExp } = {
  name: /^[A-Za-z]+\w*$/,
  dictionary_name: /^[A-Za-z0-9]+\w*$/,
  integer_number: /^((\-?[1-9]\d*)|0)$/,
  natural_number: /^[1-9]\d*$/,
  number: /^\-?(((0|([1-9]\d*))\.\d{0,3}[1-9])|([1-9]\d*))$/,
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
  integer_number: {
    options_list: null,
    validators: [
      (control: AbstractControl): ValidationErrors | null => {
        if(!control.value) return null;
        let control_value = control.value.toString();
        let reg: RegExp = patterns['integer_number'];
        let match = reg.test(control_value);
  
        if(match)
          return null;
  
        let errors: { [key: string]: any } = {};

        // Check for a plus sign at the start
        reg = /^\+/;
        match = reg.test(control_value);
  
        if(match)
          errors['start_with_plus_sign'] = { translate_key: "CLASS_VALIDATION.NUMBER.START_WITH_PLUS_SIGN" };
  
        // Check for innecesary zeros at the right
        reg = /^(\+|\-)?0+[1-9]/;
        match = reg.test(control_value);
  
        if(match)
          errors['unnecessary_zeros'] = { translate_key: "CLASS_VALIDATION.NUMBER.UNNECESSARY_ZEROS" };

        // Check for decimals
        reg = /\.\d*$/;
        match = reg.test(control_value);
  
        if(match)
          errors['have_decimals'] = { translate_key: "CLASS_VALIDATION.INTEGER_NUMBER.DECIMALS" };

        // No specific error detected
        if(Object.keys(errors).length === 0)
          errors['bad_format'] = {translate_key: "CLASS_VALIDATION.INTEGER_NUMBER.BAD_FORMAT"};
  
        return errors;
      }
    ]
  },
  natural_number: {
    options_list: null,
    validators: [
      (control: AbstractControl): ValidationErrors | null => {
        if(!control.value) return null;
        let control_value = control.value.toString();
        let reg: RegExp = patterns['natural_number'];
        let match = reg.test(control_value);
  
        if(match)
          return null;
  
        let errors: { [key: string]: any } = {};
  
        // Check for a plus sign at the start
        reg = /^\+/;
        match = reg.test(control_value);
  
        if(match)
          errors['start_with_plus_sign'] = { translate_key: "CLASS_VALIDATION.NUMBER.START_WITH_PLUS_SIGN" };
  
        // Check for unnecesary zeros at the right
        reg = /^(\+|\-)?0+[1-9]/;
        match = reg.test(control_value);
  
        if(match)
          errors['unnecessary_zeros'] = { translate_key: "CLASS_VALIDATION.NUMBER.UNNECESSARY_ZEROS" };

        // Check for decimals
        reg = /\.\d*$/;
        match = reg.test(control_value);
  
        if(match)
          errors['have_decimals'] = { translate_key: "CLASS_VALIDATION.NATURAL_NUMBER.DECIMALS" };

        // Equal zero check
        reg = /^0+$/;
        match = reg.test(control_value);
  
        if(match)
          errors['is_zero'] = { translate_key: "CLASS_VALIDATION.NATURAL_NUMBER.ZERO" };

        // Negative check
        reg = /^\-/;
        match = reg.test(control_value);
  
        if(match)
          errors['is_negative'] = { translate_key: "CLASS_VALIDATION.NATURAL_NUMBER.NEGATIVE" };

        // No specific error detected
        if(Object.keys(errors).length === 0)
          errors['bad_format'] = {translate_key: "CLASS_VALIDATION.NATURAL_NUMBER.BAD_FORMAT"};
  
        return errors;
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
  
        // Check for too much decimals
        reg = /\.\d{4,}$/;
        match = reg.test(control_value);
  
        if(match)
          errors['too_much_decimals'] = { translate_key: "CLASS_VALIDATION.NUMBER.TOO_MUCH_DECIMALS" };
  
        // Check for a plus sign at the start
        reg = /^\+/;
        match = reg.test(control_value);
  
        if(match)
          errors['start_with_plus_sign'] = { translate_key: "CLASS_VALIDATION.NUMBER.START_WITH_PLUS_SIGN" };
  
        // Check for innecesary zeros at the right
        reg = /(^(\+|\-)?0+[1-9])|(\.\d*0+$)/;
        match = reg.test(control_value);
  
        if(match)
          errors['unnecessary_zeros'] = { translate_key: "CLASS_VALIDATION.NUMBER.UNNECESSARY_ZEROS" };

        // No specific error detected
        if(Object.keys(errors).length === 0)
          errors['bad_format'] = {translate_key: "CLASS_VALIDATION.NUMBER.BAD_FORMAT"};
  
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