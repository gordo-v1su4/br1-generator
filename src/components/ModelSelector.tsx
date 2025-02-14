import { ModelType, MODELS } from '../utils/falAi';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelSelect: (model: ModelType) => void;
}

export function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  return (
    <div className="flex gap-4 mb-4">
      {MODELS.map((model) => (
        <button
          key={model.id}
          onClick={() => onModelSelect(model.id)}
          className={`relative group flex flex-col items-center p-4 rounded-lg transition-all ${
            selectedModel === model.id
              ? 'bg-blue-500/20 ring-2 ring-blue-500 border-2 border-blue-400'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <div className={`w-32 h-32 rounded-lg overflow-hidden mb-2 ${
            selectedModel === model.id ? 'ring-2 ring-blue-400' : ''
          }`}>
            <img
              src={model.previewImage}
              alt={`${model.name} preview`}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold">{model.name}</h3>
          <p className="text-sm text-gray-400 text-center">{model.description}</p>
          
          {/* Highlight overlay */}
          <div
            className={`absolute inset-0 rounded-lg transition-opacity ${
              selectedModel === model.id
                ? 'ring-4 ring-blue-500 opacity-100'
                : 'ring-2 ring-blue-500 opacity-0 group-hover:opacity-50'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
