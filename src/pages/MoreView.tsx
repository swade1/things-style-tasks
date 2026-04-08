import { NavigationBar } from '@/components'
import { Settings, Info } from 'lucide-react'

export function MoreView() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navigation */}
      <NavigationBar title="More" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden shadow-sm divide-y divide-gray-100">
          {/* Settings */}
          <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <Settings size={22} className="text-gray-600" />
            <span className="text-[15px] text-gray-900">Settings</span>
          </button>

          {/* About */}
          <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <Info size={22} className="text-gray-600" />
            <span className="text-[15px] text-gray-900">About</span>
          </button>
        </div>

        {/* Info section */}
        <div className="px-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Day 2 Complete! 🎉</strong>
            </p>
            <p className="text-xs text-gray-600">
              Database schema created, UI components built, and basic task CRUD operations implemented.
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Educational clone inspired by{' '}
            <a
              href="https://culturedcode.com/things/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Things 3
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
