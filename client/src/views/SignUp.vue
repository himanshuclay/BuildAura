<script setup lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from 'axios';
import ENV from '../../config';
import { toast } from 'vue3-toastify';
import { useForm, Field, ErrorMessage } from 'vee-validate';
import MESSAGE from '../constant/message';
import { useRouter } from 'vue-router';

const router = useRouter();
const { handleSubmit, errors } = useForm({
  initialValues: {
    company: {
      name: '',
      email: '',
      mobile: '',
      domain: '',
      color: '#42b983',
      address: {
        street: '',
        country: '',
        state: '',
        zipCode: '',
      }
    }
  },
});

const handleSignUp = handleSubmit(async (values) => {
  try {
    const response = await axios.post(`${ENV.API}/api/superAdmin/signup`, {
      ...values,
    });
    toast.success(response.data.message);
    router.push('/login');
  } catch (err) {
    toast.info(err.response?.data?.message || MESSAGE.SIGNUP_FAILED);
  }
});
</script>

<template>
  <div class="signup-wrapper">
    <!-- Left Side Vector -->
    <div class="illustration">
      <img src="../assets/images/signup1.jpg" alt="SignUp Vector" />
    </div>

    <!-- Right Side Form -->
    <div class="form-section">
      <div class="card">
        <h2>Create an Account</h2>
        <form @submit="handleSignUp">
          <div class="row">
            <div class="col-lg-6">
              <label>Domain*</label>
              <Field name="company.domain" type="text" placeholder="Enter your company domain" :rules="'domain'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.domain'] }" />
              <ErrorMessage name="company.domain" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Name*</label>
              <Field name="company.name" type="text" placeholder="Enter your company name" :rules="'required'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.name'] }" />
              <ErrorMessage name="company.name" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Email*</label>
              <Field name="company.email" type="email" placeholder="Enter your company email" :rules="'required|email'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.email'] }" />
              <ErrorMessage name="company.email" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Mobile*</label>
              <Field name="company.mobile" type="tel" placeholder="Enter your company mobile" :rules="'required|phone'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.mobile'] }" />
              <ErrorMessage name="company.mobile" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Color*</label>
              <Field name="company.color" type="color" placeholder="Enter your color" :rules="'required'"
                id="companyColor" :class="{
                  'form-control': true,
                  'is-invalid': !!errors['company.color'],
                  'custom-color-input': true, // Additional custom styling class
                }" />
              <ErrorMessage name="company.color" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Address Country*</label>
              <Field name="company.address.country" type="text" placeholder="Enter your company address country"
                :rules="'required'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.address.country'] }" />
              <ErrorMessage name="company.address.country" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Address Street*</label>
              <Field name="company.address.street" type="text" placeholder="Enter your company address street"
                :rules="'required'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.address.street'] }" />
              <ErrorMessage name="company.address.street" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Address state*</label>
              <Field name="company.address.state" type="text" placeholder="Enter your company address state"
                :rules="'required'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.address.state'] }" />
              <ErrorMessage name="company.address.state" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Address zipCode*</label>
              <Field name="company.address.zipCode" type="text" placeholder="Enter your company address zipCode"
                :rules="'required|zipCode'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.address.zipCode'] }" />
              <ErrorMessage name="company.address.zipCode" class="text-danger" />
            </div>
            <div class="col-lg-6"></div>
          </div>






          <!-- <label>Password*</label>
          <Field name="password" type="password" placeholder="Enter your password" :rules="'required|min:5'"
            :class="{ 'form-control': true, 'is-invalid': !!errors.password }" />
          <ErrorMessage name="password" class="text-danger" />

          <label>Confirm Password</label>
          <Field name="confirmPassword" type="password" placeholder="Enter your confirm password"
            :rules="'required|min:5'" :class="{ 'form-control': true, 'is-invalid': !!errors.confirmPassword }" />
          <ErrorMessage name="confirmPassword" class="text-danger" />  -->



          <button type="submit">Sign Up</button>
        </form>

        <p class="footer-text">
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>


<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 1rem;
}

.card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  border: unset
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #007bff;
}

button {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.success {
  color: green;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.footer-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.is-invalid {
  border-color: red !important;
  background-color: #fff0f0;
}

.text-danger {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.signup-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
  flex-wrap: wrap;
}

.illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eef2ff;
  padding: 2rem;
}

.illustration img {
  max-width: 100%;
  height: auto;
}

.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #fff;
}

/* Reuse your existing .card, input, button, etc. */

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  font-size: 0.95rem;
  transition: border 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.form-control::placeholder {
  color: #9ca3af;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  margin-top: 1rem;
  color: #374151;
  font-size: 0.95rem;
}

button {
  margin-top: 1.75rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background-color: #6366f1;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #4f46e5;
}

.custom-color-input {
  /* Adjust size of the color input */
  height: 50px;
  /* Adjust height of the color input */
  padding: 0;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.custom-color-input:focus {
  outline: none;
  border-color: #007bff;
  /* Blue border on focus */
}

/* Optional: Add more custom styles to enhance appearance */
.custom-color-input:invalid {
  border-color: red;
  /* Highlight invalid field */
}

/* Responsive padding for the form */
.container {
  max-width: 600px;
  margin: 0 auto;
}
</style>