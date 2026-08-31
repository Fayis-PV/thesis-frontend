export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function toast(options: ToastOptions) {
  if (options.variant === "destructive")
    console.error(options.title, options.description ?? "");
  else console.info(options.title, options.description ?? "");
}
