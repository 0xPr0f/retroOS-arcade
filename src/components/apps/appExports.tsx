import { lazy } from 'react'

// Lazy load components
const Document = lazy(() => import('./Documents'))
const Music = lazy(() => import('./Music'))
const MyComputer = lazy(() => import('./MyComputer'))
const Pictures = lazy(() => import('./Pictures'))
const Wallet = lazy(() => import('./Wallet'))
const ControlPanel = lazy(() => import('./ControlPanel'))
const SnakeGame = lazy(() => import('./SnakeGame'))
const TicTacToeGame = lazy(() => import('./TicTacToeGame'))
const TetrisGame = lazy(() => import('./TetrisGame'))
const Browser = lazy(() => import('./Browser'))
const MineSweeperGame = lazy(() => import('./Minesweeper'))
const Piano = lazy(() => import('./Piano'))
const Feedback = lazy(() => import('./Feedback'))
const ChainReaction = lazy(() => import('./ChainReaction'))
const RealmClash = lazy(() => import('./RealmClash'))
const Leaderboard = lazy(() => import('./GameLeaderboard'))

// Icons Export
import DesktopIcon from './MyComputer/icons/desktop.svg'
import MusicIcon from './Music/icons/music.svg'
import DocumentIcon from './Documents/icons/document.svg'
import WalletIcon from './Wallet/icons/wallet.svg'
import ControlPanelIcon from './ControlPanel/icons/settings.svg'
import SnakeGameIcon from './SnakeGame/icons/snake.svg'
import TicTacToeGameIcon from './TicTacToeGame/icons/tictactoe.svg'
import TetrisGameIcon from './TetrisGame/icons/tetris.svg'
import BrowserIcon from './Browser/icons/browser.svg'
import MineSweeperGameIcon from './Minesweeper/icons/minesweeper.svg'
import PianoIcon from './Piano/icons/piano.svg'
import FeedbackIcon from './Feedback/icons/feedback.svg'
import ChainReactionIcon from './ChainReaction/icons/reaction.svg'
import RealmClashIcon from './RealmClash/icons/realmclash.svg'
import LeaderboardIcon from './GameLeaderboard/icons/leaderboard.svg'

//export the apps and others from here to keep track of exported apps
export {
  Document,
  MyComputer,
  Pictures,
  Wallet,
  ControlPanel,
  SnakeGame,
  Music,
  TicTacToeGame,
  TetrisGame,
  Browser,
  MineSweeperGame,
  Piano,
  Feedback,
  ChainReaction,
  RealmClash,
  Leaderboard,
  //////////////////////
  DesktopIcon,
  DocumentIcon,
  MusicIcon,
  WalletIcon,
  ControlPanelIcon,
  SnakeGameIcon,
  TicTacToeGameIcon,
  TetrisGameIcon,
  BrowserIcon,
  MineSweeperGameIcon,
  PianoIcon,
  FeedbackIcon,
  ChainReactionIcon,
  RealmClashIcon,
  LeaderboardIcon,
}
