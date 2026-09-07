import React from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

/**
 * Strips all asterisk symbols (** or *) and renders clean HTML/JSX
 * with styled badges, bullets, and section cards.
 */
function cleanInlineText(text) {
  if (!text) return null;
  
  // Split by double asterisks first for bold segments
  // e.g. "Your recorded income is **₹0.00**."
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, index) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
      const cleanWord = part.replace(/\*/g, '');
      return (
        <strong key={index} className="text-white font-semibold tracking-tight">
          {cleanWord}
        </strong>
      );
    }
    // Remove any rogue remaining single asterisks
    const sanitized = part.replace(/\*/g, '');
    return <span key={index}>{sanitized}</span>;
  });
}

export function CleanMarkdown({ content, className = '' }) {
  if (!content) return null;

  // Pre-clean: normalize line endings
  const raw = String(content).replace(/\r\n/g, '\n');

  // Break text into logical blocks / paragraphs
  const blocks = raw.split(/\n\s*\n+/);

  const getSectionIcon = (heading) => {
    const h = heading.toLowerCase();
    if (h.includes('snapshot') || h.includes('cash flow') || h.includes('inflow')) {
      return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    }
    if (h.includes('budget') || h.includes('risk') || h.includes('health')) {
      return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    }
    if (h.includes('action') || h.includes('recommendation') || h.includes('priority')) {
      return <Lightbulb className="w-4 h-4 text-cyan-400" />;
    }
    return <Sparkles className="w-4 h-4 text-violet-400" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, bIdx) => {
        const lines = block.trim().split('\n').filter(Boolean);
        if (lines.length === 0) return null;

        const firstLine = lines[0].trim();

        // Detect if this block is a header (starts with ### or ## or #)
        if (firstLine.startsWith('#')) {
          const headingText = firstLine.replace(/^#+\s*/, '').replace(/\*/g, '').trim();
          const restOfLines = lines.slice(1);

          return (
            <div key={bIdx} className="pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08] mb-3">
                {getSectionIcon(headingText)}
                <h3 className="font-bold text-white text-sm sm:text-base font-display tracking-tight">
                  {headingText}
                </h3>
              </div>
              {restOfLines.length > 0 && (
                <div className="space-y-2.5 pl-1">
                  {renderSublines(restOfLines)}
                </div>
              )}
            </div>
          );
        }

        // Detect if this is a "Final Thought" or Callout block
        if (firstLine.toLowerCase().includes('final thought:') || firstLine.toLowerCase().includes('conclusion:')) {
          const cleanNotice = block.replace(/\*/g, '').trim();
          return (
            <div key={bIdx} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block text-white mb-0.5 font-display">Advisor Takeaway</span>
                <p className="text-emerald-100/90">{cleanNotice.replace(/^(final thought:|conclusion:)/i, '').trim()}</p>
              </div>
            </div>
          );
        }

        // Regular block with bullets or paragraphs
        return (
          <div key={bIdx} className="space-y-2">
            {renderSublines(lines)}
          </div>
        );
      })}
    </div>
  );
}

function renderSublines(lines) {
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Check if bullet point
    const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•');

    if (isBullet) {
      // Strip leading bullet symbol and any immediate spaces
      const bulletContent = trimmed.replace(/^[\*\-•]\s+/, '');

      // Check if item has a bold lead, e.g. "**Income Status:** explanation"
      const colonMatch = bulletContent.match(/^\*\*(.*?)\*\*:\s*(.*)/) || bulletContent.match(/^([A-Za-z0-9\s\(\)]+):\s*(.*)/);

      if (colonMatch) {
        const title = colonMatch[1].replace(/\*/g, '').trim();
        const desc = colonMatch[2];

        return (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-slate-300 group">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2 group-hover:scale-125 transition-transform" />
            <div className="flex-1">
              <span className="font-bold text-white mr-1.5 font-sans">{title}:</span>
              <span>{cleanInlineText(desc)}</span>
            </div>
          </div>
        );
      }

      return (
        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-slate-300 group">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2 group-hover:scale-125 transition-transform" />
          <span className="flex-1">{cleanInlineText(bulletContent)}</span>
        </div>
      );
    }

    // Standard paragraph line
    return (
      <p key={idx} className="text-xs sm:text-sm leading-relaxed text-slate-300">
        {cleanInlineText(trimmed)}
      </p>
    );
  });
}

export default CleanMarkdown;
