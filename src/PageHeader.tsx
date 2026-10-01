interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
    </div>
  );
}