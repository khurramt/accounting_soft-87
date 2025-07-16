import React, { useState } from "react";

export const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

export const SelectTrigger = ({ children, className = "", ...props }) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const SelectValue = ({ placeholder, children }) => {
  return <span className="text-gray-900">{children || placeholder}</span>;
};

export const SelectContent = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectItem = ({ children, value, className = "", ...props }) => {
  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};