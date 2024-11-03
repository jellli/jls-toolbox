import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye } from 'lucide-react'

interface ImageComparisonSliderProps {
  beforeImage: string
  afterImage: string
}

export function ImageComparisonSlider({ beforeImage, afterImage }: ImageComparisonSliderProps) {
  const [isShowingBefore, setIsShowingBefore] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const handleMouseUp = () => setIsPressed(false)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    setIsShowingBefore(isPressed)
  }, [isPressed])

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg">
      <AnimatePresence initial={false}>
        <motion.img
          key={isShowingBefore ? 'before' : 'after'}
          src={isShowingBefore ? beforeImage : afterImage}
          alt={isShowingBefore ? "Before compression" : "After compression"}
          className="absolute top-0 left-0 w-full h-full object-cover"
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // exit={{ opacity: 0 }}
        // transition={{ duration: 0.2 }}
        />
      </AnimatePresence>

      <motion.button
        className="absolute top-2 right-2 w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseDown={() => setIsPressed(true)}
        onTouchStart={() => setIsPressed(true)}
        aria-label="Press and hold to see original image"
      >
        <Eye className="w-6 h-6 text-gray-800" />
      </motion.button>

      <motion.div
        className="absolute bottom-2 left-2 px-3 py-1 bg-black bg-opacity-50 rounded-full text-white text-sm font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isShowingBefore ? 'Before' : 'After'}
      </motion.div>
    </div>
  )
}