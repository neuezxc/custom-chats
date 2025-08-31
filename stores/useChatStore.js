import { create } from "zustand";
import { persist } from "zustand/middleware";
import data from "../data/Hayeon (Default).json";

let hayeon = data.character;
const useChatStore = create(
  persist(
    (set, get) => ({
      // Chat State - Per-Character Conversations\n      conversations: {\n        'hayeon': [{\n          id: 'hayeon_welcome',\n          type: 'character',\n          content: 'Hello! I\\'m Hayeon, your friendly AI assistant. How can I help you today?',\n          sender: 'Hayeon'\n        }]\n      },
      messages: [
        {
          id: "hayeon_welcome",
          type: "character",
          content: hayeon.firstMessage,
          sender: "Hayeon",
        },
      ], // Current conversation messages
      isTyping: false,
      isRegenerating: false, // Separate state for regeneration
      regeneratingMessageId: null, // Track which message is being regenerated
      lastLLMResponse: "", // Track last LLM response for emotion detection
      emotionStates: {}, // Track emotion states per character
      currentCharacter: {
        id: "hayeon",
        name: hayeon.name,
        description: hayeon.description,
        avatar: hayeon.avatar,
        firstMessage: hayeon.firstMessage,
        exampleDialogue: "",
        lorebook: [],
        imageGallery: hayeon.imageGallery,
      },

      // User Management
      currentUser: {
        name: "User",
        description: "A curious person",
        avatar: null,
      },

      // Character Management
      characters: {
        hayeon: {
          id: "hayeon",
          name: hayeon.name,
          description: hayeon.description,
          avatar: hayeon.avatar,
          firstMessage: hayeon.firstMessage,
          exampleDialogue: "",
          lorebook: [],
          imageGallery: hayeon.imageGallery,
        },
      },

      // Custom System Prompt Settings
      customSystemPrompt: {
        enabled: false,
        content: "",
        useStructuredPrompting: false,
      },

      // Display Settings
      displaySettings: {
        primaryColor: "#5373cc",
        primaryLightColor: "#c0d1fc",
        textSize: "medium", // 'small', 'medium', 'large'
      },

      // API Configuration
      apiSettings: {
        provider: "gemini", // 'gemini' or 'openrouter'
        geminiApiKey: "",
        openrouterApiKey: "",
        selectedModel: "gemini-2.5-flash",
      },

      // UI State
      expandChats: true,
      showApiSettingsModal: false,
      showCharacterManager: false,
      showCustomSystemPrompt: false,
      showUserProfileModal: false,
      showDisplaySettingsModal: false,
      showDataManagementModal: false,

      characterManagerMode: "list", // 'list', 'edit', 'create'
      editingCharacterId: null,

      // Available Models (comprehensive list from LISTS_MODELS.md)
      availableModels: {
        gemini: [
          { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
          { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
          { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
        ],
        openrouter: [
          {
            id: "deepseek/deepseek-chat-v3.1:free",
            name: "DeepSeek V3.1 (free)",
          },
          { id: "deepseek/deepseek-r1-0528:free", name: "R1 0528 (free)" },
          {
            id: "deepseek/deepseek-chat-v3-0324:free",
            name: "DeepSeek V3 0324 (free)",
          },
          { id: "deepseek/deepseek-r1:free", name: "DeepSeek: R1 (free)" },
          { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder (free)" },
          {
            id: "tngtech/deepseek-r1t2-chimera:free",
            name: "DeepSeek R1T2 Chimera (free)",
          },
          { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air (free)" },
          {
            id: "tngtech/deepseek-r1t-chimera:free",
            name: "DeepSeek R1T Chimera (free)",
          },
          { id: "moonshotai/kimi-k2:free", name: "Kimi K2 (free)" },
          { id: "qwen/qwen3-235b-a22b:free", name: "Qwen3 235B A22B (free)" },
        ],
      },

      // Actions
      initializeConversations: () =>
        set((state) => {
          const updatedConversations = { ...state.conversations };
          const character = state.currentCharacter;

          // Ensure current character has a welcome message if no messages exist
          if (state.messages.length === 0 && character.firstMessage) {
            // Process placeholders in first message
            let processedFirstMessage = character.firstMessage
              .replace(/\{\{char\}\}/g, character.name)
              .replace(/\{\{user\}\}/g, state.currentUser.name || "User")
              .replace(
                /\{\{user_description\}\}/g,
                state.currentUser.description ||
                  "A curious person exploring conversations with AI characters."
              );

            const welcomeMessage = {
              id: `${character.id}_welcome`,
              type: "character",
              content: processedFirstMessage,
              sender: character.name,
            };
            updatedConversations[character.id] = [welcomeMessage];

            return {
              conversations: updatedConversations,
              messages: [welcomeMessage],
            };
          }

          return state;
        }),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: message.id || `msg_${Date.now()}`,
              ...message,
            },
          ],
        })),

      clearMessages: () =>
        set((state) => {
          const character = state.currentCharacter;
          let newMessages = [];

          // If the character has a welcome message, add it to the cleared conversation
          if (character && character.firstMessage) {
            // Process placeholders in first message
            let processedFirstMessage = character.firstMessage
              .replace(/\{\{char\}\}/g, character.name)
              .replace(/\{\{user\}\}/g, state.currentUser.name || "User")
              .replace(
                /\{\{user_description\}\}/g,
                state.currentUser.description ||
                  "A curious person exploring conversations with AI characters."
              );

            newMessages = [
              {
                id: `${character.id}_welcome`,
                type: "character",
                content: processedFirstMessage,
                sender: character.name,
              },
            ];
          }

          return {
            messages: newMessages,
            conversations: {
              ...state.conversations,
              [character.id]: newMessages,
            },
          };
        }),

      setIsTyping: (typing) => set({ isTyping: typing }),

      setIsRegenerating: (regenerating) =>
        set({ isRegenerating: regenerating }),

      setRegeneratingMessageId: (messageId) =>
        set({ regeneratingMessageId: messageId }),

      setExpandChats: (expand) => set({ expandChats: expand }),

      setShowApiSettingsModal: (show) => set({ showApiSettingsModal: show }),

      setShowCustomSystemPrompt: (show) =>
        set({ showCustomSystemPrompt: show }),

      setShowUserProfileModal: (show) => set({ showUserProfileModal: show }),

      setShowDisplaySettingsModal: (show) =>
        set({ showDisplaySettingsModal: show }),

      setShowDataManagementModal: (show) =>
        set({ showDataManagementModal: show }),

      // Display Settings Actions
      updateDisplaySettings: (updates) =>
        set((state) => ({
          displaySettings: { ...state.displaySettings, ...updates },
        })),

      // Custom System Prompt Actions
      updateCustomSystemPrompt: (settings) => {
        try {
          set((state) => ({
            customSystemPrompt: { ...state.customSystemPrompt, ...settings },
          }));
        } catch (error) {
          if (
            error.name === "QuotaExceededError" ||
            error.message.includes("quota")
          ) {
            const errorResult = get().handleStorageQuotaError(error);
            throw new Error(
              `Custom system prompt too large. ${errorResult.message}`
            );
          }
          throw error;
        }
      },

      selectCharacter: (characterId) =>
        set((state) => {
          const character = state.characters[characterId];
          if (!character) return state;

          // Save current conversation to the previous character
          const updatedConversations = {
            ...state.conversations,
            [state.currentCharacter.id]: state.messages,
          };

          // Load the new character's conversation
          let newMessages = updatedConversations[characterId] || [];

          // If no messages exist for this character, add their welcome message
          if (newMessages.length === 0 && character.firstMessage) {
            // Process placeholders in first message
            let processedFirstMessage = character.firstMessage
              .replace(/\{\{char\}\}/g, character.name)
              .replace(/\{\{user\}\}/g, state.currentUser.name || "User")
              .replace(
                /\{\{user_description\}\}/g,
                state.currentUser.description ||
                  "A curious person exploring conversations with AI characters."
              );

            newMessages = [
              {
                id: `${characterId}_welcome`,
                type: "character",
                content: processedFirstMessage,
                sender: character.name,
              },
            ];
            // Update the conversations to include this welcome message
            updatedConversations[characterId] = newMessages;
          }

          return {
            currentCharacter: character,
            conversations: updatedConversations,
            messages: newMessages,
          };
        }),

      // Character Management Actions
      createCharacter: (characterData) =>
        set((state) => {
          const newCharacter = {
            ...characterData,
            id: characterData.id || `char_${Date.now()}`,
            lorebook: characterData.lorebook || [],
            imageGallery: characterData.imageGallery || {
              mode: "default",
              images: [],
              activeImageIndex: 0,
            },
          };
          return {
            characters: {
              ...state.characters,
              [newCharacter.id]: newCharacter,
            },
          };
        }),

      updateCharacter: (characterId, updates) => {
        try {
          set((state) => {
            if (!state.characters[characterId]) return state;

            const updatedCharacter = {
              ...state.characters[characterId],
              ...updates,
            };

            return {
              characters: {
                ...state.characters,
                [characterId]: updatedCharacter,
              },
              // Update currentCharacter if it's the one being edited
              currentCharacter:
                state.currentCharacter.id === characterId
                  ? updatedCharacter
                  : state.currentCharacter,
            };
          });
        } catch (error) {
          if (
            error.name === "QuotaExceededError" ||
            error.message.includes("quota")
          ) {
            const errorResult = get().handleStorageQuotaError(error);
            // Throw an error that the UI can catch
            throw new Error(errorResult.message);
          }
          throw error;
        }
      },

      deleteCharacter: (characterId) =>
        set((state) => {
          const { [characterId]: deleted, ...remainingCharacters } =
            state.characters;
          return {
            characters: remainingCharacters,
            // Switch to default character if current was deleted
            currentCharacter:
              state.currentCharacter.id === characterId
                ? Object.values(remainingCharacters)[0] ||
                  state.currentCharacter
                : state.currentCharacter,
          };
        }),

      // User Management Actions
      updateUser: (updates) =>
        set((state) => ({
          currentUser: { ...state.currentUser, ...updates },
        })),

      // API Settings Actions
      updateApiSettings: (updates) =>
        set((state) => ({
          apiSettings: { ...state.apiSettings, ...updates },
        })),

      // Lorebook Management Actions
      addLorebookEntry: (characterId, entry) =>
        set((state) => {
          if (!state.characters[characterId]) return state;

          const newEntry = {
            ...entry,
            id: entry.id || `lore_${Date.now()}`,
            isActive: entry.isActive !== undefined ? entry.isActive : true,
          };

          const character = state.characters[characterId];
          const updatedCharacter = {
            ...character,
            lorebook: [...character.lorebook, newEntry],
          };

          return {
            characters: {
              ...state.characters,
              [characterId]: updatedCharacter,
            },
            currentCharacter:
              state.currentCharacter.id === characterId
                ? updatedCharacter
                : state.currentCharacter,
          };
        }),

      updateLorebookEntry: (characterId, entryId, updates) =>
        set((state) => {
          if (!state.characters[characterId]) return state;

          const character = state.characters[characterId];
          const updatedLorebook = character.lorebook.map((entry) =>
            entry.id === entryId ? { ...entry, ...updates } : entry
          );

          const updatedCharacter = {
            ...character,
            lorebook: updatedLorebook,
          };

          return {
            characters: {
              ...state.characters,
              [characterId]: updatedCharacter,
            },
            currentCharacter:
              state.currentCharacter.id === characterId
                ? updatedCharacter
                : state.currentCharacter,
          };
        }),

      deleteLorebookEntry: (characterId, entryId) =>
        set((state) => {
          if (!state.characters[characterId]) return state;

          const character = state.characters[characterId];
          const updatedLorebook = character.lorebook.filter(
            (entry) => entry.id !== entryId
          );

          const updatedCharacter = {
            ...character,
            lorebook: updatedLorebook,
          };

          return {
            characters: {
              ...state.characters,
              [characterId]: updatedCharacter,
            },
            currentCharacter:
              state.currentCharacter.id === characterId
                ? updatedCharacter
                : state.currentCharacter,
          };
        }),

      // Image Gallery Management Actions
      setCharacterGalleryMode: (characterId, mode) =>
        set((state) => {
          if (!state.characters[characterId]) return state;

          const character = state.characters[characterId];
          const updatedCharacter = {
            ...character,
            imageGallery: {
              ...character.imageGallery,
              mode: mode,
              // Reset images when switching modes
              images: [],
              activeImageIndex: 0,
            },
          };

          return {
            characters: {
              ...state.characters,
              [characterId]: updatedCharacter,
            },
            currentCharacter:
              state.currentCharacter.id === characterId
                ? updatedCharacter
                : state.currentCharacter,
          };
        }),

      addCharacterImage: (characterId, imageData) =>
        set((state) => {
          if (!state.characters[characterId]) return state;

          const character = state.characters[characterId];
          const { imageGallery } = character;

          // Validate image count based on mode
          const maxImages = imageGallery.mode === "default" ? 1 : 5;
          if (imageGallery.images.length >= maxImages) {
            console.warn(
              `Cannot add more images. Maximum ${maxImages} images allowed for ${imageGallery.mode} mode.`
            );
            return state;
          }

          const newImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file: imageData.file,
            previewUrl: imageData.previewUrl,
            filename: imageData.filename,
            size: imageData.size,
            uploadDate: Date.now(),
          };

          const updatedCharacter = {
            ...character,
            imageGallery: {
              ...imageGallery,
              images: [...imageGallery.images, newImage],
              // Set as active if it's the first image
              activeImageIndex:
                imageGallery.images.length === 0
                  ? 0
                  : imageGallery.activeImageIndex,
            },
          };

          return {
            characters: {
              ...state.characters,
              [characterId]: updatedCharacter,
            },
            currentCharacter:
              state.currentCharacter.id === characterId
                ? updatedCharacter
                : state.currentCharacter,
          };
        }),

      removeCharacterImage: (characterId, imageId) =>
        set((state) => {
          if (!state.characters[characterId]) return state;

          const character = state.characters[characterId];
          const { imageGallery } = character;

          const imageIndex = imageGallery.images.findIndex(
            (img) => img.id === imageId
          );
          if (imageIndex === -1) return state;

          // Clean up the preview URL
          const imageToRemove = imageGallery.images[imageIndex];
          if (
            imageToRemove.previewUrl &&
            imageToRemove.previewUrl.startsWith("blob:")
          ) {
            URL.revokeObjectURL(imageToRemove.previewUrl);
          }

          const updatedImages = imageGallery.images.filter(
            (img) => img.id !== imageId
          );
          let newActiveIndex = imageGallery.activeImageIndex;

          // Adjust active index if necessary
          if (
            imageIndex <= imageGallery.activeImageIndex &&
            updatedImages.length > 0
          ) {
            newActiveIndex = Math.max(0, imageGallery.activeImageIndex - 1);
          } else if (updatedImages.length === 0) {
            newActiveIndex = 0;
          }

          const updatedCharacter = {
            ...character,
            imageGallery: {
              ...imageGallery,
              images: updatedImages,
              activeImageIndex: newActiveIndex,
            },
          };

          return {
            characters: {
              ...state.characters,
              [characterId]: updatedCharacter,
            },
            currentCharacter:
              state.currentCharacter.id === characterId
                ? updatedCharacter
                : state.currentCharacter,
          };
        }),

      setActiveCharacterImage: (characterId, index) =>
        set((state) => {
          if (!state.characters[characterId]) return state;

          const character = state.characters[characterId];
          const { imageGallery } = character;

          if (index < 0 || index >= imageGallery.images.length) {
            console.warn("Invalid image index:", index);
            return state;
          }

          const updatedCharacter = {
            ...character,
            imageGallery: {
              ...imageGallery,
              activeImageIndex: index,
            },
          };

          return {
            characters: {
              ...state.characters,
              [characterId]: updatedCharacter,
            },
            currentCharacter:
              state.currentCharacter.id === characterId
                ? updatedCharacter
                : state.currentCharacter,
          };
        }),

      // Emotion Mode Management Actions
      updateLastLLMResponse: (response) =>
        set({
          lastLLMResponse: response,
        }),

      setCharacterEmotion: (characterId, emotion) =>
        set((state) => ({
          emotionStates: {
            ...state.emotionStates,
            [characterId]: {
              currentEmotion: emotion,
              timestamp: Date.now(),
            },
          },
        })),

      getCharacterEmotion: (characterId) => {
        const state = get();
        return state.emotionStates[characterId]?.currentEmotion || null;
      },

      clearEmotionState: (characterId) =>
        set((state) => {
          const { [characterId]: removed, ...remainingStates } =
            state.emotionStates;
          return {
            emotionStates: remainingStates,
          };
        }),

      validateImageUpload: (file, currentMode, existingImages) => {
        const validationErrors = [];

        // File type validation
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          validationErrors.push(
            "Please upload JPG, PNG, GIF, or WebP images only"
          );
        }

        // File size validation (5MB per file)
        const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxFileSize) {
          validationErrors.push("Image size must be less than 5MB");
        }

        // Count validation based on mode
        if (currentMode === "default" && existingImages.length >= 1) {
          validationErrors.push("Only 1 image allowed in default mode");
        } else if (currentMode === "multiple") {
          if (existingImages.length >= 5) {
            validationErrors.push("Maximum 5 images allowed in multiple mode");
          }
        }

        // Total size validation for multiple mode (25MB total)
        if (currentMode === "multiple") {
          const totalSize =
            existingImages.reduce((sum, img) => sum + (img.size || 0), 0) +
            file.size;
          const maxTotalSize = 25 * 1024 * 1024; // 25MB in bytes
          if (totalSize > maxTotalSize) {
            validationErrors.push("Total images size must be less than 25MB");
          }
        }

        return {
          isValid: validationErrors.length === 0,
          errors: validationErrors,
        };
      },

      // Helper function to generate image preview URL with compression
      generateImagePreview: (
        file,
        maxWidth = 800,
        maxHeight = 600,
        quality = 0.8
      ) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Validate image dimensions
            const img = new Image();
            img.onload = () => {
              if (img.width < 200 || img.height < 200) {
                reject(new Error("Image must be at least 200x200 pixels"));
                return;
              }

              // Create canvas for compression
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              // Calculate new dimensions while maintaining aspect ratio
              let { width, height } = img;
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
              }

              canvas.width = width;
              canvas.height = height;

              // Draw and compress
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

              // Check if compression helped significantly
              const originalSize = e.target.result.length;
              const compressedSize = compressedDataUrl.length;
              const compressionRatio = compressedSize / originalSize;

              console.log(
                `Image compression: ${originalSize} -> ${compressedSize} (${(
                  compressionRatio * 100
                ).toFixed(1)}%)`
              );

              resolve(compressedDataUrl);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target.result;
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
      },

      // localStorage quota management
      getStorageUsage: () => {
        const state = get();
        // Create a copy of state without URL images for storage calculation
        const stateForStorage = {
          ...state,
          characters: Object.fromEntries(
            Object.entries(state.characters).map(([id, char]) => [
              id,
              {
                ...char,
                imageGallery: {
                  ...char.imageGallery,
                  images:
                    char.imageGallery?.images?.filter((img) => !img.isUrl) ||
                    [],
                },
              },
            ])
          ),
        };

        const stateString = JSON.stringify(stateForStorage);
        const sizeInBytes = new Blob([stateString]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        return {
          bytes: sizeInBytes,
          mb: sizeInMB,
          percentage: Math.round((sizeInBytes / (5 * 1024 * 1024)) * 100), // Assuming 5MB limit
        };
      },

      cleanupLargestImages: () =>
        set((state) => {
          const updatedCharacters = { ...state.characters };
          let totalCleaned = 0;

          // Find and remove largest images across all characters
          Object.keys(updatedCharacters).forEach((charId) => {
            const char = updatedCharacters[charId];
            if (char.imageGallery?.images?.length > 0) {
              // Sort images by size and remove largest ones
              const sortedImages = [...char.imageGallery.images].sort(
                (a, b) => b.size - a.size
              );
              const imagesToKeep = sortedImages.slice(
                Math.floor(sortedImages.length / 2)
              ); // Keep smallest 50%

              // Clean up blob URLs for removed images
              sortedImages
                .slice(0, Math.floor(sortedImages.length / 2))
                .forEach((img) => {
                  if (img.previewUrl && img.previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(img.previewUrl);
                  }
                  totalCleaned++;
                });

              updatedCharacters[charId] = {
                ...char,
                imageGallery: {
                  ...char.imageGallery,
                  images: imagesToKeep,
                  activeImageIndex: Math.min(
                    char.imageGallery.activeImageIndex,
                    imagesToKeep.length - 1
                  ),
                },
              };
            }
          });

          console.log(
            `Cleaned up ${totalCleaned} images to free storage space`
          );
          return {
            ...state,
            characters: updatedCharacters,
          };
        }),

      // Enhanced error handling for quota exceeded
      handleStorageQuotaError: (error) => {
        console.error("Storage quota exceeded:", error);

        // Try to free up space by cleaning images
        const actions = get();
        const usage = actions.getStorageUsage();

        if (usage.mb > 4) {
          // If over 4MB, try cleanup
          actions.cleanupLargestImages();
          return {
            success: false,
            message: `Storage limit reached (${usage.mb}MB). Automatically removed some large images to free space. Please try uploading again with a smaller image.`,
            suggestion:
              "Consider using images under 1MB or enabling compression.",
          };
        }

        return {
          success: false,
          message:
            "Storage limit exceeded. Try removing some characters or images to free up space.",
          suggestion:
            "Use smaller images or enable image compression to save space.",
        };
      },

      // UI State Management
      setShowCharacterManager: (show) => set({ showCharacterManager: show }),

      setCharacterManagerMode: (mode) => set({ characterManagerMode: mode }),
      setEditingCharacterId: (id) => set({ editingCharacterId: id }),

      // Import/Export Characters
      exportCharacter: (characterId) => {
        const state = get();
        const character = state.characters[characterId];
        if (!character) return null;

        return {
          version: "1.0",
          character: character,
        };
      },

      importCharacter: (characterData) =>
        set((state) => {
          const character = characterData.character || characterData;
          const newId = `${character.id}_${Date.now()}`;

          const importedCharacter = {
            ...character,
            id: newId,
            name: character.name + " (Imported)",
          };

          return {
            characters: {
              ...state.characters,
              [newId]: importedCharacter,
            },
          };
        }),

      // Data Export Function
      exportAllData: () => {
        const state = get();
        // Create a clean export object without functions
        const exportData = {
          version: "1.0",
          timestamp: new Date().toISOString(),
          messages: state.messages,
          conversations: state.conversations,
          currentCharacter: state.currentCharacter,
          currentUser: state.currentUser,
          characters: state.characters,
          apiSettings: state.apiSettings,
          displaySettings: state.displaySettings,
          customSystemPrompt: state.customSystemPrompt,
        };
        return exportData;
      },

      // Data Import Function
      importAllData: (importData) => {
        try {
          // Validate import data
          if (!importData || !importData.version) {
            throw new Error("Invalid backup file");
          }

          // Update state with imported data
          set({
            messages: importData.messages || [],
            conversations: importData.conversations || {},
            currentCharacter:
              importData.currentCharacter || get().currentCharacter,
            currentUser: importData.currentUser || get().currentUser,
            characters: importData.characters || get().characters,
            apiSettings: importData.apiSettings || get().apiSettings,
            displaySettings:
              importData.displaySettings || get().displaySettings,
            customSystemPrompt:
              importData.customSystemPrompt || get().customSystemPrompt,
          });

          return { success: true };
        } catch (error) {
          console.error("Import failed:", error);
          return { success: false, error: error.message };
        }
      },

      // Data Clear Functions
      clearAllData: () => {
        // Preserve Hayeon as the default character
        const hayeonCharacter = {
          id: "hayeon",
          name: hayeon.name,
          description: hayeon.description,
          avatar: hayeon.avatar,
          firstMessage: hayeon.firstMessage,
          exampleDialogue: "",
          lorebook: [],
          imageGallery: hayeon.imageGallery,
        };

        set({
          messages: [
            {
              id: "hayeon_welcome",
              type: "character",
              content: hayeon.firstMessage,
              sender: "Hayeon",
            },
          ],
          conversations: {
            hayeon: [
              {
                id: "hayeon_welcome",
                type: "character",
                content: hayeon.firstMessage,
                sender: "Hayeon",
              },
            ],
          },
          characters: {
            hayeon: hayeonCharacter,
          },
          currentCharacter: hayeonCharacter,
          apiSettings: {
            provider: "gemini",
            geminiApiKey: "",
            openrouterApiKey: "",
            selectedModel: "gemini-2.5-flash",
          },
          displaySettings: {
            primaryColor: "#5373cc",
            primaryLightColor: "#c0d1fc",
            textSize: "medium",
          },
          customSystemPrompt: {
            enabled: false,
            content: "",
            useStructuredPrompting: false,
          },
        });
      },

      clearConversations: () => {
        const { currentCharacter } = get();
        let newMessages = [];

        // If the character has a welcome message, add it to the cleared conversation
        if (currentCharacter && currentCharacter.firstMessage) {
          newMessages = [
            {
              id: `${currentCharacter.id}_welcome`,
              type: "character",
              content: currentCharacter.firstMessage,
              sender: currentCharacter.name,
            },
          ];
        }

        set({
          messages: newMessages,
          conversations: {
            [currentCharacter.id]: newMessages,
          },
        });
      },

      clearCharacters: () => {
        // Preserve Hayeon as the default character
        const hayeonCharacter = {
          id: "hayeon",
          name: "Hayeon",
          description:
            "A friendly AI assistant ready to chat with you. You help users with various topics in a casual conversation setting.",
          avatar: null,
          firstMessage:
            "Hello! I'm Hayeon, your friendly AI assistant. How can I help you today?",
          exampleDialogue: "",
          lorebook: [],
          imageGallery: {
            mode: "default",
            images: [],
            activeImageIndex: 0,
          },
        };

        set({
          characters: {
            hayeon: hayeonCharacter,
          },
          currentCharacter: hayeonCharacter,
        });
      },

      // Message validation
      validateMessage: (text) => {
        if (!text || typeof text !== "string") return false;
        const trimmed = text.trim();
        if (trimmed.length === 0) return false;
        if (trimmed.length > 2000) return false; // Max length limit
        return trimmed;
      },

      // Chat Deletion Helper Functions
      calculateDeletionRange: (messages, userMessageIndex) => {
        // Find the range of messages to delete starting from user message
        // Include all messages from the user message to the end
        return {
          startIndex: userMessageIndex,
          endIndex: messages.length,
        };
      },

      findWelcomeMessage: (messages, startIndex, endIndex, character) => {
        // Check if welcome message is in deletion range and preserve it
        for (let i = startIndex; i < endIndex && i < messages.length; i++) {
          const message = messages[i];
          if (
            message.type === "character" &&
            message.sender === character.name
          ) {
            // Check if this is a welcome message by ID pattern or content match
            const isWelcomeById =
              message.id &&
              typeof message.id === "string" &&
              message.id.includes("welcome");

            // Check if this matches the character's first message (welcome message)
            const isWelcomeByContent =
              character.firstMessage &&
              message.content === character.firstMessage;

            if (isWelcomeById || isWelcomeByContent) {
              return message;
            }
          }
        }
        return null;
      },

      // Delete User Message Action with cascading deletion
      deleteUserMessage: (messageIndex) =>
        set((state) => {
          const { messages, currentCharacter, conversations } = state;

          // Validation
          if (messageIndex < 0 || messageIndex >= messages.length) {
            console.warn("Invalid message index for deletion:", messageIndex);
            return state;
          }

          const messageToDelete = messages[messageIndex];
          if (messageToDelete.type !== "user") {
            console.warn("Cannot delete non-user message");
            return state;
          }

          // Calculate deletion range using helper function
          const { startIndex, endIndex } = get().calculateDeletionRange(
            messages,
            messageIndex
          );

          // Log version deletion for debugging
          const deletedMessages = messages.slice(startIndex, endIndex);
          deletedMessages.forEach((msg) => {
            if (msg.versions && msg.versions.length > 1) {
              console.log(
                `Deleting message ${msg.id} with ${msg.versions.length} versions`
              );
            }
          });

          // Check for welcome message in deletion range
          const welcomeMessage = get().findWelcomeMessage(
            messages,
            startIndex,
            endIndex,
            currentCharacter
          );

          // Create new messages array with deletion applied
          let newMessages = messages.slice(0, startIndex);

          // If we found a welcome message in the deletion range, preserve it
          if (welcomeMessage) {
            newMessages.push(welcomeMessage);
          }

          // Update conversations for current character
          const updatedConversations = {
            ...conversations,
            [currentCharacter.id]: newMessages,
          };

          return {
            messages: newMessages,
            conversations: updatedConversations,
          };
        }),

      // Send Message Action with enhanced functionality
      sendMessage: async (text) => {
        const {
          addMessage,
          setIsTyping,
          currentCharacter,
          apiSettings,
          validateMessage,
        } = get();

        // Validate input
        const validatedText = validateMessage(text);
        if (!validatedText) {
          console.warn("Invalid message:", text);
          return;
        }

        // Add user message
        addMessage({
          type: "user",
          content: validatedText,
          sender: "User",
        });

        // Set typing indicator
        setIsTyping(true);

        try {
          // Check if API is configured
          const hasApiKey =
            apiSettings.provider === "gemini"
              ? apiSettings.geminiApiKey
              : apiSettings.openrouterApiKey;

          if (!hasApiKey) {
            throw new Error("No API key configured");
          }

          // Get conversation context (last 10 messages for context)
          const { messages } = get();
          const conversationContext = prepareConversationContext(messages, 10);

          // Detect triggered lorebook entries
          const triggeredLore = detectTriggeredLorebook(
            validatedText,
            currentCharacter
          );

          // Call AI API with retry logic
          let response;
          const maxRetries = 3;
          let lastError;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              if (apiSettings.provider === "gemini") {
                response = await callGeminiAPI(
                  validatedText,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              } else {
                response = await callOpenRouterAPI(
                  validatedText,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              }
              break; // Success, exit retry loop
            } catch (error) {
              lastError = error;
              if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise((resolve) => setTimeout(resolve, delay));
                console.log(
                  `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
                );
              }
            }
          }

          if (!response) {
            throw lastError || new Error("Failed after all retry attempts");
          }

          // Add AI response
          addMessage({
            type: "character",
            content: response,
            sender: currentCharacter.name,
          });
        } catch (error) {
          console.error("Error sending message:", error);

          // Categorize errors for better user feedback
          let errorMessage = "Sorry, I encountered an error.";
          let errorType = "generic";

          if (error.message.includes("API key")) {
            errorMessage = "Please configure your API key in settings.";
            errorType = "api_key";
          } else if (
            error.message.includes("rate limit") ||
            error.message.includes("429")
          ) {
            errorMessage =
              "Rate limit exceeded. Please wait a moment before trying again.";
            errorType = "rate_limit";
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your connection and try again.";
            errorType = "network";
          } else if (
            error.message.includes("quota") ||
            error.message.includes("billing")
          ) {
            errorMessage =
              "API quota exceeded. Please check your billing settings.";
            errorType = "quota";
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again.";
            errorType = "timeout";
          }

          // Add error message with error type for UI handling
          addMessage({
            type: "character",
            content: errorMessage,
            sender: currentCharacter.name,
            isError: true,
            errorType: errorType,
          });
        } finally {
          setIsTyping(false);
        }
      },

      // Regenerate Last Message Action
      regenerateLastMessage: async () => {
        const {
          messages,
          isTyping,
          currentCharacter,
          apiSettings,
          setIsTyping,
          addMessage,
        } = get();

        // Validation: Check if regeneration is possible
        if (isTyping) {
          console.warn("Cannot regenerate while typing");
          return;
        }

        if (messages.length === 0) {
          console.warn("No messages to regenerate");
          return;
        }

        const lastMessage = messages[messages.length - 1];

        // Check if last message is from character and not an error
        if (lastMessage.type !== "character" || lastMessage.isError) {
          console.warn(
            "Cannot regenerate: last message is not a valid character message"
          );
          return;
        }

        // Find the user message that triggered this response
        let userMessageIndex = -1;
        for (let i = messages.length - 2; i >= 0; i--) {
          if (messages[i].type === "user") {
            userMessageIndex = i;
            break;
          }
        }

        if (userMessageIndex === -1) {
          console.warn("Cannot regenerate: no preceding user message found");
          return;
        }

        const userMessage = messages[userMessageIndex];

        try {
          // Remove the last character message
          set((state) => ({
            messages: state.messages.slice(0, -1),
          }));

          // Set typing indicator
          setIsTyping(true);

          // Check if API is configured
          const hasApiKey =
            apiSettings.provider === "gemini"
              ? apiSettings.geminiApiKey
              : apiSettings.openrouterApiKey;

          if (!hasApiKey) {
            throw new Error("No API key configured");
          }

          // Get conversation context (excluding the removed message)
          const { messages: updatedMessages } = get();
          const conversationContext = prepareConversationContext(
            updatedMessages,
            10
          );

          // Detect triggered lorebook entries from the original user message
          const triggeredLore = detectTriggeredLorebook(
            userMessage.content,
            currentCharacter
          );

          // Call AI API with retry logic
          let response;
          const maxRetries = 3;
          let lastError;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              if (apiSettings.provider === "gemini") {
                response = await callGeminiAPI(
                  userMessage.content,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              } else {
                response = await callOpenRouterAPI(
                  userMessage.content,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              }
              break; // Success, exit retry loop
            } catch (error) {
              lastError = error;
              if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise((resolve) => setTimeout(resolve, delay));
                console.log(
                  `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
                );
              }
            }
          }

          if (!response) {
            throw lastError || new Error("Failed after all retry attempts");
          }

          // Add the new AI response
          addMessage({
            type: "character",
            content: response,
            sender: currentCharacter.name,
          });
        } catch (error) {
          console.error("Error regenerating message:", error);

          // Categorize errors for better user feedback
          let errorMessage =
            "Sorry, I encountered an error while regenerating.";
          let errorType = "generic";

          if (error.message.includes("API key")) {
            errorMessage = "Please configure your API key in settings.";
            errorType = "api_key";
          } else if (
            error.message.includes("rate limit") ||
            error.message.includes("429")
          ) {
            errorMessage =
              "Rate limit exceeded. Please wait a moment before trying again.";
            errorType = "rate_limit";
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your connection and try again.";
            errorType = "network";
          } else if (
            error.message.includes("quota") ||
            error.message.includes("billing")
          ) {
            errorMessage =
              "API quota exceeded. Please check your billing settings.";
            errorType = "quota";
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again.";
            errorType = "timeout";
          }

          // Add error message with error type for UI handling
          addMessage({
            type: "character",
            content: errorMessage,
            sender: currentCharacter.name,
            isError: true,
            errorType: errorType,
          });
        } finally {
          setIsTyping(false);
        }
      },

      // Regenerate Message with Versioning
      regenerateMessageWithVersions: async (messageId) => {
        const {
          messages,
          currentCharacter,
          apiSettings,
          isTyping,
          isRegenerating,
        } = get();

        // Enhanced validation checks
        if (isTyping || isRegenerating) {
          console.warn(
            "Cannot regenerate while typing or already regenerating"
          );
          return;
        }

        // Validate API configuration first
        const hasApiKey =
          apiSettings.provider === "gemini"
            ? apiSettings.geminiApiKey
            : apiSettings.openrouterApiKey;

        if (!hasApiKey) {
          console.error("No API key configured for regeneration");
          // Immediately show error without entering loading state
          const messageIndex = messages.findIndex(
            (msg) => msg.id === messageId
          );
          if (messageIndex !== -1) {
            const message = messages[messageIndex];
            const errorVersion = get().createMessageVersion(
              "Please configure your API key in settings.",
              true
            );
            const updatedMessage = get().addVersionToMessage(
              message,
              errorVersion
            );

            set((state) => {
              const newMessages = state.messages.map((msg, idx) =>
                idx === messageIndex ? updatedMessage : msg
              );
              return {
                messages: newMessages,
                conversations: {
                  ...state.conversations,
                  [currentCharacter.id]: newMessages,
                },
              };
            });
          }
          return;
        }

        const messageIndex = messages.findIndex((msg) => msg.id === messageId);
        if (messageIndex === -1) {
          console.warn("Message not found:", messageId);
          return;
        }

        const message = messages[messageIndex];
        if (message.type !== "character") {
          console.warn("Can only regenerate character messages");
          return;
        }

        // Check if this is the latest character message
        let isLatest = true;
        for (let i = messageIndex + 1; i < messages.length; i++) {
          if (messages[i].type === "character") {
            isLatest = false;
            break;
          }
        }

        if (!isLatest) {
          console.warn("Can only regenerate the latest character message");
          return;
        }

        // Find the parent user message
        const parentUserMessage = get().findParentUserMessage(
          messages,
          messageIndex
        );
        if (!parentUserMessage) {
          console.warn("Cannot regenerate: No parent user message found");
          return;
        }

        // Declare variables outside try block to prevent ReferenceError in finally
        let startTime = null;
        const minLoadingDuration = 500; // 0.5 seconds minimum
        let regenerationTimeout = null;

        try {
          console.log("Starting regeneration for message:", messageId);
          set({ isRegenerating: true, regeneratingMessageId: messageId });

          // Record start time for minimum loading duration
          startTime = Date.now();

          // Set timeout protection to prevent stuck loading states
          const maxRegenerationDuration = 30000; // 30 seconds
          regenerationTimeout = setTimeout(() => {
            console.warn("Regeneration timeout exceeded, forcing reset");
            set({ isRegenerating: false, regeneratingMessageId: null });

            // Add timeout error version
            const timeoutErrorVersion = get().createMessageVersion(
              "Regeneration timed out. Please try again.",
              true
            );
            const updatedMessage = get().addVersionToMessage(
              message,
              timeoutErrorVersion
            );

            set((state) => {
              const newMessages = state.messages.map((msg, idx) =>
                idx === messageIndex ? updatedMessage : msg
              );
              return {
                messages: newMessages,
                conversations: {
                  ...state.conversations,
                  [currentCharacter.id]: newMessages,
                },
              };
            });
          }, maxRegenerationDuration);

          // Check API configuration
          const hasApiKey =
            apiSettings.provider === "gemini"
              ? apiSettings.geminiApiKey
              : apiSettings.openrouterApiKey;

          if (!hasApiKey) {
            throw new Error("No API key configured");
          }

          // Get conversation context (up to but not including current message)
          const contextMessages = messages.slice(0, messageIndex);
          const conversationContext = prepareConversationContext(
            contextMessages,
            10
          );

          // Detect triggered lorebook entries
          const triggeredLore = detectTriggeredLorebook(
            parentUserMessage.content,
            currentCharacter
          );

          // Call AI API with retry logic
          let response;
          const maxRetries = 3;
          let lastError;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              if (apiSettings.provider === "gemini") {
                response = await callGeminiAPI(
                  parentUserMessage.content,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              } else {
                response = await callOpenRouterAPI(
                  parentUserMessage.content,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              }
              break; // Success, exit retry loop
            } catch (error) {
              lastError = error;
              if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise((resolve) => setTimeout(resolve, delay));
                console.log(
                  `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
                );
              }
            }
          }

          if (!response) {
            throw lastError || new Error("Failed after all retry attempts");
          }

          // Create new version and update message
          const newVersion = get().createMessageVersion(response);
          const updatedMessage = get().addVersionToMessage(message, newVersion);

          // Update the message in state
          set((state) => {
            const newMessages = state.messages.map((msg, idx) =>
              idx === messageIndex ? updatedMessage : msg
            );
            return {
              messages: newMessages,
              conversations: {
                ...state.conversations,
                [currentCharacter.id]: newMessages,
              },
            };
          });
        } catch (error) {
          console.error("Error regenerating message:", error);
          console.log("Regeneration error details:", {
            messageId,
            errorMessage: error.message,
            errorType: error.name,
            stack: error.stack?.substring(0, 200),
          });

          // Enhanced error categorization for better user feedback
          let errorMessage =
            "Sorry, I encountered an error while regenerating.";
          let errorType = "generic";
          let isRetryable = true;

          if (error.message.includes("API key")) {
            errorMessage = "Please configure your API key in settings.";
            errorType = "api_key";
            isRetryable = false;
          } else if (
            error.message.includes("rate limit") ||
            error.message.includes("429")
          ) {
            errorMessage =
              "Rate limit exceeded. Please wait a moment before trying again.";
            errorType = "rate_limit";
            isRetryable = true;
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your connection and try again.";
            errorType = "network";
            isRetryable = true;
          } else if (
            error.message.includes("quota") ||
            error.message.includes("billing")
          ) {
            errorMessage =
              "API quota exceeded. Please check your billing settings.";
            errorType = "quota";
            isRetryable = false;
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again.";
            errorType = "timeout";
            isRetryable = true;
          }

          console.log("Error categorization:", {
            errorMessage,
            errorType,
            isRetryable,
          });

          // Create error version
          const errorVersion = get().createMessageVersion(errorMessage, true);
          const updatedMessage = get().addVersionToMessage(
            message,
            errorVersion
          );

          // Update the message in state
          set((state) => {
            const newMessages = state.messages.map((msg, idx) =>
              idx === messageIndex ? updatedMessage : msg
            );
            return {
              messages: newMessages,
              conversations: {
                ...state.conversations,
                [currentCharacter.id]: newMessages,
              },
            };
          });
        } finally {
          console.log("Regeneration completed for message:", messageId);

          // Clear any regeneration timeout
          if (regenerationTimeout) {
            clearTimeout(regenerationTimeout);
          }

          // Ensure minimum loading duration has elapsed if startTime was set
          if (startTime) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);

            if (remainingTime > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, remainingTime)
              );
            }
          }

          // Always reset regeneration state
          set({ isRegenerating: false, regeneratingMessageId: null });
        }
      },

      // Change active version
      changeMessageVersion: (messageId, direction) => {
        set((state) => {
          const messageIndex = state.messages.findIndex(
            (msg) => msg.id === messageId
          );
          if (messageIndex === -1) return state;

          const message = state.messages[messageIndex];
          if (!message.versions || message.versions.length <= 1) return state;

          const currentIndex = message.currentVersionIndex || 1;
          let newIndex = currentIndex + direction;

          // Boundary checks
          if (newIndex < 1) newIndex = 1;
          if (newIndex > message.versions.length)
            newIndex = message.versions.length;

          if (newIndex === currentIndex) return state;

          const selectedVersion = message.versions[newIndex - 1];
          const updatedMessage = {
            ...message,
            currentVersionIndex: newIndex,
            content: selectedVersion.content,
            isError: selectedVersion.isError || false,
          };

          const newMessages = state.messages.map((msg, idx) =>
            idx === messageIndex ? updatedMessage : msg
          );

          return {
            messages: newMessages,
            conversations: {
              ...state.conversations,
              [state.currentCharacter.id]: newMessages,
            },
          };
        });
      },

      // Helper functions for version management
      findParentUserMessage: (messages, characterMessageIndex) => {
        for (let i = characterMessageIndex - 1; i >= 0; i--) {
          if (messages[i].type === "user") {
            return messages[i];
          }
        }
        return null;
      },

      createMessageVersion: (content, isError = false) => ({
        id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        createdAt: new Date().toISOString(),
        versionIndex: 0, // Will be set when added to message
        isError,
      }),

      addVersionToMessage: (message, newVersion) => {
        // Initialize versions array if it doesn't exist
        let versions = message.versions || [
          {
            id: `ver_${message.id}_1`,
            content: message.content,
            createdAt: message.createdAt || new Date().toISOString(),
            versionIndex: 1,
            isError: message.isError || false,
          },
        ];

        // Add new version with correct index
        const newVersionWithIndex = {
          ...newVersion,
          versionIndex: versions.length + 1,
        };

        const updatedVersions = [...versions, newVersionWithIndex];

        return {
          ...message,
          versions: updatedVersions,
          currentVersionIndex: newVersionWithIndex.versionIndex,
          content: newVersion.content,
          isError: newVersion.isError || false,
        };
      },

      // Edit Message Actions
      enableMessageEdit: (messageId) =>
        set((state) => {
          // Only allow editing if not currently typing and it's the last user message
          if (state.isTyping) {
            console.warn("Cannot edit while AI is responding");
            return state;
          }

          // Find the message
          const messageIndex = state.messages.findIndex(
            (msg) => msg.id === messageId
          );
          if (messageIndex === -1) {
            console.warn("Message not found:", messageId);
            return state;
          }

          const message = state.messages[messageIndex];

          // Only allow editing user messages
          if (message.type !== "user") {
            console.warn("Can only edit user messages");
            return state;
          }

          // Check if this is the last user message
          let isLastUserMessage = true;
          for (let i = messageIndex + 1; i < state.messages.length; i++) {
            if (state.messages[i].type === "user") {
              isLastUserMessage = false;
              break;
            }
          }

          if (!isLastUserMessage) {
            console.warn("Can only edit the last user message");
            return state;
          }

          // Enable edit mode
          return {
            messages: state.messages.map((msg) =>
              msg.id === messageId ? { ...msg, isEditing: true } : msg
            ),
          };
        }),

      updateMessage: (messageId, newContent) =>
        set((state) => {
          const messageIndex = state.messages.findIndex(
            (msg) => msg.id === messageId
          );
          if (messageIndex === -1) return state;

          const message = state.messages[messageIndex];
          const trimmedContent = newContent.trim();

          // If content hasn't changed, just exit edit mode
          if (trimmedContent === message.content.trim()) {
            return {
              messages: state.messages.map((msg) =>
                msg.id === messageId ? { ...msg, isEditing: false } : msg
              ),
            };
          }

          // Update the message with new content
          return {
            messages: state.messages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: trimmedContent,
                    isEdited: true,
                    originalContent: msg.originalContent || msg.content,
                    isEditing: false,
                  }
                : msg
            ),
          };
        }),

      editLastUserMessage: async (newContent) => {
        const {
          messages,
          isTyping,
          validateMessage,
          currentCharacter,
          apiSettings,
        } = get();

        // Validation
        if (isTyping) {
          console.warn("Cannot edit while AI is responding");
          return;
        }

        const validatedContent = validateMessage(newContent);
        if (!validatedContent) {
          console.warn("Invalid message content");
          return;
        }

        // Find last user message
        let lastUserMessageIndex = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].type === "user") {
            lastUserMessageIndex = i;
            break;
          }
        }

        if (lastUserMessageIndex === -1) {
          console.warn("No user message found to edit");
          return;
        }

        const originalMessage = messages[lastUserMessageIndex];

        // Check if content actually changed
        if (originalMessage.content.trim() === validatedContent.trim()) {
          // No changes, just exit edit mode
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === originalMessage.id ? { ...msg, isEditing: false } : msg
            ),
          }));
          return;
        }

        // Update user message
        const updatedMessage = {
          ...originalMessage,
          content: validatedContent,
          isEdited: true,
          originalContent:
            originalMessage.originalContent || originalMessage.content,
          isEditing: false,
        };

        // Remove subsequent messages (character responses)
        const updatedMessages = [
          ...messages.slice(0, lastUserMessageIndex),
          updatedMessage,
        ];

        // Update state
        set({ messages: updatedMessages });

        // Update conversations object to maintain consistency
        set((state) => ({
          conversations: {
            ...state.conversations,
            [currentCharacter.id]: updatedMessages,
          },
        }));

        // Regenerate character response
        try {
          set({ isTyping: true });

          // Check if API is configured
          const hasApiKey =
            apiSettings.provider === "gemini"
              ? apiSettings.geminiApiKey
              : apiSettings.openrouterApiKey;

          if (!hasApiKey) {
            throw new Error("No API key configured");
          }

          // Get conversation context
          const conversationContext = prepareConversationContext(
            updatedMessages,
            10
          );

          // Detect triggered lorebook entries
          const triggeredLore = detectTriggeredLorebook(
            validatedContent,
            currentCharacter
          );

          // Call AI API with retry logic
          let response;
          const maxRetries = 3;
          let lastError;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              if (apiSettings.provider === "gemini") {
                response = await callGeminiAPI(
                  validatedContent,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              } else {
                response = await callOpenRouterAPI(
                  validatedContent,
                  currentCharacter,
                  apiSettings,
                  conversationContext,
                  triggeredLore
                );
              }
              break; // Success, exit retry loop
            } catch (error) {
              lastError = error;
              if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise((resolve) => setTimeout(resolve, delay));
                console.log(
                  `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
                );
              }
            }
          }

          if (!response) {
            throw lastError || new Error("Failed after all retry attempts");
          }

          // Add AI response
          const responseMessage = {
            id: `msg_${Date.now()}`,
            type: "character",
            content: response,
            sender: currentCharacter.name,
          };

          set((state) => {
            const newMessages = [...state.messages, responseMessage];
            return {
              messages: newMessages,
              conversations: {
                ...state.conversations,
                [currentCharacter.id]: newMessages,
              },
            };
          });
        } catch (error) {
          console.error("Error regenerating response:", error);

          // Categorize errors for better user feedback
          let errorMessage =
            "Sorry, I encountered an error while regenerating the response.";
          let errorType = "generic";

          if (error.message.includes("API key")) {
            errorMessage = "Please configure your API key in settings.";
            errorType = "api_key";
          } else if (
            error.message.includes("rate limit") ||
            error.message.includes("429")
          ) {
            errorMessage =
              "Rate limit exceeded. Please wait a moment before trying again.";
            errorType = "rate_limit";
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your connection and try again.";
            errorType = "network";
          } else if (
            error.message.includes("quota") ||
            error.message.includes("billing")
          ) {
            errorMessage =
              "API quota exceeded. Please check your billing settings.";
            errorType = "quota";
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again.";
            errorType = "timeout";
          }

          // Add error message with error type for UI handling
          const errorResponseMessage = {
            id: `msg_${Date.now()}`,
            type: "character",
            content: errorMessage,
            sender: currentCharacter.name,
            isError: true,
            errorType: errorType,
          };

          set((state) => {
            const newMessages = [...state.messages, errorResponseMessage];
            return {
              messages: newMessages,
              conversations: {
                ...state.conversations,
                [currentCharacter.id]: newMessages,
              },
            };
          });
        } finally {
          set({ isTyping: false });
        }
      },

      cancelMessageEdit: (messageId) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, isEditing: false } : msg
          ),
        })),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        conversations: state.conversations,
        currentCharacter: state.currentCharacter,
        currentUser: state.currentUser,
        apiSettings: state.apiSettings,
        expandChats: state.expandChats,
        characters: state.characters,
        globalLorebook: state.globalLorebook,
        userName: state.userName,
        customSystemPrompt: state.customSystemPrompt,
        displaySettings: state.displaySettings,
      }),
    }
  )
);

