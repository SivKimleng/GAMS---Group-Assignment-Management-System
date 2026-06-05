import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import InputField from '../../components/ui/InputField.jsx';
import Logo from '../../components/ui/Logo.jsx';
import { saveMockSession } from '../../utils/mockAuth.js';

const initialValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
};

function SignUpPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function validate() {
    const nextErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!values.email.trim()) nextErrors.email = 'Email is required.';
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = 'Enter a valid email.';
    if (!values.password) nextErrors.password = 'Password is required.';
    if (values.password && values.password.length < 6) nextErrors.password = 'Use at least 6 characters.';
    if (!values.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    if (values.confirmPassword && values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      const trimmedName = values.fullName.trim();
      saveMockSession({
        firstName: trimmedName.split(' ')[0] || 'Demo',
        fullName: trimmedName,
        email: values.email.trim()
      });
      navigate('/dashboard');
    }
  }

  return (
    <AuthLayout
      title="Empowering academic excellence through structure"
      subtitle="Create your student workspace and organize group responsibilities from day one."
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#139f98]">Start organized</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Use your university email to join or create assignment groups.</p>

        <div className="mt-8 grid gap-4">
          <InputField
            label="Full Name"
            type="text"
            placeholder="Your full name"
            value={values.fullName}
            error={errors.fullName}
            onChange={(event) => {
              setValues({ ...values, fullName: event.target.value });
              setErrors({ ...errors, fullName: '' });
            }}
          />
          <InputField
            label="Email"
            type="email"
            placeholder="student@university.edu"
            value={values.email}
            error={errors.email}
            onChange={(event) => {
              setValues({ ...values, email: event.target.value });
              setErrors({ ...errors, email: '' });
            }}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Create a password"
            value={values.password}
            error={errors.password}
            onChange={(event) => {
              setValues({ ...values, password: event.target.value });
              setErrors({ ...errors, password: '', confirmPassword: '' });
            }}
          />
          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => {
              setValues({ ...values, confirmPassword: event.target.value });
              setErrors({ ...errors, confirmPassword: '' });
            }}
          />
        </div>

        <Button type="submit" className="mt-6 w-full">
          Sign Up
        </Button>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-black text-[#073ca6] hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignUpPage;
