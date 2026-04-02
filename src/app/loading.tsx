export default function Loading() {
  return (
    <div className="bg-dark flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="border-brand h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        <span className="text-sm text-gray-400">Carregando...</span>
      </div>
    </div>
  );
}
