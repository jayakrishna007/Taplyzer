import { Suspense } from "react"
import AuthPage from "../page"

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  )
}
