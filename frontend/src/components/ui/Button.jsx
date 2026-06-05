import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: 'bg-[#073ca6] text-white hover:bg-[#062f82]',
  secondary: 'border border-[#073ca6] bg-white text-[#073ca6] hover:bg-[#eef4ff]',
  dark: 'bg-slate-950 text-white hover:bg-slate-800',
  light: 'bg-white text-[#073ca6] hover:bg-slate-100'
};

function Button({ children, to, type = 'button', variant = 'primary', className = '', ...props }) {
  const classes = `focus-ring inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-bold transition ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
