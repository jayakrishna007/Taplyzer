import { Suspense } from "react"
import AuthPage from "../page"

export default function SignupPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  )
}
