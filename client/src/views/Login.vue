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
      email: '',
      password: '',
    }
  },
});

const handleLogin = handleSubmit(async (values) => {
  try {
    const response = await axios.get(`${ENV.API}/api/superAdmin/login`, {
      params: {
        ...values.company
      }
    });
    toast.success(response.data.message);
    router.push('/superAdmin/dashboard');
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
        <h2>Login</h2>
        <form @submit="handleLogin">
          <div class="row">
            <div class="col-lg-6">
              <label>Company Email*</label>
              <Field name="company.email" type="email" placeholder="Enter your company email" :rules="'required|email'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.email'] }" />
              <ErrorMessage name="company.email" class="text-danger" />
            </div>
            <div class="col-lg-6">
              <label>Company Password*</label>
              <Field name="company.password" type="password" placeholder="Enter your company password"
                :rules="'required|password'"
                :class="{ 'form-control': true, 'is-invalid': !!errors['company.password'] }" />
              <ErrorMessage name="company.password" class="text-danger" />
            </div>
          </div>
          <button type="submit">Login</button>
        </form>

        <p class="footer-text">
          Already have an account?
          <router-link to="/signup">SignUp here</router-link>
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