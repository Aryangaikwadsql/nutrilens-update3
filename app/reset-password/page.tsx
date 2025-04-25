import dynamic from "next/dynamic"
import React from "react"

const ResetPasswordForm = dynamic(() => import("./ResetPasswordForm"), {
  loading: () => <div>Loading...</div>,
})

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
