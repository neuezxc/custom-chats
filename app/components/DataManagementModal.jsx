import { useState } from 'react'
import { FiX, FiDownload, FiUpload, FiTrash2, FiInfo } from 'react-icons/fi'
import useChatStore from '../../stores/useChatStore'

function DataManagementModal() {
  const { 
    showDataManagementModal, 
    setShowDataManagementModal,
    exportAllData,
    importAllData,
    clearAllData,
    clearConversations,
    clearCharacters
  } = useChatStore()
  
  const [importFile, setImportFile] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [activeTab, setActiveTab] = useState('export')
  
  if (!showDataManagementModal) return null

  // Export all data
  const handleExport = () => {
    try {
      const data = exportAllData()
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `custom-chats-backup-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      
      // Clean up
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed: ' + error.message)
    }
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/json') {
      setImportFile(file)
      setImportResult(null)
    } else {
      alert('Please select a valid JSON file')
      event.target.value = ''
    }
  }

  // Import data from file
  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import')
      return
    }

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      
      const result = importAllData(data)
      setImportResult(result)
      
      if (result.success) {
        alert('Data imported successfully!')
        setShowDataManagementModal(false)
      } else {
        alert('Import failed: ' + result.error)
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed: ' + error.message)
    }
  }

  // Clear all data
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      clearAllData()
      alert('All data has been cleared')
      setShowDataManagementModal(false)
    }
  }

  // Clear conversations only
  const handleClearConversations = () => {
    if (confirm('Are you sure you want to clear all conversations? This cannot be undone.')) {
      clearConversations()
      alert('All conversations have been cleared')
    }
  }

  // Clear characters only
  const handleClearCharacters = () => {
    if (confirm('Are you sure you want to clear all characters? This cannot be undone.')) {
      clearCharacters()
      alert('All characters have been cleared')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Data Management</h2>
              <p className="text-sm text-[var(--grey-1)]">Backup, restore, or clear your data</p>
            </div>
            <button
              onClick={() => setShowDataManagementModal(false)}
              className="text-[var(--grey-1)] hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-[var(--grey-0)] mb-6">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--grey-1)] hover:text-white'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--grey-1)] hover:text-white'
              }`}
            >
              Import
            </button>
            <button
              onClick={() => setActiveTab('clear')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'clear'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--grey-1)] hover:text-white'
              }`}
            >
              Clear Data
            </button>
          </div>
          
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                <h3 className="font-medium text-white mb-2">Export All Data</h3>
                <p className="text-sm text-[var(--grey-1)] mb-4">
                  Create a backup of all your characters, conversations, and settings.
                </p>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded transition-colors"
                >
                  <FiDownload size={16} />
                  Export Backup
                </button>
              </div>
              
              <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                <div className="flex items-start gap-3">
                  <FiInfo className="text-[var(--primary)] mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h3 className="font-medium text-white mb-1">What's included in the backup?</h3>
                    <ul className="text-sm text-[var(--grey-1)] list-disc list-inside space-y-1">
                      <li>All characters and their settings</li>
                      <li>All conversation histories</li>
                      <li>User profile information</li>
                      <li>API settings and preferences</li>
                      <li>Display settings and custom prompts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                <h3 className="font-medium text-white mb-2">Import Backup</h3>
                <p className="text-sm text-[var(--grey-1)] mb-4">
                  Restore your data from a previously exported backup file.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm text-[var(--grey-1)] mb-2">
                    Select backup file
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="w-full p-2 bg-[var(--dark-1)] border border-[var(--grey-0)] rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[var(--grey-0)] file:text-white hover:file:bg-[var(--grey-1)]"
                  />
                </div>
                
                {importResult && !importResult.success && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-sm text-red-300">
                    Import failed: {importResult.error}
                  </div>
                )}
                
                <button
                  onClick={handleImport}
                  disabled={!importFile}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    importFile
                      ? 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white'
                      : 'bg-[var(--dark-1)] text-[var(--grey-2)] cursor-not-allowed'
                  }`}
                >
                  <FiUpload size={16} />
                  Import Backup
                </button>
              </div>
              
              <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                <div className="flex items-start gap-3">
                  <FiInfo className="text-[var(--primary)] mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h3 className="font-medium text-white mb-1">Important Notes</h3>
                    <ul className="text-sm text-[var(--grey-1)] list-disc list-inside space-y-1">
                      <li>Importing will replace all current data</li>
                      <li>Make sure to export your current data first if you want to keep it</li>
                      <li>Only import files that were created by this application</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Clear Data Tab */}
          {activeTab === 'clear' && (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                <h3 className="font-medium text-white mb-2">Clear All Data</h3>
                <p className="text-sm text-[var(--grey-1)] mb-4">
                  Permanently delete all characters, conversations, and settings.
                </p>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  <FiTrash2 size={16} />
                  Clear Everything
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                  <h3 className="font-medium text-white mb-2">Clear Conversations</h3>
                  <p className="text-sm text-[var(--grey-1)] mb-3">
                    Delete all conversation histories while keeping characters.
                  </p>
                  <button
                    onClick={handleClearConversations}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    <FiTrash2 size={14} />
                    Clear Conversations
                  </button>
                </div>
                
                <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                  <h3 className="font-medium text-white mb-2">Clear Characters</h3>
                  <p className="text-sm text-[var(--grey-1)] mb-3">
                    Delete all characters while keeping conversations.
                  </p>
                  <button
                    onClick={handleClearCharacters}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    <FiTrash2 size={14} />
                    Clear Characters
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-[var(--dark-2)] rounded border border-[var(--grey-0)]">
                <div className="flex items-start gap-3">
                  <FiInfo className="text-[var(--primary)] mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h3 className="font-medium text-white mb-1">Warning</h3>
                    <p className="text-sm text-[var(--grey-1)]">
                      These actions cannot be undone. Please make sure to export your data first if you want to keep it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowDataManagementModal(false)}
              className="px-4 py-2 bg-[var(--dark-2)] text-[var(--grey-1)] rounded hover:bg-[var(--dark-3)] hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataManagementModal