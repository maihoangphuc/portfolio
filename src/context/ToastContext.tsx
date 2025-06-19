"use client";

import { createContext, useContext } from "react";
import { toast, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ToastContextType {
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
  showWarning: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, options);
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, options);
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, options);
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(message, options);
  };

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showInfo, showWarning }}
    >
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        icon={false}
        className="!p-5 md:!p-0"
      />
    </ToastContext.Provider>
  );
};
