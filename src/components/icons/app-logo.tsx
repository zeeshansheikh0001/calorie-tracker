import type { SVGProps } from 'react';

export default function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 6v6l4 2" />
      <path d="m15.32 18.32-.82-.82a3.99 3.99 0 0 1-4.92-4.92l-.82-.82" />
      <path d="m8.68 5.68.82.82a3.99 3.99 0 0 1 4.92 4.92l.82.82" />
    </svg>
  );
}
