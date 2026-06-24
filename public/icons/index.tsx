export const SideLine = () => {
  return (
    <svg 
    className="absolute -right-12 -top-72 will-change-transform lg:-right-10 md:-right-12"
      xmlns="http://www.w3.org/2000/svg"  // ← removed the space
      fill="none" 
      viewBox="0 0 480 614"
      width="480"  // optional: match viewBox
      height="614"
       // optional: match viewBox
    >
      <rect 
        width="479" 
        height="613" 
        x=".5" 
        y=".5" 
        stroke="url(#form-outer-light_svg__a)" 
        rx="19.5"
      />
      <defs>
        <radialGradient 
          id="form-outer-light_svg__a" 
          cx="0" 
          cy="0" 
          r="1" 
          gradientTransform="matrix(0 92.5 -92.5 0 487 389.5)" 
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".012" stopColor="#8B655C" />  {/* React uses camelCase */}
          <stop offset=".325" stopColor="#523229" />
          <stop offset="1" stopColor="#523229" stopOpacity="0" />  {/* camelCase here too */}
        </radialGradient>
      </defs>
    </svg>
  );
};