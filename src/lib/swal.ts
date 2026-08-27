import Swal, { SweetAlertOptions } from "sweetalert2";

// Custom Batara Mining Dark Theme SweetAlert instance
export const BataraSwal = Swal.mixin({
  background: "#090d16",
  color: "#f8fafc",
  customClass: {
    popup: "border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md",
    title: "text-lg font-bold text-white tracking-tight",
    htmlContainer: "text-xs text-slate-300 leading-relaxed",
    confirmButton:
      "px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer transition-all mx-1.5",
    cancelButton:
      "px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-md cursor-pointer transition-all mx-1.5",
    denyButton:
      "px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-white shadow-md cursor-pointer transition-all mx-1.5",
  },
  buttonsStyling: false,
});

/**
 * Toast Notification (Top Right)
 */
export const showToast = (
  title: string,
  icon: "success" | "error" | "warning" | "info" = "success"
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#0f172a",
    color: "#f8fafc",
    customClass: {
      popup: "border border-slate-800 rounded-2xl shadow-xl",
      title: "text-xs font-bold text-white",
    },
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};

/**
 * Success Alert Dialog
 */
export const showAlertSuccess = (
  title: string,
  message?: string,
  options?: SweetAlertOptions
) => {
  return BataraSwal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: "Selesai",
    ...options,
  });
};

/**
 * Error Alert Dialog
 */
export const showAlertError = (
  title: string,
  message?: string,
  options?: SweetAlertOptions
) => {
  return BataraSwal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "Tutup",
    ...options,
  });
};

/**
 * Warning Alert Dialog
 */
export const showAlertWarning = (
  title: string,
  message?: string,
  options?: SweetAlertOptions
) => {
  return BataraSwal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "Mengerti",
    ...options,
  });
};

/**
 * Info Alert Dialog
 */
export const showAlertInfo = (
  title: string,
  message?: string,
  options?: SweetAlertOptions
) => {
  return BataraSwal.fire({
    icon: "info",
    title,
    text: message,
    confirmButtonText: "OK",
    ...options,
  });
};

/**
 * Confirmation Dialog
 */
export const showConfirmDialog = async ({
  title,
  text,
  confirmButtonText = "Ya, Lanjutkan",
  cancelButtonText = "Batal",
  isDanger = false,
}: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDanger?: boolean;
}): Promise<boolean> => {
  const result = await BataraSwal.fire({
    title,
    text,
    icon: isDanger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: "border border-slate-800 rounded-3xl shadow-2xl",
      title: "text-lg font-bold text-white tracking-tight",
      htmlContainer: "text-xs text-slate-300 leading-relaxed",
      confirmButton: isDanger
        ? "px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-white shadow-md cursor-pointer transition-all mx-1.5"
        : "px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer transition-all mx-1.5",
      cancelButton:
        "px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-md cursor-pointer transition-all mx-1.5",
    },
    reverseButtons: true,
  });

  return result.isConfirmed;
};

export default BataraSwal;