// Helper function to detect triggered lorebook entries
function detectTriggeredLorebook(userMessage, character) {
  if (!character.lorebook || !Array.isArray(character.lorebook)) return [];

  return character.lorebook.filter((entry) => {
    if (!entry.isActive) return false;
    if (!entry.triggers || !Array.isArray(entry.triggers)) return false;

    return entry.triggers.some((trigger) =>
      userMessage.toLowerCase().includes(trigger.toLowerCase())
    );
  });
}

// Helper function to format triggered lore entries for {{lore}} placeholder
function formatTriggeredLore(triggeredLore, character, currentUser) {
  if (!triggeredLore || triggeredLore.length === 0) {
    return "";
  }

  const processedEntries = triggeredLore.map((entry) => {
    let description = entry.description || "";

    // Replace placeholders in each lore entry
    description = description.replace(
      /\{\{char\}\}/g,
      character.name || "Character"
    );
    description = description.replace(
      /\{\{char_description\}\}/g,
      character.description || "Character description"
    );
    description = description.replace(
      /\{\{user\}\}/g,
      currentUser.name || "User"
    );
    description = description.replace(
      /\{\{user_description\}\}/g,
      currentUser.description ||
        "A curious person exploring conversations with AI characters."
    );

    return `${entry.name}: ${description}`;
  });

  return processedEntries.join("\n");
}

