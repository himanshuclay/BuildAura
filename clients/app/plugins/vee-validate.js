import { defineRule } from 'vee-validate'
export default defineNuxtPlugin(() => {
  defineRule('required', value => {
    if (!value || String(value).trim() === '') {
      return 'This field is mandatory 🚨';
    }
    return true
  })
})
