type PrintLayoutProps = {
  children: React.ReactNode;
  watermark?: React.ReactNode;
};

export default function PrintLayout({ children, watermark }: PrintLayoutProps) {
  return (
    <div className="print-page watermark-container">
      {watermark && <div className="print-watermark">{watermark}</div>}
      {children}
    </div>
  );
}
