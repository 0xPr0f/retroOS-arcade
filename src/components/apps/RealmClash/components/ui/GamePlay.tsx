import { StatCard } from './ui_components'

const GamePlayUI: React.FC<{ gameId: string }> = ({ gameId }) => {
  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center">
          <span className="text-blue-400 mr-2">⚔️</span>
          Welcome, Warrior! {gameId}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <StatCard title="Player Level" value="42" />
          <StatCard title="Gold" value="1,337" />
          <StatCard title="Victories" value="128" />
          <StatCard title="Guild Rank" value="Elite" />
        </div>
      </div>
    </div>
  )
}
export default GamePlayUI
