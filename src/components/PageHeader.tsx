/** Header roxo padrão das telas internas, seguindo a identidade Connexa */
export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-5 pb-6 pt-8 text-white">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-white/85">{subtitle}</p>
    </header>
  );
}
