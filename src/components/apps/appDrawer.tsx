import { App } from '../pc/types'
import {
  BrowserIcon,
  ChainReactionIcon,
  ControlPanelIcon,
  DesktopIcon,
  DocumentIcon,
  FeedbackIcon,
  MineSweeperGameIcon,
  MusicIcon,
  PianoIcon,
  RealmClashIcon,
  SnakeGameIcon,
  TetrisGameIcon,
  TicTacToeGameIcon,
  WalletIcon,
} from './appExports'

// app configurations
const apps: App[] = [
  {
    id: 'computer',
    title: 'Computer',
    icon: DesktopIcon.src,
    startMenu: true,
    greater: false,
    openingPosition: {
      x: 150,
      y: 150,
    },
    onDesktop: true,
  },
  {
    id: 'documents',
    title: 'Library',
    icon: DocumentIcon.src,
    startMenu: true,
    greater: true,
    openingPosition: {
      x: 150,
      y: 150,
    },
    openingDimensions: {
      width: 550,
      height: 470,
    },
  },
  {
    id: 'control',
    title: 'Control Panel',
    icon: ControlPanelIcon.src,
    startMenu: true,
    openingPosition: {
      x: 425,
      y: 140,
    },
    fixed: true,
    greater: true,
    openingDimensions: {
      height: 500,
      width: 550,
    },
  },
  {
    id: 'feedback',
    title: 'Feedback',
    icon: FeedbackIcon.src,
    startMenu: true,
    openingPosition: {
      x: 150,
      y: 150,
    },
    greater: true,
    fixed: true,
    openingDimensions: {
      width: 270,
      height: 370,
    },
  },
  {
    id: 'music',
    title: 'Music',
    icon: MusicIcon.src,
    startMenu: true,
    // greater: true,
    fixed: true,
    openingPosition: {
      x: 150,
      y: 150,
    },
    openingDimensions: {
      width: 300,
      height: 458,
    },
  },
  {
    id: 'browser',
    title: 'Browser',
    icon: BrowserIcon.src,
    startMenu: false,
    greater: true,
    openingPosition: {
      x: 315,
      y: 40,
    },
    openingDimensions: {
      height: 650,
      width: 500,
    },
  },

  {
    id: 'wallet',
    title: 'Wallet',
    icon: WalletIcon.src,
    startMenu: true,
    openingPosition: {
      x: 350,
      y: 70,
    },
    greater: true,
    openingDimensions: {
      width: 670,
      height: 550,
    },
  },
  {
    id: 'piano',
    title: 'Piano',
    icon: PianoIcon.src,
    openingPosition: {
      x: 120,
      y: 170,
    },
    greater: true,
    openingDimensions: {
      width: 1000,
      height: 300,
    },
  },
  //Games
  {
    id: 'snake',
    title: 'Snake Game',
    icon: SnakeGameIcon.src,
    openingPosition: {
      x: 300,
      y: 80,
    },
    openingDimensions: {
      height: 560,
      width: 500,
    },
    greater: true,
    game: true,
  },
  {
    id: 'minesweeper',
    title: 'MineSweeper',
    icon: MineSweeperGameIcon.src,
    openingPosition: {
      x: 400,
      y: 80,
    },
    openingDimensions: {
      height: 430,
      width: 350,
    },
    greater: true,
    fixed: true,
    game: true,
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    icon: TicTacToeGameIcon.src,
    openingPosition: {
      x: 450,
      y: 120,
    },
    openingDimensions: {
      height: 550,
      width: 420,
    },
    greater: true,
    game: true,
  },
  {
    id: 'tetris',
    title: 'Tetris',
    icon: TetrisGameIcon.src,
    openingPosition: {
      x: 500,
      y: 100,
    },
    greater: true,
    openingDimensions: {
      height: 650,
      width: 450,
    },
    game: true,
  },
  {
    id: 'chainreaction',
    title: 'Chain Reaction',
    icon: ChainReactionIcon.src,
    openingPosition: {
      x: 450,
      y: 150,
    },
    openingDimensions: {
      height: 550,
      width: 450,
    },
    greater: true,
    game: true,
  },
  {
    id: 'realmclash',
    title: 'Realm Clash',
    icon: RealmClashIcon.src,
    openingPosition: {
      x: 320,
      y: 150,
    },
    openingDimensions: {
      height: 500,
      width: 750,
    },
    greater: true,
    game: true,
  },
]

export default apps
