import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import useChatStore from "../../stores/useChatStore";

function ModelSelector() {
  const {
    apiSettings,
    updateApiSettings,
    availableModels,
  } = useChatStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get current model info
  const currentModels = availableModels[apiSettings.provider] || [];
  const currentModel = currentModels.find(m => m.id === apiSettings.selectedModel);

  const handleModelSelect = (modelId) => {
    updateApiSettings({ selectedModel: modelId });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Model Selection Button */}
      <button
        type="button"
        className="h-[30px] w-[200px] p-2 flex items-center border border-[var(--grey-0)] bg-[var(--dark-1)] cursor-pointer hover:border-[var(--grey-1)] rounded justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-white/80 scale-90 truncate">
          {currentModel?.name || 'Select Model'}
        </div>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Model Dropdown */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+4px)] left-0 right-0 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded shadow-lg py-2 z-[100] max-h-[200px] overflow-y-auto">
          {currentModels.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => handleModelSelect(model.id)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--dark-2)] transition-colors ${model.id === apiSettings.selectedModel ? 'bg-[var(--dark-2)] text-[var(--primary)]' : 'text-white'
                }`}
            >
              {model.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModelSelector;