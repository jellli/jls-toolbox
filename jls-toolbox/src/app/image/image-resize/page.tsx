"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { Upload, Image as LucideImage, Percent, AlertCircle, FileIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { ImageItem } from './image-item'

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

export default function ImageCompressor() {
  const [images, setImages] = useState<CompressResult[]>([])

  const handleCompressImage = useCallback((event: any) => {
    const result = {
      ...event.payload as CompressResult,
      expanded: false
    };
    setImages((prev) => {
      const index = prev.findIndex((r) => r.input_path === result.input_path);
      if (index === -1) {
        return [...prev, result];
      }
      return prev.map((r, i) => i === index ? result : r);
    });
  }, []);

  useEffect(() => {
    const listener = listen("compress-image", handleCompressImage);
    return () => {
      listener.then((l) => l());
    };
  }, [handleCompressImage]);

  const totalOriginalSize = images.reduce((sum, img) => sum + img.original_size, 0)
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.compressed_size || 0), 0)
  const averageRatio = images.filter(img => img.status === 'completed').reduce((sum, img) => sum + img.compression_ratio, 0) / images.filter(img => img.status === 'completed').length || 0
  const totalImages = images.length
  const completedImages = images.filter(img => img.status === 'completed').length
  const failedImages = images.filter(img => img.status === 'failed').length
  const overallProgress = (completedImages / totalImages) * 100 || 0

  const toggleExpand = useCallback((id: string) => {
    setImages(prevImages => prevImages.map(img =>
      img.id === id ? { ...img, expanded: !img.expanded } : img
    ))
  }, [])

  const deleteImage = useCallback((id: string) => {
    setImages(prevImages => prevImages.filter(img => img.id !== id))
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 flex-grow flex flex-col max-w-4xl">
        <motion.h1
          className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Image Compressor
        </motion.h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            className="col-span-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => invoke("compress_image_command")}
          >
            <Upload className="h-12 w-12 text-blue-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Drag and drop images here, or click to select files</p>
          </motion.div>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Compression Summary</h2>
              <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}>
                <motion.p className="text-sm flex items-center" variants={{
                  hidden: { opacity: 0, x: -20 },

                  visible: { opacity: 1, x: 0 }
                }}>
                  <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatSize(totalOriginalSize - totalCompressedSize)}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Total Size Reduced</span>
                </motion.p>
                <motion.p className="text-sm flex items-center" variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}>
                  <Percent className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">{averageRatio.toFixed(1)}%</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Average Compression</span>
                </motion.p>
                <motion.p className="text-sm flex items-center" variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}>
                  <LucideImage className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{totalImages}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Images Processed</span>
                </motion.p>
                <motion.p className="text-sm flex items-center" variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}>
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  <span className="font-bold text-lg text-red-600 dark:text-red-400">{failedImages}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">Compression Failed</span>
                </motion.p>
              </motion.div>
            </CardContent>
          </Card>
        </div>

        <motion.div
          className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{completedImages}/{totalImages} files</span>
          </div>
          <Progress value={overallProgress} className="w-full h-2" />
        </motion.div>

        <ScrollArea className="flex-grow">
          <AnimatePresence mode='popLayout'>
            {images.map((img) => (
              <motion.div
                key={img.id}
                // layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ImageItem
                  img={img}
                  onToggleExpand={toggleExpand}
                  onDelete={deleteImage}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  )
}