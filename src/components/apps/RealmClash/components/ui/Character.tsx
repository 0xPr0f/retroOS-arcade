
const CharacterUI: React.FC = () => {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
          <h1 className="text-2xl font-bold text-white mb-6">Game Settings</h1>
          <div className="space-y-6">
            <div className="mt-6">
              <label className="block text-white mb-2">Graphics Quality</label>
              <div className="w-full h-2 bg-gray-700 rounded-full">
                <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default CharacterUI 