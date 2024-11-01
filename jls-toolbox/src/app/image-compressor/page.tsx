"use client";
import React from "react";
import { invoke } from "@tauri-apps/api/core";

import { convertFileSrc } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";

type CompressResult = [string, string, number, number, number];

const ImageCompressor = () => {
  const [compressedResult, setCompressedResult] = React.useState<
    [CompressResult[], number, number, number]
  >([[], 0, 0, 0]);

  const [list, duration, savedSize, savedRatio] = compressedResult;

  return (
    <div className={cn("p-4")}>
      <button
        className={cn(
          "px-2 py-1 bg-blue-600 text-white rounded-lg capitalize text-sm"
        )}
        onClick={() => {
          console.time("compress_image_command");
          invoke("compress_image_command").then((res) => {
            console.timeEnd("compress_image_command");
            setCompressedResult(
              res as [CompressResult[], number, number, number]
            );
          });
        }}
      >
        select file
      </button>

      <div className={cn("mt-4 rounded-lg overflow-scroll")}>
        <div className={cn("flex justify-between bg-gray-200 py-2 px-4 text-sm")}>
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
        </div>
        <ul className={cn("px-4 py-2 border rounded-b-lg")}>
          {list.map(([originPath, _, originSize, compressedSize, ratio]) => {
            const filename = originPath.split("/").pop();
            const extension = filename?.split(".").pop();
            return (
              <li
                key={originPath}
                className={cn("flex justify-between mb-4 last:mb-0")}
              >
                <div className={cn("flex")}>
                  <div className={cn("w-10 h-10 mr-4 border rounded-lg")}>
                    <img
                      src={convertFileSrc(originPath)}
                      alt={filename}
                      className={cn("w-full h-full rounded-lg")}
                    />
                  </div>
                  <div>
                    <h3 className={cn("text-sm mb-1 font-bold")}>{filename}</h3>
                    <div className={cn("flex items-center text-xs")}>
                      <span
                        className={cn(
                          "text-xs px-1 rounded-sm bg-green-300 text-green-800 mr-2 uppercase"
                        )}
                      >
                        {extension}
                      </span>
                      <span className={cn("text-gray-500")}>
                        {originSize}KB
                      </span>
                    </div>
                  </div>
                </div>
                <div className={cn("text-xs text-gray-500 flex flex-col justify-center")}>
                  <div className={cn("text-green-500")}>
                    -{ratio.toFixed(2)}%
                  </div>
                  <div>{compressedSize}KB</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ImageCompressor;
