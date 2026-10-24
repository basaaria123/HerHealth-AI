/**
 * HerHealth AI — Botanical Lotus Logo
 * A reusable lotus-style SVG brand symbol.
 */
export default function LotusLogo({ size = 40, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Center petal */}
      <path
        d="M32 8C32 8 26 20 26 32C26 44 32 56 32 56C32 56 38 44 38 32C38 20 32 8 32 8Z"
        fill="rgba(255,255,255,0.95)"
      />
      {/* Left petals */}
      <path
        d="M32 18C32 18 20 22 16 32C12 42 18 52 18 52C18 52 24 42 28 34C30 30 32 26 32 18Z"
        fill="rgba(255,255,255,0.75)"
      />
      <path
        d="M32 24C32 24 14 26 10 36C6 46 14 54 14 54C14 54 18 44 24 36C28 30 32 28 32 24Z"
        fill="rgba(255,255,255,0.55)"
      />
      {/* Right petals */}
      <path
        d="M32 18C32 18 44 22 48 32C52 42 46 52 46 52C46 52 40 42 36 34C34 30 32 26 32 18Z"
        fill="rgba(255,255,255,0.75)"
      />
      <path
        d="M32 24C32 24 50 26 54 36C58 46 50 54 50 54C50 54 46 44 40 36C36 30 32 28 32 24Z"
        fill="rgba(255,255,255,0.55)"
      />
      {/* Base curve */}
      <path
        d="M18 50C22 46 27 44 32 44C37 44 42 46 46 50"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 52C20 47 26 45 32 45C38 45 44 47 50 52"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LotusLogoDark({ size = 40, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Center petal */}
      <path
        d="M32 8C32 8 26 20 26 32C26 44 32 56 32 56C32 56 38 44 38 32C38 20 32 8 32 8Z"
        fill="#9B6DB5"
      />
      {/* Left petals */}
      <path
        d="M32 18C32 18 20 22 16 32C12 42 18 52 18 52C18 52 24 42 28 34C30 30 32 26 32 18Z"
        fill="#B48BC8"
      />
      <path
        d="M32 24C32 24 14 26 10 36C6 46 14 54 14 54C14 54 18 44 24 36C28 30 32 28 32 24Z"
        fill="#D1B8DE"
      />
      {/* Right petals */}
      <path
        d="M32 18C32 18 44 22 48 32C52 42 46 52 46 52C46 52 40 42 36 34C34 30 32 26 32 18Z"
        fill="#B48BC8"
      />
      <path
        d="M32 24C32 24 50 26 54 36C58 46 50 54 50 54C50 54 46 44 40 36C36 30 32 28 32 24Z"
        fill="#D1B8DE"
      />
      {/* Base curve */}
      <path
        d="M18 50C22 46 27 44 32 44C37 44 42 46 46 50"
        stroke="#9B6DB5"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 52C20 47 26 45 32 45C38 45 44 47 50 52"
        stroke="#C8A4D8"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
