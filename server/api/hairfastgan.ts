import { createError, defineEventHandler, readMultipartFormData } from "h3";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * API endpoint để xử lý việc chuyển đổi kiểu tóc bằng model hairfastgan
 */
export default defineEventHandler(async (event) => {
  try {
    // Đọc dữ liệu form
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: "No form data provided",
      });
    }

    // Tìm các file trong form data
    const faceImage = formData.find((part) => part.name === "face_image");
    const hairstyleImage = formData.find(
      (part) => part.name === "hairstyle_image"
    );
    const hairColorImage = formData.find(
      (part) => part.name === "hair_color_image"
    );

    // Kiểm tra đầy đủ các file
    if (!faceImage || !hairstyleImage || !hairColorImage) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required images",
      });
    }

    // Tạo thư mục tạm để lưu ảnh
    const tempDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "hairfastgan-")
    );

    // Lưu các file vào thư mục tạm
    const faceImagePath = path.join(tempDir, "face.jpg");
    const hairstyleImagePath = path.join(tempDir, "hairstyle.jpg");
    const hairColorImagePath = path.join(tempDir, "haircolor.jpg");
    const outputImagePath = path.join(tempDir, "result.jpg");

    await fs.promises.writeFile(faceImagePath, faceImage.data);
    await fs.promises.writeFile(hairstyleImagePath, hairstyleImage.data);
    await fs.promises.writeFile(hairColorImagePath, hairColorImage.data);

    // Gọi model hairfastgan (thay thế command dưới đây bằng lệnh thực tế đến model)
    // Đây là một ví dụ - bạn cần thay thế bằng command thực tế đến model HairFastGAN của bạn
    try {
      await execAsync(
        `python /path/to/hairfastgan/main.py --face ${faceImagePath} --hairstyle ${hairstyleImagePath} --haircolor ${hairColorImagePath} --output ${outputImagePath}`
      );

      // Đọc ảnh kết quả và chuyển sang base64
      const resultImageBuffer = await fs.promises.readFile(outputImagePath);
      const resultImageBase64 = resultImageBuffer.toString("base64");

      // Xóa thư mục tạm
      await fs.promises.rm(tempDir, { recursive: true });

      // Trả về kết quả
      return {
        success: true,
        result_image: resultImageBase64,
      };
    } catch (execError) {
      console.error("Error executing HairFastGAN model:", execError);

      // Xóa thư mục tạm
      await fs.promises.rm(tempDir, { recursive: true });

      throw createError({
        statusCode: 500,
        statusMessage: "Error processing image with HairFastGAN model",
      });
    }
  } catch (error) {
    console.error("API error:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Server error",
    });
  }
});
