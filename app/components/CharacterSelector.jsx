import { useState } from 'react'
import { FiChevronDown, FiUser } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'

function CharacterSelector() {
  const { 
    characters, 
    currentCharacter, 
    selectCharacter,
    clearMessages 
  } = useChatStore()
  
  const [isOpen, setIsOpen] = useState(false)
  
  const handleCharacterSelect = (characterId) => {
    if (characterId !== currentCharacter.id) {
      selectCharacter(characterId)
      clearMessages()
    }
    setIsOpen(false)
  }
  
  return (
    <div className="relative">
      {/* Current Character Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded text-white hover:border-[var(--grey-1)] transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--grey-0)] flex-shrink-0 flex items-center justify-center">
            {currentCharacter.avatar ? (
              <img
                src={currentCharacter.avatar}
                alt={currentCharacter.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {currentCharacter.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">{currentCharacter.name}</div>
            <div className="text-xs text-[var(--grey-1)] truncate max-w-[200px]">
              {currentCharacter.description}
            </div>
          </div>
        </div>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Character Dropdown */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded shadow-lg py-2 z-20 max-h-[300px] overflow-y-auto">
          {Object.values(characters).map((character) => (
            <button
              key={character.id}
              onClick={() => handleCharacterSelect(character.id)}
              className={`w-full px-3 py-3 text-left hover:bg-[var(--dark-2)] flex items-center gap-3 ${
                character.id === currentCharacter.id ? 'bg-[var(--dark-2)] border-l-2 border-[var(--primary)]' : ''
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[var(--grey-0)] flex-shrink-0 flex items-center justify-center">
                {character.avatar ? (
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {character.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`font-medium truncate ${
                  character.id === currentCharacter.id ? 'text-[var(--primary)]' : 'text-white'
                }`}>
                  {character.name}
                </div>
                <div className="text-xs text-[var(--grey-1)] truncate">
                  {character.description}
                </div>
                {character.lorebook && character.lorebook.length > 0 && (
                  <div className="text-xs text-[var(--primary)] mt-1">
                    {character.lorebook.length} lorebook entries
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default CharacterSelector