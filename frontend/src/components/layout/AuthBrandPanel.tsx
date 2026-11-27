import { UsersRound } from 'lucide-react'

export default function AuthBrandPanel() {
  return (
    <aside className="flex items-center bg-[#05040f] px-[13.5%] text-white">
      <div className="max-w-155 space-y-3">
        <UsersRound aria-hidden="true" className="mb-4 size-7" />
        <h1 className="font-serif text-[34px] font-bold leading-tight">Conectando Social</h1>
        <p className="font-serif text-[22px] font-bold leading-8 text-white">
          Demandas reais da comunidade para projetos de extensão da UFC.
        </p>
      </div>
    </aside>
  )
}
