import { UsersRound } from 'lucide-react'

export default function AuthBrandPanel() {
  return (
    <aside className="flex items-center bg-[#05040f] px-[13.5%] text-white">
      <div className="max-w-155 space-y-3">
        <UsersRound aria-hidden="true" className="mb-4 size-5" />
        <h1 className="text-[22px] font-semibold tracking-tight">
          Conectando Social
        </h1>
        <p className="text-sm font-medium leading-6 text-white/90">
          Demandas reais da comunidade para projetos de extensão da UFC.
        </p>
      </div>
    </aside>
  )
}
