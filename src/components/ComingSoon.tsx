import { Hammer } from "lucide-react";

/** Card temporário exibido nas telas ainda não implementadas */
export default function ComingSoon({ etapa }: { etapa: string }) {
  return (
    <div className="mx-5 mt-8 flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Hammer size={26} />
      </span>
      <p className="text-sm font-semibold text-dark">Em construção</p>
      <p className="text-xs text-muted">{etapa}</p>
    </div>
  );
}
