import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} duration={2000} {...props}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
