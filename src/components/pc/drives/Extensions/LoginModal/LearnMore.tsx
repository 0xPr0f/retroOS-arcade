'use client'
import type React from 'react'

interface LearnMoreViewProps {
  theme: any
}

export const LearnMoreView: React.FC<LearnMoreViewProps> = ({ theme }) => {
  return (
    <div className="flex-1 overflow-auto custom-scrollbar pr-2 space-y-4">
      <p style={{ color: theme.textColor }}>
        A cryptocurrency wallet is a digital tool that allows you to store,
        send, and receive digital currencies like Ethereum. Here are some key
        points about wallets:
      </p>
      <ul
        className="list-disc pl-5 space-y-2"
        style={{ color: theme.textColor }}
      >
        <li>
          Wallets don't actually store your crypto — they store private keys
          that give you access to your crypto on the blockchain.
        </li>
        <li>
          There are different types of wallets: software wallets (like browser
          extensions or mobile apps) and hardware wallets (physical devices for
          extra security).
        </li>
        <li>
          Popular Ethereum wallets include MetaMask, Trust Wallet, and Ledger.
        </li>
        <li>
          When setting up a wallet, you'll receive a seed phrase. This is
          crucial for recovering your wallet if you lose access, so keep it safe
          and private!
        </li>
        <li>
          Always research and choose a reputable wallet provider to ensure the
          security of your assets.
        </li>
      </ul>
      <p style={{ color: theme.textColor }}>
        Remember, with great power comes great responsibility. When you use a
        wallet, you're in control of your own funds, so always be cautious and
        keep your information secure.
      </p>
    </div>
  )
}

export const LearnMoreViewPregen: React.FC<LearnMoreViewProps> = ({
  theme,
}) => {
  return (
    <div className="flex-1 overflow-auto custom-scrollbar pr-2 space-y-4">
      <p style={{ color: theme.textColor }}>
        Para Pregenerated Wallets allow developers to create wallets for users
        before they set up a wallet with Para. This feature provides control
        over when users can claim and take ownership of their wallets. Here's
        what you need to know about pregenerated wallets:
      </p>
      <ul
        className="list-disc pl-5 space-y-2"
        style={{ color: theme.textColor }}
      >
        <li>
          You can associate pregenerated wallets with various identifiers:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Email address</li>
            <li>Phone number</li>
            <li>Social media accounts (Twitter/Discord)</li>
            <li>Custom IDs (like external database IDs)</li>
          </ul>
        </li>
        <li>
          Users can claim any pregenerated wallets stored in their app storage,
          but specific requirements must be met:
        </li>
        <li>
          For email and phone verification, users must have matching contact
          information linked to their Para account
        </li>
        <li>
          For social media claims, users need to authenticate through your
          application using the same Twitter or Discord username
        </li>
        <li>
          For custom ID claims, the first user to claim an ID gets exclusive
          rights to claim future pregenerated wallets with that ID in your
          application
        </li>
      </ul>
      <p style={{ color: theme.textColor }}>
        This system gives you flexibility in wallet distribution while
        maintaining security through proper verification channels. Make sure to
        implement appropriate verification checks based on your chosen
        identifier type.
      </p>
    </div>
  )
}
