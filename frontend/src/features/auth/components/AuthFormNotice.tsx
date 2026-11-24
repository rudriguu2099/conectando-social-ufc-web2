type AuthFormNoticeProps = {
  children: string
}

export default function AuthFormNotice({ children }: AuthFormNoticeProps) {
  return (
    <p
      role="status"
      className="rounded-sm border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900"
    >
      {children}
    </p>
  )
}
