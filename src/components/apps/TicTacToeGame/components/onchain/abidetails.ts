export const CONTRACT_ADDRESS = '0x307dceC841c00733810cC159A399c5c0C0C3E1f6'
export const CONTRACT_ABI: any[] = [
  {
    type: 'function',
    name: 'TIMEOUT_DURATION',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'games',
    inputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      { name: 'playerX', type: 'address', internalType: 'address' },
      { name: 'playerO', type: 'address', internalType: 'address' },
      { name: 'winner', type: 'address', internalType: 'address' },
      { name: 'isActive', type: 'bool', internalType: 'bool' },
      { name: 'isXNext', type: 'bool', internalType: 'bool' },
      { name: 'lastMoveTime', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCurrentGame',
    inputs: [{ name: 'player', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getGameState',
    inputs: [{ name: 'gameId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      { name: 'playerX', type: 'address', internalType: 'address' },
      { name: 'playerO', type: 'address', internalType: 'address' },
      { name: 'winner', type: 'address', internalType: 'address' },
      { name: 'isActive', type: 'bool', internalType: 'bool' },
      { name: 'board', type: 'uint8[9]', internalType: 'uint8[9]' },
      { name: 'isXNext', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPlayerQueuePosition',
    inputs: [{ name: 'player', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getQueueLength',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isInQueue',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'joinQueue',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'leaveGame',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'leaveQueue',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'makeMove',
    inputs: [
      { name: 'gameId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'position', type: 'uint8', internalType: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'playerQueue',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: 'playerAddress',
        type: 'address',
        internalType: 'address',
      },
      { name: 'joinedAt', type: 'uint256', internalType: 'uint256' },
      { name: 'isMatched', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'playerToGame',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'GameCreated',
    inputs: [
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'playerX',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'GameDrawn',
    inputs: [
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'GameReset',
    inputs: [
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'GameWon',
    inputs: [
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'winner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MoveMade',
    inputs: [
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'position',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'player',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PlayerJoined',
    inputs: [
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'playerO',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PlayerJoinedQueue',
    inputs: [
      {
        name: 'player',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'position',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PlayerLeftGame',
    inputs: [
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'player',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'winner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PlayerLeftQueue',
    inputs: [
      {
        name: 'player',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PlayersMatched',
    inputs: [
      {
        name: 'player1',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'player2',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'gameId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
]
