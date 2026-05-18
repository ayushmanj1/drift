import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SplashScreen from './screens/SplashScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'

import ProfileScreen from './screens/ProfileScreen'
import DiscoveryScreen from './screens/DiscoveryScreen'
import MyCollectionScreen from './screens/MyCollectionScreen'
import AddDiscoveryScreen from './screens/AddDiscoveryScreen'
import ExploreScreen from './screens/ExploreScreen'
import SettingsScreen from './screens/SettingsScreen'
import UserProfileScreen from './screens/UserProfileScreen'
import BottomNav from './components/BottomNav'
import { discoveries } from './data/mockData'

export default function App() {
  const [appState, setAppState] = useState('splash') // splash | onboarding | main
  const [screen, setScreen] = useState('home')
  const [prevScreen, setPrevScreen] = useState(null)

  // ─── Restore saved settings on mount ───
  useEffect(() => {
    const html = document.documentElement
    const theme = localStorage.getItem('drift-theme') || 'dark'
    const font = localStorage.getItem('drift-font') || 'mixed'
    const aesthetic = localStorage.getItem('drift-aesthetic') || 'film grain'

    html.classList.remove('theme-warm', 'theme-auto')
    if (theme === 'warm') html.classList.add('theme-warm')
    else if (theme === 'auto') html.classList.add('theme-auto')

    html.classList.remove('font-serif', 'font-sans')
    if (font === 'serif') html.classList.add('font-serif')
    else if (font === 'sans') html.classList.add('font-sans')

    html.classList.remove('no-grain', 'aesthetic-glass')
    if (aesthetic === 'minimal') html.classList.add('no-grain')
    else if (aesthetic === 'glassmorphism') html.classList.add('aesthetic-glass')
  }, [])

  // ─── Shared state for like/save mechanics ───
  const [likedPostIds, setLikedPostIds] = useState(new Set())
  const [savedPostIds, setSavedPostIds] = useState(new Set())
  const [likedPosts, setLikedPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])

  // ─── User's own posted cards ───
  const [userPosts, setUserPosts] = useState([])
  const [userProfile, setUserProfile] = useState({ photo: null, username: '', name: '', bio: '' })



  // ─── User profile view ───
  const [viewedUser, setViewedUser] = useState(null)

  const navigate = useCallback((newScreen) => {
    setPrevScreen(screen)
    setScreen(newScreen)
  }, [screen])

  // ─── Post created handler ───
  const handlePostCreated = useCallback((post) => {
    setUserPosts(prev => [{ 
      ...post, 
      id: Date.now(),
      user: userProfile.username ? `@${userProfile.username.replace('@', '')}` : '@you',
      resonated: 0,
      isMine: true,
    }, ...prev])
    navigate(prevScreen || 'home')
  }, [prevScreen, navigate, userProfile])

  // ─── Post deleted handler ───
  const handlePostDeleted = useCallback((postId) => {
    setUserPosts(prev => prev.filter(post => post.id !== postId))
  }, [])

  const handleSplashComplete = useCallback(() => {
    setAppState('onboarding')
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    setAppState('main')
  }, [])

  const handleLogout = useCallback(() => {
    setAppState('splash')
    setScreen('home')
  }, [])

  // ─── Like handler ───
  const handleLike = useCallback((postId, isLiked) => {
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (isLiked) next.add(postId)
      else next.delete(postId)
      return next
    })

    if (isLiked) {
      const post = discoveries.find((d) => d.id === postId)
        || discoveries.find((d) => d.id === postId % 100)
      if (post) {
        setLikedPosts((prev) => {
          if (prev.find((p) => p.id === postId)) return prev
          return [...prev, { ...post, id: postId }]
        })
      }
    } else {
      setLikedPosts((prev) => prev.filter((p) => p.id !== postId))
    }
  }, [discoveries])

  // ─── Save handler ───
  const handleSave = useCallback((postId, isSaved) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev)
      if (isSaved) next.add(postId)
      else next.delete(postId)
      return next
    })

    if (isSaved) {
      const post = discoveries.find((d) => d.id === postId)
        || discoveries.find((d) => d.id === postId % 100)
      if (post) {
        setSavedPosts((prev) => {
          if (prev.find((p) => p.id === postId)) return prev
          return [...prev, { ...post, id: postId }]
        })
      }
    } else {
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId))
    }
  }, [discoveries])



  // ─── User tap → open user profile ───
  const handleUserTap = useCallback((username) => {
    setViewedUser(username)
    navigate('userprofile')
  }, [navigate])

  // Don't show bottom nav on splash/onboarding, settings, camera, or user profile
  const showNav = appState === 'main'
    && screen !== 'settings'
    && screen !== 'userprofile'
    && screen !== 'add'

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            userPosts={userPosts}
            onExplore={() => navigate('explore')}
            onProfileTap={() => navigate('profile')}
            onLike={handleLike}
            onSave={handleSave}
            onUserTap={handleUserTap}
          />
        )

      case 'add':
        return <AddDiscoveryScreen onBack={() => navigate(prevScreen || 'home')} onPostCreated={handlePostCreated} />
      case 'discovery':
        return (
          <DiscoveryScreen
            savedPosts={savedPosts}
            onLike={handleLike}
            onSave={handleSave}
            onUserTap={handleUserTap}
          />
        )
      case 'mycollection':
        return (
          <MyCollectionScreen
            onLike={handleLike}
            onSave={handleSave}
            onUserTap={handleUserTap}
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            onOpenSettings={() => navigate('settings')}
            onDiscoveryTap={() => navigate('discovery')}
            savedPosts={savedPosts}
            onUserTap={handleUserTap}
            onAddTap={() => navigate('add')}
            userPosts={userPosts}
            userProfile={userProfile}
            onProfileUpdate={setUserProfile}
            onDeletePost={handlePostDeleted}
          />
        )
      case 'explore':
        return (
          <ExploreScreen
            onBack={() => navigate('home')}
            onUserTap={handleUserTap}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => navigate(prevScreen || 'profile')}
            onLogout={handleLogout}
            userProfile={userProfile}
            onProfileUpdate={setUserProfile}
          />
        )
      case 'userprofile':
        return (
          <UserProfileScreen
            username={viewedUser}
            onBack={() => navigate(prevScreen || 'home')}
          />
        )
      default:
        return (
          <HomeScreen
            onExplore={() => navigate('explore')}
            onProfileTap={() => navigate('profile')}
            onLike={handleLike}
            onSave={handleSave}
            onUserTap={handleUserTap}
          />
        )
    }
  }

  return (
    <div className="film-grain" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Splash */}
      {appState === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Onboarding */}
      {appState === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {/* Main app */}
      {appState === 'main' && (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>

          {showNav && (
            <BottomNav activeScreen={screen} onNavigate={navigate} />
          )}
        </>
      )}
    </div>
  )
}
