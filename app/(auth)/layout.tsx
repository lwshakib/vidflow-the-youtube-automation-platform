import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {children}
    </div>
  );
}