// Helper function to build enhanced system prompt with custom support
function buildSystemPrompt(
  character,
  triggeredLore = [],
  customSettings = null
) {
  const { currentUser } = useChatStore.getState();

  // Use custom system prompt if enabled
  if (customSettings?.enabled && customSettings?.content) {
    // Use custom prompt with placeholder replacement
    let customPrompt = customSettings.content;

    customPrompt = customPrompt.replace(/\{\{char\}\}/g, character.name);
    customPrompt = customPrompt.replace(
      /\{\{char_description\}\}/g,
      character.description
    );
    customPrompt = customPrompt.replace(
      /\{\{user\}\}/g,
      currentUser.name || "User"
    );
    customPrompt = customPrompt.replace(
      /\{\{user_description\}\}/g,
      currentUser.description ||
        "A curious person exploring conversations with AI characters."
    );

    // Process {{lore}} placeholder with formatted triggered lore
    const loreContent = formatTriggeredLore(
      triggeredLore,
      character,
      currentUser
    );
    customPrompt = customPrompt.replace(/\{\{lore\}\}/g, loreContent);

    // Process {{emotions}} placeholder with emotion instructions
    let emotionContent = "";
    if (
      character.imageGallery?.mode === "emotion" &&
      character.imageGallery?.images?.length > 0
    ) {
      // Extract emotions from image filenames directly
      const availableEmotions = character.imageGallery.images
        .map((image) => {
          if (!image.previewUrl) return null;
          const filename = image.previewUrl.split("/").pop().toLowerCase();
          const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
          if (!match) return null;
          const parts = match[1].split("-");
          return parts[parts.length - 1];
        })
        .filter(Boolean)
        .filter((emotion, index, arr) => arr.indexOf(emotion) === index);

      if (availableEmotions.length > 0) {
        emotionContent = `EMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(
          ", "
        )}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
      }
    }
    customPrompt = customPrompt.replace(/\{\{emotions\}\}/g, emotionContent);

    // Auto-add emotion instructions if not using placeholder but character has emotion mode
    if (
      !customSettings.content.includes("{{emotions}}") &&
      character.imageGallery?.mode === "emotion" &&
      character.imageGallery?.images?.length > 0
    ) {
      const availableEmotions = character.imageGallery.images
        .map((image) => {
          if (!image.previewUrl) return null;
          const filename = image.previewUrl.split("/").pop().toLowerCase();
          const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
          if (!match) return null;
          const parts = match[1].split("-");
          return parts[parts.length - 1];
        })
        .filter(Boolean)
        .filter((emotion, index, arr) => arr.indexOf(emotion) === index);

      if (availableEmotions.length > 0) {
        const emotionInstructions = `\n\nEMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(
          ", "
        )}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
        customPrompt += emotionInstructions;
      }
    }

    console.log("📋 System Prompt:", customPrompt);

    return customPrompt;
  }

  // Default character-based system prompt (simplified)
  let systemPrompt = `You are ${character.name}. ${character.description}`;

  // Add example dialogue if available
  if (character.exampleDialogue) {
    systemPrompt += `\n\nExample dialogue: ${character.exampleDialogue}`;
  }

  // Add triggered lorebook entries
  if (triggeredLore.length > 0) {
    systemPrompt += "\n\nRelevant Context:";
    triggeredLore.forEach((entry) => {
      let description = entry.description;
      // Replace placeholders
      description = description.replace(/\{\{char\}\}/g, character.name);
      description = description.replace(
        /\{\{char_description\}\}/g,
        character.description
      );
      description = description.replace(
        /\{\{user\}\}/g,
        currentUser.name || "User"
      );
      description = description.replace(
        /\{\{user_description\}\}/g,
        currentUser.description ||
          "A curious person exploring conversations with AI characters."
      );
      systemPrompt += `\n- ${entry.name}: ${description}`;
    });
  }

  // Add emotion instructions if character uses emotion mode
  if (
    character.imageGallery?.mode === "emotion" &&
    character.imageGallery?.images?.length > 0
  ) {
    // Extract emotions from image filenames directly (avoid import issues)
    const availableEmotions = character.imageGallery.images
      .map((image) => {
        if (!image.previewUrl) return null;
        const filename = image.previewUrl.split("/").pop().toLowerCase();
        const match = filename.match(/([a-zA-Z0-9]+)(?=\.[a-z]+$)/);
        if (!match) return null;
        const parts = match[1].split("-");
        return parts[parts.length - 1];
      })
      .filter(Boolean)
      .filter((emotion, index, arr) => arr.indexOf(emotion) === index);

    if (availableEmotions.length > 0) {
      const emotionInstructions = `\n\nEMOTION INSTRUCTIONS: You must always indicate your current emotion at the end of each message using the format <Emotion="emotion_name">. Choose from these available emotions: ${availableEmotions.join(
        ", "
      )}. If none of these emotions match your current feeling, use <Emotion="neutral">. The emotion tag will be used to update your visual appearance and should not be displayed to the user.`;
      systemPrompt += emotionInstructions;
    }
  }

  return systemPrompt;
}

