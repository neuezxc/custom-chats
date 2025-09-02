import { useState, useRef, useEffect } from 'react'
import { FiX, FiPlus, FiEdit, FiTrash2, FiSave, FiDownload, FiUpload, FiEye, FiEyeOff, FiUser, FiMessageCircle, FiBook, FiImage } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'
import GalleryModeSelector from './GalleryModeSelector'
import ImageUploadInterface from './ImageUploadInterface'
import ImagePreviewGrid from './ImagePreviewGrid'
import ProfilePictureUpload from './ProfilePictureUpload'

function CharacterManager() {
  const {
    characters,
    currentCharacter,
    showCharacterManager,
    characterManagerMode,
    editingCharacterId,
    setShowCharacterManager,
    setCharacterManagerMode,
    setEditingCharacterId,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    selectCharacter,
    addLorebookEntry,
    updateLorebookEntry,
    deleteLorebookEntry,
    exportCharacter,
    importCharacter,
    // Image Gallery Actions
    setCharacterGalleryMode,
    addCharacterImage,
    removeCharacterImage,
    setActiveCharacterImage,
    validateImageUpload,
    generateImagePreview
  } = useChatStore()

  const [editForm, setEditForm] = useState(getDefaultForm())
  const [newLorebookEntry, setNewLorebookEntry] = useState(getDefaultLorebookEntry())
  const [showLorebookForm, setShowLorebookForm] = useState(false)
  const [editingLorebookId, setEditingLorebookId] = useState(null)
  const [imageGalleryError, setImageGalleryError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const fileInputRef = useRef(null)

  function getDefaultForm() {
    return {
      name: '',
      description: '',
      firstMessage: '',
      exampleDialogue: '',
      avatar: null,
      imageGallery: {
        mode: 'default',
        images: [],
        activeImageIndex: 0
      }
    }
  }

  function getDefaultLorebookEntry() {
    return {
      name: '',
      triggers: [],
      description: '',
      isActive: true
    }
  }

  // Initialize form when entering edit mode
  useEffect(() => {
    if (characterManagerMode === 'edit' && editingCharacterId) {
      const character = characters[editingCharacterId]
      if (character) {
        setEditForm({
          name: character.name,
          description: character.description,
          firstMessage: character.firstMessage,
          exampleDialogue: character.exampleDialogue,
          avatar: character.avatar,
          imageGallery: character.imageGallery || {
            mode: 'default',
            images: [],
            activeImageIndex: 0
          }
        })
      }
      // Set default tab to basic when editing
      setActiveTab('basic')
    } else if (characterManagerMode === 'create') {
      setEditForm(getDefaultForm())
      // Set default tab to basic when creating
      setActiveTab('basic')
    }
    // Clear any previous errors when switching modes
    setImageGalleryError('')
  }, [characterManagerMode, editingCharacterId, characters])

  const handleClose = () => {
    setShowCharacterManager(false)
    setCharacterManagerMode('list')
    setEditingCharacterId(null)
    setEditForm(getDefaultForm())
    setShowLorebookForm(false)
    setEditingLorebookId(null)
    setNewLorebookEntry(getDefaultLorebookEntry())
    setImageGalleryError('')
  }

  const handleSaveCharacter = () => {
    // Validate basic requirements
    if (!editForm.name.trim()) {
      setImageGalleryError('Character name is required')
      return
    }
    
    // Validate image gallery for multiple mode
    if (editForm.imageGallery.mode === 'multiple' && editForm.imageGallery.images.length < 3) {
      setImageGalleryError(`Multiple Images mode requires at least 3 images. Currently: ${editForm.imageGallery.images.length}`)
      return
    }
    
    const characterData = {
      ...editForm
    }

    try {
      if (characterManagerMode === 'create') {
        createCharacter(characterData)
      } else if (characterManagerMode === 'edit' && editingCharacterId) {
        updateCharacter(editingCharacterId, characterData)
      }

      setCharacterManagerMode('list')
      setEditingCharacterId(null)
      setEditForm(getDefaultForm())
      setImageGalleryError('')
      setStorageError('')
    } catch (error) {
      if (error.message.includes('Storage limit') || error.message.includes('quota')) {
        setStorageError(error.message)
        // Don't reset the form so user can try again
      } else {
        setImageGalleryError('An error occurred while saving: ' + error.message)
      }
    }
  }

  const handleAddLorebookEntry = () => {
    if (!editingCharacterId) return

    const entryData = {
      ...newLorebookEntry,
      triggers: Array.isArray(newLorebookEntry.triggers)
        ? newLorebookEntry.triggers
        : newLorebookEntry.triggers.split(',').map(t => t.trim()).filter(Boolean)
    }

    if (editingLorebookId) {
      updateLorebookEntry(editingCharacterId, editingLorebookId, entryData)
      setEditingLorebookId(null)
    } else {
      addLorebookEntry(editingCharacterId, entryData)
    }

    setNewLorebookEntry(getDefaultLorebookEntry())
    setShowLorebookForm(false)
  }

  const handleEditLorebookEntry = (entry) => {
    setNewLorebookEntry({
      name: entry.name,
      triggers: Array.isArray(entry.triggers) ? entry.triggers.join(', ') : entry.triggers,
      description: entry.description,
      isActive: entry.isActive
    })
    setEditingLorebookId(entry.id)
    setShowLorebookForm(true)
  }

  const handleExportCharacter = (characterId) => {
    const exported = exportCharacter(characterId)
    if (exported) {
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${characters[characterId].name}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImportCharacter = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const characterData = JSON.parse(e.target.result)
        importCharacter(characterData)
      } catch (error) {
        alert('Invalid character file format')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }
  
  // Image Gallery Handlers
  const handleGalleryModeChange = (mode) => {
    setEditForm(prev => ({
      ...prev,
      imageGallery: {
        mode: mode,
        images: [],
        activeImageIndex: 0
      }
    }))
    setImageGalleryError('')
  }
  
  // Avatar Upload Handler - Enhanced to support both files and URLs
  const handleAvatarUpload = async (fileOrUrlData) => {
    try {
      // Handle URL-based avatar
      if (fileOrUrlData.isUrl) {
        // For URL avatars, we use the URL directly
        setEditForm(prev => ({ ...prev, avatar: fileOrUrlData.url }))
        setImageGalleryError('')
        return
      }
      
      // Handle file upload
      const file = fileOrUrlData
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Avatar image must be smaller than 5MB')
      }

      // Generate compressed preview for avatar (better size for avatars)
      const avatarUrl = await generateImagePreview(file, 400, 400, 0.9)
      
      // Update form with new avatar
      setEditForm(prev => ({ ...prev, avatar: avatarUrl }))
      setImageGalleryError('')
      
    } catch (error) {
      console.error('Avatar upload error:', error)
      throw error // Re-throw for component to handle
    }
  }
  
  // Avatar Remove Handler
  const handleAvatarRemove = () => {
    setEditForm(prev => ({ ...prev, avatar: null }))
    setImageGalleryError('')
  }
  
  const handleImageUpload = async (fileOrUrlData) => {
    try {
      // Check if it's a URL-based image
      if (fileOrUrlData.isUrl) {
        // For URL images, we don't need compression or file validation
        const imageData = {
          file: null,
          previewUrl: fileOrUrlData.previewUrl,
          filename: fileOrUrlData.filename,
          size: 0, // URL images don't count toward storage
          isUrl: true,
          originalUrl: fileOrUrlData.originalUrl,
          width: fileOrUrlData.width,
          height: fileOrUrlData.height
        }
        
        // Add to form
        setEditForm(prev => {
          const newImages = [...prev.imageGallery.images, {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...imageData
          }]
          
          return {
            ...prev,
            imageGallery: {
              ...prev.imageGallery,
              images: newImages,
              activeImageIndex: prev.imageGallery.images.length === 0 ? 0 : prev.imageGallery.activeImageIndex
            }
          }
        })
        
        setImageGalleryError('')
        setStorageError('')
        return
      }
      
      // Handle regular file uploads
      const file = fileOrUrlData
      
      // Validate the upload
      const validation = validateImageUpload(file, editForm.imageGallery.mode, editForm.imageGallery.images)
      if (!validation.isValid) {
        setImageGalleryError(validation.errors[0])
        return
      }
      
      // Generate preview with default compression settings
      const previewUrl = await generateImagePreview(file, 800, 600, 0.8)
      
      // Create image data
      const imageData = {
        file: file,
        previewUrl: previewUrl,
        filename: file.name,
        size: file.size,
        isUrl: false
      }
      
      // Add to form
      setEditForm(prev => {
        const newImages = [...prev.imageGallery.images, {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...imageData
        }]
        
        return {
          ...prev,
          imageGallery: {
            ...prev.imageGallery,
            images: newImages,
            activeImageIndex: prev.imageGallery.images.length === 0 ? 0 : prev.imageGallery.activeImageIndex
          }
        }
      })
      
      setImageGalleryError('')
      setStorageError('')
    } catch (error) {
      if (error.message.includes('Storage limit') || error.message.includes('quota')) {
        setStorageError(error.message)
      } else {
        setImageGalleryError(error.message)
      }
    }
  }
  
  const handleImageRemove = (imageId) => {
    setEditForm(prev => {
      const imageIndex = prev.imageGallery.images.findIndex(img => img.id === imageId)
      if (imageIndex === -1) return prev
      
      // Clean up preview URL only for uploaded files, not for URL images
      const imageToRemove = prev.imageGallery.images[imageIndex]
      if (imageToRemove.previewUrl && imageToRemove.previewUrl.startsWith('blob:') && !imageToRemove.isUrl) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }
      
      const updatedImages = prev.imageGallery.images.filter(img => img.id !== imageId)
      let newActiveIndex = prev.imageGallery.activeImageIndex
      
      // Adjust active index if necessary
      if (imageIndex <= prev.imageGallery.activeImageIndex && updatedImages.length > 0) {
        newActiveIndex = Math.max(0, prev.imageGallery.activeImageIndex - 1)
      } else if (updatedImages.length === 0) {
        newActiveIndex = 0
      }
      
      return {
        ...prev,
        imageGallery: {
          ...prev.imageGallery,
          images: updatedImages,
          activeImageIndex: newActiveIndex
        }
      }
    })
    setImageGalleryError('')
  }
  
  const handleSetActiveImage = (index) => {
    setEditForm(prev => ({
      ...prev,
      imageGallery: {
        ...prev.imageGallery,
        activeImageIndex: index
      }
    }))
  }
  
  const handleImageGalleryError = (errorMessage) => {
    setImageGalleryError(errorMessage)
  }

  if (!showCharacterManager) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-none sm:rounded-lg w-full h-full sm:max-w-4xl sm:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--grey-0)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <FiUser size={20} className="text-[var(--primary)]" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                {characterManagerMode === 'list' && 'Character Manager'}
                {characterManagerMode === 'create' && 'Create Character'}
                {characterManagerMode === 'edit' && 'Edit Character'}
              </h2>
              <p className="text-sm text-[var(--grey-1)]">
                {characterManagerMode === 'list' && 'Manage your AI characters'}
                {characterManagerMode === 'create' && 'Create a new AI character'}
                {characterManagerMode === 'edit' && 'Modify character details'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--grey-1)] hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {characterManagerMode === 'list' && (
            <div className="space-y-6">
              {/* Import/Export Controls */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                  onClick={() => setCharacterManagerMode('create')}
                  className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium"
                > 
                  <FiPlus size={16} /> Create Character
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[var(--dark-2)] hover:bg-[var(--dark-3)] text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center sm:justify-start gap-2"
                >
                  <FiUpload size={16} /> Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportCharacter}
                  className="hidden"
                />
              </div>

              {/* Character Grid */}
              <div className="flex flex-row flex-wrap gap-2">
                {Object.values(characters).map((character) => (
                  <div
                    key={character.id}

                    className={`group relative rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]  ${
                      character.id === currentCharacter.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg'
                        : 'border-[var(--grey-0)] bg-[var(--dark-2)] md:hover:border-[var(--primary)]/50'
                    }`}
                    onClick={() => selectCharacter(character.id)}
                  >
                    {/* <!-- 
                      DESIGN RATIONALE: Hero Image
                      The avatar is now a full-width banner using aspect-ratio to create a strong visual anchor. 
                      This immediately establishes the character's identity and creates a more engaging, gallery-like feel.
                      The image is the hero of the card.
                    --> */}
                    <div className="relative aspect-square w-full bg-[var(--dark-3)]">
                      {character.avatar ? (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center text-white font-bold text-4xl">
                          {character.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                      )}
                      {/* <!-- 
                        DESIGN RATIONALE: Integrated Title
                        Overlaying the name on the image with a subtle gradient creates a more professional, integrated look.
                        It saves vertical space and connects the text directly to the visual.
                      --> */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {character.name}
                        </h3>
                      </div>
                      {character.id === currentCharacter.id && (
                        <span className="absolute top-2 right-2 text-xs bg-[var(--primary)] text-white px-2 py-1 rounded-full font-medium flex-shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-[var(--grey-1)] text-sm line-clamp-2 leading-relaxed mb-4 h-10">
                        {character.description || 'No description provided'}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-start text-xs text-[var(--grey-2)] mb-4">
                        <div className="flex items-center gap-1">
                          <FiBook size={12} />
                          <span>{character.lorebook?.length || 0} entries</span>
                        </div>
                      </div>

                      {/* <!-- 
                        DESIGN RATIONALE: Always-Visible Actions on Mobile
                        Actions are now permanently visible to ensure accessibility on touch devices, 
                        while the hover effect is preserved for a cleaner look on desktop (md and up).
                      --> */}
                      <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCharacterId(character.id)
                            setCharacterManagerMode('edit')
                          }}
                          className="p-2 bg-[var(--dark-1)] hover:bg-[var(--primary)] text-[var(--grey-1)] hover:text-white rounded-md transition-colors"
                          title="Edit Character"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportCharacter(character.id)
                          }}
                          className="p-2 bg-[var(--dark-1)] hover:bg-[var(--primary)] text-[var(--grey-1)] hover:text-white rounded-md transition-colors"
                          title="Export Character"
                        >
                          <FiDownload size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Are you sure you want to delete "${character.name}"?`)) {
                              deleteCharacter(character.id)
                            }
                          }}
                          className="p-2 bg-[var(--dark-1)] hover:bg-red-600 text-[var(--grey-1)] hover:text-white rounded-md transition-colors"
                          title="Delete Character"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(characterManagerMode === 'create' || characterManagerMode === 'edit') && (
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Tab Navigation */}
              <div className="flex border-b border-[var(--grey-0)] mb-6">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-2 font-medium text-sm relative ${
                    activeTab === 'basic'
                      ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                      : 'text-[var(--grey-1)] hover:text-white'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-4 py-2 font-medium text-sm relative ${
                    activeTab === 'images'
                      ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                      : 'text-[var(--grey-1)] hover:text-white'
                  }`}
                >
                  Images
                </button>
                {characterManagerMode === 'edit' && (
                  <button
                    onClick={() => setActiveTab('lorebook')}
                    className={`px-4 py-2 font-medium text-sm relative ${
                      activeTab === 'lorebook'
                        ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                        : 'text-[var(--grey-1)] hover:text-white'
                    }`}
                  >
                    Lorebook
                  </button>
                )}
              </div>

              {/* Character Information - Basic Info Tab */}
              {(activeTab === 'basic') && (
                <>
                  <div className="bg-[var(--dark-2)] rounded-lg p-4 sm:p-6 border border-[var(--grey-0)]">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <FiUser size={20} className="text-[var(--primary)]" />
                        <h3 className="text-lg font-semibold text-white">Character Information</h3>
                      </div>
                      
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Character Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-3 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors"
                          placeholder="Enter character name (e.g., Hayeon)"
                          autoFocus={characterManagerMode === 'create'}
                        />
                      </div>

                      {/* Profile Picture Upload */}
                      <ProfilePictureUpload
                        currentAvatar={editForm.avatar}
                        characterName={editForm.name}
                        onAvatarUpload={handleAvatarUpload}
                        onAvatarRemove={handleAvatarRemove}
                        onValidationError={setImageGalleryError}
                        disabled={false}
                      />

                      {/* Description Field */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Character Description
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-3 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors h-48 sm:h-[300px] resize-y"
                          placeholder="Describe your character's personality, background, and role (e.g., A friendly AI assistant, A wise sorceress from the realm of Ethereal...)"
                        />
                        <p className="text-xs text-[var(--grey-1)] mt-1">
                          This description will be used as the character's core personality in conversations.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Configuration - Also in Basic Info Tab */}
                  <div className="bg-[var(--dark-2)] rounded-lg p-4 sm:p-6 border border-[var(--grey-0)]">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <FiMessageCircle size={20} className="text-[var(--primary)]" />
                        <h3 className="text-lg font-semibold text-white">Conversation Settings</h3>
                      </div>

                      {/* First Message */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Welcome Message
                        </label>
                        <textarea
                          value={editForm.firstMessage}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstMessage: e.target.value }))}
                          className="w-full p-3 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors h-48 sm:h-[300px] resize-y"
                          placeholder="The character's opening message when starting a new conversation..."
                        />
                        <p className="text-xs text-[var(--grey-1)] mt-1">
                          This message will be displayed when users first interact with your character.
                        </p>
                      </div>

                      {/* Example Dialogue */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Example Dialogue
                        </label>
                        <textarea
                          value={editForm.exampleDialogue}
                          onChange={(e) => setEditForm(prev => ({ ...prev, exampleDialogue: e.target.value }))}
                          className="w-full p-3 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors h-32 resize-y"
                          placeholder="User: Hello!
Character: *waves enthusiastically* Greetings! How may I assist you today?"
                        />
                        <p className="text-xs text-[var(--grey-1)] mt-1">
                          Example conversation to help guide the character's speaking style and behavior.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Image Gallery Section - Images Tab */}
              {activeTab === 'images' && (
                <div className="bg-[var(--dark-2)] rounded-lg p-4 sm:p-6 border border-[var(--grey-0)]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FiImage size={20} className="text-[var(--primary)]" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">Image Gallery</h3>
                        <p className="text-sm text-[var(--grey-1)]">Add images to personalize your character</p>
                      </div>
                    </div>

                    {/* Gallery Mode Selector */}
                    <GalleryModeSelector
                      selectedMode={editForm.imageGallery.mode}
                      onModeChange={handleGalleryModeChange}
                    />

                    {/* Image Upload Interface */}
                    <ImageUploadInterface
                      mode={editForm.imageGallery.mode}
                      currentImages={editForm.imageGallery.images}
                      onImageUpload={handleImageUpload}
                      onValidationError={handleImageGalleryError}
                    />

                    {/* Image Preview Grid */}
                    {editForm.imageGallery.images.length > 0 && (
                      <ImagePreviewGrid
                        mode={editForm.imageGallery.mode}
                        images={editForm.imageGallery.images}
                        activeImageIndex={editForm.imageGallery.activeImageIndex}
                        onRemoveImage={handleImageRemove}
                        onSetActiveImage={handleSetActiveImage}
                      />
                    )}

                    {/* Error Display */}
                    {imageGalleryError && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{imageGalleryError}</p>
                      </div>
                    )}
                    
                    {/* Storage Error Display */}
                    {storageError && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-orange-400 mt-0.5">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-orange-400 text-sm font-medium mb-1">Storage Limit Reached</p>
                            <p className="text-orange-300 text-sm">{storageError}</p>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  const { cleanupLargestImages } = useChatStore.getState()
                                  cleanupLargestImages()
                                  setStorageError('')
                                }}
                                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                              >
                                Clean Up Images
                              </button>
                              <button
                                onClick={() => setStorageError('')}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lorebook Management - Lorebook Tab */}
              {characterManagerMode === 'edit' && editingCharacterId && activeTab === 'lorebook' && (
                <div className="bg-[var(--dark-2)] rounded-lg p-4 sm:p-6 border border-[var(--grey-0)]">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <FiBook size={20} className="text-[var(--primary)]" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">Lorebook Entries</h3>
                          <p className="text-sm text-[var(--grey-1)]">Context-sensitive information for your character</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowLorebookForm(true)}
                        className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium w-full sm:w-auto justify-center"
                      >
                        <FiPlus size={16} /> Add Entry
                      </button>
                    </div>

                    {/* Lorebook Entry Form */}
                    {showLorebookForm && (
                      <div className="bg-[var(--dark-1)] p-5 rounded-lg border border-[var(--primary)]/30 space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FiPlus size={16} className="text-[var(--primary)]" />
                          <h4 className="font-medium text-white">
                            {editingLorebookId ? 'Edit Entry' : 'New Entry'}
                          </h4>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Entry Name</label>
                          <input
                            type="text"
                            value={newLorebookEntry.name}
                            onChange={(e) => setNewLorebookEntry(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors"
                            placeholder="Name this lorebook entry"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Trigger Words</label>
                          <input
                            type="text"
                            value={newLorebookEntry.triggers}
                            onChange={(e) => setNewLorebookEntry(prev => ({ ...prev, triggers: e.target.value }))}
                            className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors"
                            placeholder="magic, spell, tower (comma-separated)"
                          />
                          <p className="text-xs text-[var(--grey-1)] mt-1">
                            When any of these words appear in user messages, this entry will be activated.
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Description</label>
                          <textarea
                            value={newLorebookEntry.description}
                            onChange={(e) => setNewLorebookEntry(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 bg-[var(--dark-2)] border border-[var(--grey-0)] rounded-lg text-white placeholder-[var(--grey-2)] focus:border-[var(--primary)] outline-none transition-colors h-28 resize-y"
                            placeholder="Context information that will be provided to the character when triggered..."
                          />
                          <p className="text-xs text-[var(--grey-1)] mt-1">
                            Use <code className="bg-[var(--dark-2)] px-1 py-0.5 rounded text-[var(--primary-light)]">{'{{char}}'}</code> and <code className="bg-[var(--dark-2)] px-1 py-0.5 rounded text-[var(--primary-light)]">{'{{user}}'}</code> for dynamic placeholders.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                          <label className="flex items-center gap-2 text-sm text-white w-full sm:w-auto">
                            <input
                              type="checkbox"
                              checked={newLorebookEntry.isActive}
                              onChange={(e) => setNewLorebookEntry(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="w-4 h-4 text-[var(--primary)] bg-[var(--dark-2)] border-[var(--grey-0)] rounded focus:ring-[var(--primary)] focus:ring-2"
                            />
                            <span>Active Entry</span>
                          </label>
                          <div className="flex gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                setShowLorebookForm(false)
                                setEditingLorebookId(null)
                                setNewLorebookEntry(getDefaultLorebookEntry())
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-[var(--dark-2)] text-[var(--grey-1)] rounded-lg hover:bg-[var(--dark-3)] hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddLorebookEntry}
                              className="w-full sm:w-auto px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-medium"
                            >
                              {editingLorebookId ? 'Update Entry' : 'Add Entry'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lorebook Entries List */}
                    <div className="space-y-3">
                      {characters[editingCharacterId]?.lorebook?.length > 0 ? (
                        characters[editingCharacterId].lorebook.map((entry) => (
                          <div
                            key={entry.id}
                            className="bg-[var(--dark-1)] p-4 rounded-lg border border-[var(--grey-0)] hover:border-[var(--primary)]/30 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row items-start justify-between">
                              <div className="flex-1 mb-3 sm:mb-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-white">{entry.name}</h4>
                                  {entry.isActive ? (
                                    <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                      <FiEye size={12} /> Active
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs bg-[var(--grey-0)] text-[var(--grey-2)] px-2 py-1 rounded-full">
                                      <FiEyeOff size={12} /> Inactive
                                    </span>
                                  )}
                                </div>
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-[var(--grey-2)] uppercase tracking-wide">Triggers:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(Array.isArray(entry.triggers) ? entry.triggers : entry.triggers.split(',')).map((trigger, idx) => (
                                      <span key={idx} className="text-xs bg-[var(--primary)]/20 text-[var(--primary-light)] px-2 py-1 rounded">
                                        {trigger.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-[var(--grey-1)] leading-relaxed">{entry.description}</p>
                              </div>
                              <div className="flex gap-2 ml-0 sm:ml-4 self-end sm:self-start">
                                <button
                                  onClick={() => handleEditLorebookEntry(entry)}
                                  className="p-2 bg-[var(--dark-2)] hover:bg-[var(--primary)] text-[var(--grey-1)] hover:text-white rounded-md transition-colors"
                                  title="Edit Entry"
                                >
                                  <FiEdit size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete lorebook entry "${entry.name}"?`)) {
                                      deleteLorebookEntry(editingCharacterId, entry.id)
                                    }
                                  }}
                                  className="p-2 bg-[var(--dark-2)] hover:bg-red-600 text-[var(--grey-1)] hover:text-white rounded-md transition-colors"
                                  title="Delete Entry"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FiBook size={32} className="text-[var(--grey-2)] mx-auto mb-3" />
                          <p className="text-[var(--grey-1)] mb-2">No lorebook entries yet</p>
                          <p className="text-sm text-[var(--grey-2)]">Add entries to provide context-sensitive information for your character.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  onClick={() => {
                    // Clean up image preview URLs to prevent memory leaks
                    editForm.imageGallery.images.forEach(img => {
                      if (img.previewUrl && img.previewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(img.previewUrl)
                      }
                    })
                    
                    setCharacterManagerMode('list')
                    setEditingCharacterId(null)
                    setEditForm(getDefaultForm())
                    setShowLorebookForm(false)
                    setEditingLorebookId(null)
                    setNewLorebookEntry(getDefaultLorebookEntry())
                    setImageGalleryError('')
                  }}
                  className="px-6 py-3 bg-[var(--dark-2)] text-[var(--grey-1)] rounded-lg hover:bg-[var(--dark-3)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCharacter}
                  disabled={!editForm.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FiSave size={16} />
                  {characterManagerMode === 'create' ? 'Create Character' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharacterManager
