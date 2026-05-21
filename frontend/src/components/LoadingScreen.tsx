export function LoadingScreen({ title = 'Загрузка...' }: { title?: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-fuchsia-300/25 border-t-fuchsia-300" />
      <p className="font-medium text-slate-200">{title}</p>
    </div>
  )
}
