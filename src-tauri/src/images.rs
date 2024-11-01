use anyhow::{Context, Result};
use image::ImageFormat;
use oxipng::{optimize_from_memory, Options};
use rfd::FileDialog;
use std::fs;
use std::io::{Cursor, Write};

pub fn compress_image_form_path<P: AsRef<std::path::Path>>(
    input_path: P,
    output_path: P,
) -> Result<(u64, u64)> {
    // 打开原始图片
    let img = image::open(&input_path).context("Failed to open image file")?;

    // 获取原始大小
    let original_size = fs::metadata(&input_path)
        .context("Failed to read file metadata")?
        .len();

    // 确定输出格式
    let format = match input_path.as_ref().extension().and_then(|s| s.to_str()) {
        Some("jpg") | Some("jpeg") => ImageFormat::Jpeg,
        Some("png") => ImageFormat::Png,
        Some("gif") => ImageFormat::Gif,
        Some("bmp") => ImageFormat::Bmp,
        _ => return Err(anyhow::anyhow!("Unsupported file format")),
    };

    if format == ImageFormat::Png {
        // 将图像保存到内存缓冲区中
        let mut png_data = Vec::new();
        img.write_to(&mut Cursor::new(&mut png_data), ImageFormat::Png)
            .context("Failed to write image to buffer")?;
        // 设置 oxipng 的压缩选项
        let options = Options::from_preset(3); // 使用预设级别 3

        // 使用 oxipng 进行压缩
        let output_data =
            optimize_from_memory(&png_data, &options).context("Failed to optimize image")?;

        // 将压缩后的数据写入文件
        let mut output_file = fs::File::create(&output_path)?;
        output_file.write_all(&output_data)?;

        // 获取压缩后的大小
        let compressed_size = output_data.len() as u64;

        return Ok((original_size, compressed_size));
    }

    // 压缩并保存图片
    let mut buffer = Cursor::new(Vec::new());
    img.write_to(&mut buffer, format)
        .context("Failed to write compressed image")?;
    let buffer = buffer.into_inner();
    // 保存压缩后的文件
    fs::write(&output_path, &buffer).context("Failed to save compressed image")?;

    // 获取压缩后的大小
    let compressed_size = buffer.len() as u64;

    Ok((original_size, compressed_size))
}

pub fn pick_images() -> Result<Vec<std::path::PathBuf>> {
    // 选择多个文件
    let file_paths = FileDialog::new()
        .add_filter("Images", &["jpg", "jpeg", "png", "gif", "bmp"])
        .set_title("Select Images to Compress")
        .pick_files();

    // 检查用户是否选择了文件
    let file_paths = file_paths.with_context(|| "No files selected")?;

    Ok(file_paths)
}

pub fn compress_image() -> Result<Vec<(String, String, u64, u64, f64)>> {
    let file_paths = pick_images().context("Failed to pick files")?;
    if file_paths.is_empty() {
        return Ok(Vec::new());
    }
    let mut result = Vec::new();
    for file_path in file_paths {
        let output_path = file_path.with_extension(format!(
            "compressed.{}",
            file_path.extension().unwrap().to_str().unwrap()
        ));
        let (original_size, compressed_size) =
            compress_image_form_path(&file_path, &output_path).unwrap();

        let compression_ratio = (original_size as f64 - compressed_size as f64) / original_size as f64 * 100.0;

        result.push((
            file_path.display().to_string(),
            output_path.display().to_string(),
            original_size / 1024,
            compressed_size / 1024,
            compression_ratio
        ));
    }

    Ok(result)
}
