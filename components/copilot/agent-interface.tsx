export function AgentInterface() {
  return (
    <div className="glass-panel p-4 rounded-xl border border-saffron/30">
      <div className="flex items-center space-x-3 mb-4 border-b border-cream/10 pb-3">
        <span className="text-2xl">🤖</span>
        <div>
          <h3 className="font-instrument-serif text-lg text-cream">ElectiGuide Co-Pilot</h3>
          <p className="font-jetbrains-mono text-xs text-saffron">STATUS: ONLINE</p>
        </div>
      </div>
      <div className="space-y-3 font-inter text-sm text-cream/80">
        <p>How can I assist you with your voter lifecycle today?</p>
      </div>
    </div>
  );
}
