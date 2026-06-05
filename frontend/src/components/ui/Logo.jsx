import React from 'react';
import { Link } from 'react-router-dom';

function Logo({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-black tracking-tight text-[#073ca6]">
      <span className={`grid h-8 w-8 place-items-center rounded-md ${dark ? 'bg-white text-[#073ca6]' : 'bg-[#073ca6] text-white'}`}>
        G
      </span>
      <span className={dark ? 'text-white' : 'text-[#073ca6]'}>GAMS</span>
    </Link>
  );
}

export default Logo;
