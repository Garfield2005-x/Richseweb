"use client"

import ReCAPTCHA from "react-google-recaptcha"

type Props = {
  onChange: (token: string | null) => void
}

export default function RecaptchaBox({ onChange }: Props) {
  return (
    <ReCAPTCHA
      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      onChange={onChange}
    />
  )
}