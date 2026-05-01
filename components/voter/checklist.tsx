export function Checklist({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="glass-panel p-6 rounded-xl border border-cream/10">
      <h3 className="font-instrument-serif text-2xl text-cream mb-4">{title}</h3>
      <ul className="space-y-3 font-inter text-cream/80">
        {items.map((item, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded border border-saffron flex-shrink-0 mt-0.5 flex items-center justify-center">
              {/* Checkmark placeholder */}
            </div>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
