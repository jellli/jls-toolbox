import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronDown, ChevronUp, CheckCircle, XCircle, Trash2, FolderOpen, Loader2 } from 'lucide-react'
import useMeasure from 'react-use-measure'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ImageComparisonSlider } from './image-comparison-slider'
import { convertFileSrc, invoke } from '@tauri-apps/api/core'

type CompressResult = {
  id: string;
  original_size: number;
  compressed_size: number;
  compression_ratio: number;
  output_path: string;
  input_path: string;
  status: "completed" | "processing" | "failed";
  duration: number;
  expanded: boolean;
};

const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size.toFixed(0)} KB`
  }
  return `${(size / 1024).toFixed(1)} MB`
}

const formatTime = (time: number) => {
  if (time < 1000) {
    return `${time.toFixed(0)} ms`
  }
  return `${(time / 1000).toFixed(1)} s`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'processing': return 'bg-blue-500'
    case 'failed': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-3 w-3" />
    case 'processing': return <Loader2 className="h-3 w-3 animate-spin" />
    case 'failed': return <XCircle className="h-3 w-3" />
    default: return null
  }
}

const getRatioDisplay = (ratio: number) => {
  if (ratio > 0) {
    return <span className="text-green-500">-{ratio.toFixed(1)}%</span>
  } else if (ratio < 0) {
    return <span className="text-red-500">+{(-ratio).toFixed(1)}%</span>
  } else {
    return <span className="text-gray-500">0%</span>
  }
}

interface ImageItemProps {
  img: CompressResult;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ImageItem: React.FC<ImageItemProps> = ({ img, onToggleExpand, onDelete }) => {
  const [ref, { height }] = useMeasure({ debounce: 100, scroll: true })
  //const [isContentVisible, setIsContentVisible] = useState(false)

  const openFolder = (path: string) => {
    invoke('open_folder', { path })
  }

  // useEffect(() => {
  //   if (img.expanded) {
  //     setIsContentVisible(true)
  //   } else {
  //     const timer = setTimeout(() => {
  //       setIsContentVisible(false)
  //     }, 300)
  //     return () => clearTimeout(timer)
  //   }
  // }, [img.expanded])

  return (
    <Card className="bg-white dark:bg-gray-800 mb-3 overflow-hidden group">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={convertFileSrc(img.input_path)} className="w-full h-full object-cover" alt="Compressed image thumbnail" />
            </div>
            <div>
              <h3 className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">{img.input_path.split('/').pop()}</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <span>{formatSize(img.original_size)}</span>
                {img.status === 'completed' && (
                  <>
                    <span>→</span>
                    <span className="font-medium">{formatSize(img.compressed_size)}</span>
                    <span>{getRatioDisplay(img.compression_ratio)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={`${getStatusColor(img.status)} text-white`}>
              <span className="flex items-center space-x-1">
                {getStatusIcon(img.status)}
                <span>{img.status.charAt(0).toUpperCase() + img.status.slice(1)}</span>
              </span>
            </Badge>
            <AnimatePresence>
              {img.status === 'completed' && (
                <motion.div
                  className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFolder(img.output_path)}
                    className="p-1 h-8 w-8"
                    title="Open containing folder"
                  >
                    <FolderOpen size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(img.id)}
                    className="p-1 h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(img.id)}
              className="p-1 h-8 w-8"
              title={img.expanded ? "Collapse" : "Expand"}
            >
              {img.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {img.expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: height || 'auto'
              }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 1
              }}
            >
              <div ref={ref}>
                {img.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Compression Details</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Time: {formatTime(img.duration)}
                    </p>
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Before / After Comparison</p>
                      <ImageComparisonSlider beforeImage={convertFileSrc(img.input_path)} afterImage={convertFileSrc(img.output_path)} />
                    </div>
                  </div>
                )}
                {img.status === 'processing' && (
                  <div className="mt-3 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                )}
                {img.status === 'failed' && (
                  <div className="mt-3 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Image comparison not available</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}