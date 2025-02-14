import React from 'react'
import { Wand2 } from 'lucide-react'

interface EffectsPanelProps {
  onApplyEffect: (effect: string) => void
}

const EffectsPanel: React.FC<EffectsPanelProps> = ({ onApplyEffect }) => {
  const effects = ['Enhance', 'Stylize', 'Trim', 'Add Subtitles']

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">AI Effects</h3>
      <div className="flex flex-wrap gap-2">
        {effects.map((effect) => (
          <button
            key={effect}
            onClick={() => onApplyEffect(effect)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <Wand2 className="mr-2" />
            {effect}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EffectsPanel