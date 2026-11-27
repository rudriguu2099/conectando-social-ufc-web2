import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AuthSubmitButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="submit"
      className={cn(
        'h-12 w-full rounded-none bg-[#00638b] text-base font-medium text-white shadow-sm hover:bg-[#004f70]',
        className,
      )}
      {...props}
    />
  )
}