// Helper function to prepare conversation context
function prepareConversationContext(messages, maxMessages = 10) {
  // Get recent messages for context, excluding error messages
  const validMessages = messages
    .filter((msg) => !msg.isError)
    .slice(-maxMessages);

  const processedMessages = validMessages.map((msg) => {
    let role;
    if (msg.type === "user") {
      role = "user";
    } else if (msg.type === "character") {
      role = "model"; // Use 'model' for character messages as per memory
    } else {
      role = msg.type; // Keep original role if already properly set
    }

    return {
      role: role,
      content: msg.content,
    };
  });

  // Deduplicate consecutive messages with the same role
  const deduplicatedMessages = [];

  for (let i = 0; i < processedMessages.length; i++) {
    const currentMsg = processedMessages[i];
    const lastMsg = deduplicatedMessages[deduplicatedMessages.length - 1];

    if (lastMsg && lastMsg.role === currentMsg.role) {
      // Merge consecutive messages with the same role
      lastMsg.content += "\n\n" + currentMsg.content;
    } else {
      // Add new message
      deduplicatedMessages.push({ ...currentMsg });
    }
  }

  return deduplicatedMessages;
}

// Helper function for Gemini API with enhanced context
async function callGeminiAPI(
  userMessage,
  character,
  apiSettings,
  conversationContext = [],
  triggeredLore = []
) {
  const { customSystemPrompt } = useChatStore.getState();
  const systemPrompt = buildSystemPrompt(
    character,
    triggeredLore,
    customSystemPrompt
  );

  console.log("💬 User Input:", userMessage);
  console.log("📄 Chat History:", conversationContext);

  try {
    // Follow the official documentation structure
    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI(apiSettings.geminiApiKey);

    // Prepare conversation history for Gemini chat format
    const history = conversationContext.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Get the model with system instruction
    const model = ai.getGenerativeModel({
      model: apiSettings.selectedModel,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Start chat with history
    const chat = model.startChat({
      history: history,
    });

    // Send the current message
    const response = await chat.sendMessage(userMessage);

    return response.response.text();
  } catch (error) {
    console.log("SDK failed, using REST API fallback:", error.message);

    // For REST API, we need to build the contents array with proper roles
    const contents = conversationContext.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Add current user message only if it's not already the last message
    const lastMessage = contents[contents.length - 1];
    if (
      !lastMessage ||
      lastMessage.role !== "user" ||
      !lastMessage.parts[0].text.includes(userMessage)
    ) {
      contents.push({
        role: "user",
        parts: [{ text: userMessage }],
      });
    }

    const requestBody = {
      contents: contents,
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${apiSettings.selectedModel}:generateContent?key=${apiSettings.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText} - ${
          errorData.error?.message || ""
        }`
      );
    }

    const data = await response.json();

    // Enhanced error handling for Gemini API responses
    if (!data.candidates || data.candidates.length === 0) {
      // Check for safety/blocking reasons
      if (data.promptFeedback) {
        throw new Error(
          `Gemini API blocked the response: ${JSON.stringify(
            data.promptFeedback
          )}`
        );
      }

      // Check for error details
      if (data.error) {
        throw new Error(
          `Gemini API error: ${
            data.error.message || JSON.stringify(data.error)
          }`
        );
      }

      // Generic error for unexpected response structure
      throw new Error(
        `Gemini API returned unexpected response structure: ${JSON.stringify(
          data
        )}`
      );
    }

    // Validate candidate structure before accessing
    const candidate = data.candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error(
        `Gemini API returned empty content: ${JSON.stringify(candidate)}`
      );
    }

    return candidate.content.parts[0].text;
  }
}

// Helper function for OpenRouter API with enhanced context
async function callOpenRouterAPI(
  userMessage,
  character,
  apiSettings,
  conversationContext = [],
  triggeredLore = []
) {
  const { customSystemPrompt } = useChatStore.getState();
  const systemPrompt = buildSystemPrompt(
    character,
    triggeredLore,
    customSystemPrompt
  );

  // Prepare messages array with proper role assignments
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Add conversation context with proper role mapping
  conversationContext.forEach((msg) => {
    let role;
    if (msg.role === "model") {
      role = "assistant"; // OpenRouter uses 'assistant' for character responses
    } else if (msg.role === "assistant") {
      role = "assistant"; // Already correct
    } else {
      role = "user";
    }

    messages.push({
      role: role,
      content: msg.content,
    });
  });

  // Add current message
  messages.push({
    role: "user",
    content: userMessage,
  });

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiSettings.openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Custom Chats",
      },
      body: JSON.stringify({
        model: apiSettings.selectedModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter API error: ${response.status} - ${
        errorData.error?.message || response.statusText
      }`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default useChatStore;
