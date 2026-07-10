import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import InputField from '../../components/ui/InputField.jsx';
import Logo from '../../components/ui/Logo.jsx';
import { getApiErrorMessage, loginUser, saveAuthSession } from '../../services/api.js';

const initialValues = {
  email: '',
  password: '',
  remember: false
};

function LoginPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function validate() {
    const nextErrors = {};
    if (!values.email.trim()) nextErrors.email = 'Email is required.';
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = 'Enter a valid email.';
    if (!values.password) nextErrors.password = 'Password is required.';
    if (values.password && values.password.length < 6) nextErrors.password = 'Use at least 6 characters.';
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setMessage('');

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);

      try {
        const result = await loginUser({
          email: values.email.trim(),
          password: values.password
        });
        saveAuthSession(result.data, values.remember);
        navigate('/dashboard');
      } catch (error) {
        setMessage(getApiErrorMessage(error, 'Login failed. Please check your email and password.'));
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function handleForgotPassword(event) {
    event.preventDefault();

    if (!values.email.trim()) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        email: 'Enter your email before requesting a reset.'
      }));
      setMessage('');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        email: 'Enter a valid email.'
      }));
      setMessage('');
      return;
    }

    setErrors((currentErrors) => ({ ...currentErrors, email: '' }));
    setMessage(`Password reset is not connected yet for ${values.email}.`);
  }

  return (
    <AuthLayout
      reverse
      title="Streamline your academic collaboration"
      subtitle="Track assignments, tasks, deadlines, and group progress with a calm student-focused dashboard."
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#139f98]">Welcome back</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to manage your groups, tasks, and deadlines.</p>

        <div className="mt-8 grid gap-4">
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
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
            placeholder="Enter your password"
            value={values.password}
            error={errors.password}
            onChange={(event) => {
              setValues({ ...values, password: event.target.value });
              setErrors({ ...errors, password: '' });
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={values.remember}
              onChange={(event) => setValues({ ...values, remember: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-[#073ca6]"
            />
            Remember me
          </label>
          <button type="button" onClick={handleForgotPassword} className="font-bold text-[#073ca6] hover:underline">
            Forgot Password?
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
            {message}
          </p>
        )}

        <Button type="submit" className="mt-6 w-full">
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to GAMS?{' '}
          <Link to="/signup" className="font-black text-[#073ca6] hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
