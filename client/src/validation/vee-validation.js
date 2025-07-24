// src/validation/vee-validate-rules.ts
import { defineRule } from 'vee-validate'
import { email, min, max, confirmed } from '@vee-validate/rules'
import VEE_VALIDATION_MESSAGE from '@/constant/vee-validation.message';

export function registerValidationRules() {
    defineRule('required', (value) => {
        if (!value || value.trim() === '') {
            return VEE_VALIDATION_MESSAGE.THIS_FIELD_IS_REQUIRED;
        }
        return true;
    });
    defineRule('email', email)
    defineRule('min', min)
    defineRule('max', max)
    defineRule('confirmed', confirmed)
    defineRule('phone', (value) => {
        const phoneRegex = /^\d{10}$/;
        if (!value || !phoneRegex.test(value)) {
            return VEE_VALIDATION_MESSAGE.PLEASE_ENTER_A_VALID_TEN_DIGIT_NUMBER;
        }
        return true;
    });
    defineRule('zipCode', (value) => {
        const zipCodePattern = /^[0-9]{5}(?:-[0-9]{4})?$/;
        if (!zipCodePattern.test(value)) {
            return VEE_VALIDATION_MESSAGE.INVALID_ZIP_CODE_PLEASE_ENTER_A_VALID_ZIP_CODE;
        }
        return true;
    });
    defineRule('domain', (value) => {
        if (/\s/.test(value)) {
            return VEE_VALIDATION_MESSAGE.THE_NAME_MUST_NOT_CONTAIN_SPACES;
        }
        if (/\d/.test(value)) {
            return VEE_VALIDATION_MESSAGE.THE_NAME_MUST_NOT_CONTAIN_NUMBERS;
        }
        if (!/^[a-zA-Z\-\.]+$/.test(value)) {
            return VEE_VALIDATION_MESSAGE.THE_NAME_MUST_NOT_CONTAIN_LETTERS_HYPHENS_AND_DOTS;
        }
        return true;
    });
    defineRule('password', (value) => {
        if (/\s/.test(value)) {
            return VEE_VALIDATION_MESSAGE.PASSWORD_MUST_NOT_CONTAIN_SPACES;
        }
        if (value.length < 8) {
            return VEE_VALIDATION_MESSAGE.PASSWORD_TOO_SHORT;
        }
        if (!/[A-Z]/.test(value)) {
            return VEE_VALIDATION_MESSAGE.PASSWORD_MUST_CONTAIN_UPPERCASE;
        }
        if (!/[a-z]/.test(value)) {
            return VEE_VALIDATION_MESSAGE.PASSWORD_MUST_CONTAIN_LOWERCASE;
        }
        if (!/\d/.test(value)) {
            return VEE_VALIDATION_MESSAGE.PASSWORD_MUST_CONTAIN_NUMBER;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return VEE_VALIDATION_MESSAGE.PASSWORD_MUST_CONTAIN_SPECIAL_CHARACTERS;
        }
        return true;
    });
}
