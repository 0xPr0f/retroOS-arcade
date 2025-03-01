import { StartIcon } from '../pc/drives/Icon'
import {
  MyComputer,
  Document,
  Pictures,
  Wallet,
  ControlPanel,
  SnakeGame,
  TicTacToeGame,
  TetrisGame,
  Browser,
  MineSweeperGame,
  Music,
  Piano,
  Feedback,
  ChainReaction,
  RealmClash,
  Leaderboard,

  /////////////////////
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
} from './appExports'

const appMap: {
  [key: string]: React.FC<{
    onBlur?: (id: number) => void
    onFocus?: (id: number) => void
  }>
} = {
  computer: MyComputer,
  documents: Document,
  pictures: Pictures,
  wallet: Wallet,
  control: ControlPanel,
  music: Music,
  piano: Piano,
  feedback: Feedback,
  browser: Browser,
  snake: SnakeGame,
  tictactoe: TicTacToeGame,
  tetris: TetrisGame,
  minesweeper: MineSweeperGame,
  realmclash: RealmClash,
  chainreaction: ChainReaction,
  leaderboard: Leaderboard,
  // Add new components here by adding new key-value pairs, the key has to match id in app drawer
}
export const iconMap: { [key: string]: Object } = {
  computer: DesktopIcon,
  documents: DocumentIcon,
  music: MusicIcon,
  wallet: WalletIcon,
  control: ControlPanelIcon,
  snake: SnakeGameIcon,
  tictactoe: TicTacToeGameIcon,
  tetris: TetrisGameIcon,
  browser: BrowserIcon,
  minesweeper: MineSweeperGameIcon,
  piano: PianoIcon,
  feedback: FeedbackIcon,
  start: StartIcon,
  chainreaction: ChainReactionIcon,
  realmclash: RealmClashIcon,
  leaderboard: LeaderboardIcon,

  // Add new icons here by adding new key-value pairs, the key has to match id in app drawer
}
export interface IconType {
  src: string
}
export const displayApp = (
  key: string,
  onBlur?: (id: number) => void,
  onFocus?: (id: number) => void
) => {
  const ContentComponent = appMap[key]
  return ContentComponent ? (
    <ContentComponent onBlur={onBlur} onFocus={onFocus} />
  ) : (
    <p>No content available for ID: {key}</p>
  )
}
