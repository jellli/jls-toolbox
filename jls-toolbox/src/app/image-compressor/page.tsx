"use client";
import React, { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

import { convertFileSrc } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { listen } from "@tauri-apps/api/event";

// pub struct CompressImageResult {
//   pub original_size: u64,
//   pub compressed_size: u64,
//   pub compression_ratio: f64,
//   pub output_path: String,
//   pub input_path: String,
//   pub is_compressed: bool,
// }
type CompressResult = {
  original_size: number;
  compressed_size: number;
  compression_ratio: number;
  output_path: string;
  input_path: string;
  is_compressed: boolean;
};
const ImageCompressor = () => {
  const [compressedResult, setCompressedResult] = React.useState<
    CompressResult[]
  >([]);
  console.count("ImageCompressor render");
  useEffect(() => {
    const listener = listen("compress-image", (event) => {
      const result = event.payload as CompressResult;
      setCompressedResult((prev) => {
        let index = prev.findIndex((r) => r.input_path === result.input_path);
        if (index === -1) {
          return [...prev, result];
        }
        return prev.map((r, i) => {
          if (i === index) {
            return result;
          }
          return r;
        });
      });
    });

    return () => {
      listener.then((l) => l());
    };
  }, []);
  return (
    <div className={cn("p-4")}>
      <Button
        className={cn("capitalize")}
        variant="outline"
        onClick={() => {
          invoke("compress_image_command");
        }}
      >
        select file
      </Button>

      <div className={cn("mt-4 rounded-lg overflow-scroll")}>
        {/* <div className={cn("flex justify-between bg-gray-200 py-2 px-4 text-sm")}>
          <div>
            <span className="capitalize mr-1">duration: </span>
            <span className={cn("font-bold")}>{duration}ms</span>
          </div>
          <div>
            <span className="capitalize mr-1">total optimized images: </span>
            <span className={cn("font-bold")}>{list.length}</span>
          </div>
          <div>
            <span className="capitalize mr-1">saved size:</span>
            <span className={cn("font-bold text-green-600")}>
              {savedSize}KB
            </span>
          </div>
          <div>
            <span className="capitalize mr-1">saved ratio:</span>
            <span className={cn("font-bold text-green-600")}>
              {savedRatio.toFixed(2)}%
            </span>
          </div>
        </div> */}
        <ul className={cn("px-4 py-2 border rounded-b-lg")}>
          {compressedResult.map(
            ({
              original_size,
              compressed_size,
              compression_ratio,
              input_path,
              output_path
            }) => {
              const filename = input_path.split("/").pop();
              const extension = filename?.split(".").pop();
              return (
                <li
                  key={input_path}
                  className={cn("flex justify-between mb-4 last:mb-0")}
                >
                  <div className={cn("flex")}>
                    <div className={cn("w-10 h-10 mr-4 border rounded-lg")}>
                      <img
                        src={convertFileSrc(output_path)}
                        alt={filename}
                        className={cn("w-full h-full rounded-lg")}
                      />
                    </div>
                    <div>
                      <h3 className={cn("text-sm mb-1 font-bold")}>
                        {filename}
                      </h3>
                      <div className={cn("flex items-center text-xs")}>
                        <span
                          className={cn(
                            "text-xs px-1 rounded-sm bg-green-300 text-green-800 mr-2 uppercase"
                          )}
                        >
                          {extension}
                        </span>
                        <span className={cn("text-gray-500")}>
                          {original_size}KB
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-xs text-gray-500 flex flex-col justify-center"
                    )}
                  >
                    <div className={cn("text-green-500")}>
                      -{compression_ratio.toFixed(2)}%
                    </div>
                    <div>{compressed_size}KB</div>
                  </div>
                </li>
              );
            }
          )}
        </ul>
      </div>
    </div>
  );
};

export default ImageCompressor;
