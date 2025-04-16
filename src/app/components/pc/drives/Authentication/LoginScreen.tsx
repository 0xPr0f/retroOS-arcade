'use client'
import React, { useState, useEffect } from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from '../UI/UI_Components.v1'
import { User, Users } from 'lucide-react'
import { useLocalStorage } from 'react-use'
import { UserSettings } from '@/app/components/apps/ControlPanel/components/Setting&Metrics'
import { lightRed, lightBlue } from '../Extensions/colors'

import Authentication from '.'
import { useAccount } from 'wagmi'

const LoginScreen: React.FC = () => {
  const [isParaModalOpen, setIsParaModalOpen] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsParaModalOpen(true)
  }

  interface GuestLoginEvent extends React.MouseEvent<HTMLButtonElement> {}

  const handleGuestLogin = (e: GuestLoginEvent) => {
    // Handle guest login logic here

    setGuestLogin(true)
    setIsParaModalOpen(true)
    //login()
  }
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userControlSettings'
  )
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  )
  const [imageBackground, setImageBackground] = useState<string | undefined>(
    undefined
  )
  const [userName, setUserName] = useState<string | undefined>(undefined)

  const [guestLogin, setGuestLogin] = useState<boolean>(false)

  const { address, isConnected } = useAccount()
  useEffect(() => {
    setImagePreview(settings?.profileImage)
    setImageBackground(settings?.theme.backgroundUrl)
    setUserName(settings?.name)
  }, [settings])

  const closeGuestLogin = () => {
    setGuestLogin(false)
  }
  return (
    <div
      style={{
        backgroundImage:
          imageBackground && imageBackground.length > 20
            ? `url(${imageBackground})`
            : `linear-gradient(to left,${lightRed},${lightBlue} )`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-900 to-blue-600 p-4"
    >
      {imageBackground && imageBackground.length > 20 && (
        <video
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={imageBackground} type="video/mp4" />
          <source src={imageBackground} type="video/webm" />
          <source src={imageBackground} type="video/ogg" />
          <source src={imageBackground} type="video/mov" />
        </video>
      )}
      <div
        className={`w-full h-full max-w-md rounded-lg shadow-xl p-8 space-y-8 ${
          isParaModalOpen ? '' : 'bg-white/10 backdrop-blur-md'
        }`}
      >
        <>
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="w-36 h-36">
              <AvatarImage src={imagePreview} alt="User" />
              <AvatarFallback>
                <User className="w-24 h-24" />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome {userName}
            </h1>
          </div>

          <Button
            type="submit"
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
          >
            Sign in
          </Button>
        </>

        <Authentication
          setGuestLogin={setGuestLogin}
          setParaModalOpen={setIsParaModalOpen}
          ParaModalOpen={isParaModalOpen}
          pregenModal={guestLogin}
          closeGuestLogin={closeGuestLogin}
        />

        <>
          <div className="flex flex-col items-center  space-y-4">
            <div className="w-full border-t border-gray-300"></div>
            <Button
              onClick={handleGuestLogin}
              variant="outline"
              className="w-full  flex items-center justify-center space-x-2 py-2 rounded-md transition duration-200"
            >
              <Users className="w-5 h-5" />
              <span>Enter as guest</span>
            </Button>
          </div>
        </>
      </div>
    </div>
  )
}

export default LoginScreen
