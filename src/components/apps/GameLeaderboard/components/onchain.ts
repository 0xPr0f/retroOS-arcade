export const X_LEADERBOARD_CONTRACT_ADDRESS: Record<string, string> = {
  '84532': '0x43f16d2be0C6DC3bf7821aa7513e35ab9466508d',
  '10143': '0xeDD500645Fe3638157C7d01A7eFC45966c4c77D1',
}

export const LEADERBOARD_CONTRACT_ABI = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_serverPublicKey',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchSubmitScores',
    inputs: [
      { name: 'player', type: 'address', internalType: 'address' },
      { name: 'scores', type: 'uint256[]', internalType: 'uint256[]' },
      {
        name: 'gameTypes',
        type: 'uint8[]',
        internalType: 'enum HighScores.GameType[]',
      },
      { name: 'signatures', type: 'bytes[]', internalType: 'bytes[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAllScores',
    inputs: [
      { name: 'player', type: 'address', internalType: 'address' },
      {
        name: 'gameType',
        type: 'uint8',
        internalType: 'enum HighScores.GameType',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct HighScores.Score[]',
        components: [
          { name: 'player', type: 'address', internalType: 'address' },
          { name: 'score', type: 'uint256', internalType: 'uint256' },
          {
            name: 'timestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getHighestScore',
    inputs: [
      { name: 'player', type: 'address', internalType: 'address' },
      {
        name: 'gameType',
        type: 'uint8',
        internalType: 'enum HighScores.GameType',
      },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLatestScores',
    inputs: [
      { name: 'player', type: 'address', internalType: 'address' },
      {
        name: 'gameType',
        type: 'uint8',
        internalType: 'enum HighScores.GameType',
      },
      { name: 'count', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct HighScores.Score[]',
        components: [
          { name: 'player', type: 'address', internalType: 'address' },
          { name: 'score', type: 'uint256', internalType: 'uint256' },
          {
            name: 'timestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'signature', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLeaderboard',
    inputs: [
      {
        name: 'gameType',
        type: 'uint8',
        internalType: 'enum HighScores.GameType',
      },
      { name: 'limit', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct HighScores.LeaderboardEntry[]',
        components: [
          { name: 'player', type: 'address', internalType: 'address' },
          {
            name: 'highScore',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'lastPlayed',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalPlayers',
    inputs: [
      {
        name: 'gameType',
        type: 'uint8',
        internalType: 'enum HighScores.GameType',
      },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'serverPublicKey',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'submitScore',
    inputs: [
      { name: 'player', type: 'address', internalType: 'address' },
      { name: 'score', type: 'uint256', internalType: 'uint256' },
      {
        name: 'gameType',
        type: 'uint8',
        internalType: 'enum HighScores.GameType',
      },
      { name: 'signature', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateServerPublicKey',
    inputs: [{ name: 'newKey', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'ScoreSubmitted',
    inputs: [
      {
        name: 'player',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'gameType',
        type: 'uint8',
        indexed: false,
        internalType: 'enum HighScores.GameType',
      },
      {
        name: 'score',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServerPublicKeyUpdated',
    inputs: [
      {
        name: 'newKey',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
]
