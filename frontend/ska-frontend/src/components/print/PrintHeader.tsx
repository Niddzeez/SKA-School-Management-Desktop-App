type PrintHeaderProps = {
  logo: React.ReactNode;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export default function PrintHeader({
  logo,
  title,
  subtitle,
  rightSlot,
}: PrintHeaderProps) {
  return (
    <header className="print-header">
      <div className="header-left">
        <div className="logo-box">{logo}</div>

        <div className="school-text">
          <h1>{title}</h1>
          {subtitle && <div className="letterhead">{subtitle}</div>}
          <p>📞 9890908475 | 9860622678 | India</p>
        </div>
      </div>

      {rightSlot && <div className="header-right">{rightSlot}</div>}
    </header>
  );
}
