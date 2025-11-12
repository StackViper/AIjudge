export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-indigo-600">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            🎨 Tailwind CSS Test Page
          </h1>
          <p className="text-gray-600 text-lg">
            If you see colorful, styled elements below, Tailwind is working! ✅
          </p>
        </div>

        {/* Color Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Color Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-600 text-white p-4 rounded-lg text-center">
              Indigo 600
            </div>
            <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
              Purple 500
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">
              Green 500
            </div>
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              Red 500
            </div>
          </div>
        </div>

        {/* Button Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Button Styles</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Primary Button
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors">
              Secondary Button
            </button>
            <button className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-medium transition-colors">
              Outline Button
            </button>
          </div>
        </div>

        {/* Spacing & Typography Test */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Typography & Spacing</h2>
          <p className="text-lg text-gray-700">Large text with proper spacing</p>
          <p className="text-base text-gray-600">Base text size</p>
          <p className="text-sm text-gray-500">Small text size</p>
          <p className="text-xs text-gray-400">Extra small text</p>
        </div>

        {/* Flex & Grid Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Layout: Flex & Grid</h2>
          <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg mb-4">
            <span className="text-indigo-900 font-medium">Flex Layout</span>
            <span className="bg-indigo-600 text-white px-3 py-1 rounded">Badge</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-100 p-4 rounded text-center text-purple-900">Grid 1</div>
            <div className="bg-purple-100 p-4 rounded text-center text-purple-900">Grid 2</div>
            <div className="bg-purple-100 p-4 rounded text-center text-purple-900">Grid 3</div>
          </div>
        </div>

        {/* Border & Shadow Test */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border-4 border-indigo-300">
            <h3 className="font-bold text-gray-800 mb-2">Border Test</h3>
            <p className="text-gray-600">4px indigo border</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-2">Shadow Test</h3>
            <p className="text-gray-600">2xl shadow</p>
          </div>
        </div>

        {/* Hover & Transition Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Hover Effects</h2>
          <div className="space-y-3">
            <div className="bg-indigo-100 hover:bg-indigo-200 p-4 rounded-lg transition-colors cursor-pointer">
              Hover me! (Color change)
            </div>
            <div className="bg-purple-100 hover:scale-105 p-4 rounded-lg transition-transform cursor-pointer">
              Hover me! (Scale up)
            </div>
            <div className="bg-green-100 hover:shadow-xl p-4 rounded-lg transition-shadow cursor-pointer">
              Hover me! (Shadow increase)
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="text-green-500 text-3xl mr-4">✅</div>
            <div>
              <h3 className="text-green-800 font-bold text-xl">Tailwind is Working!</h3>
              <p className="text-green-700 mt-1">
                All styles are being applied correctly. You can now use Tailwind throughout your app.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
