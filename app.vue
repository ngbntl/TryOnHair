<template>
  <div class="container">
    <h1>Thử kiểu tóc</h1>

    <div class="upload-container">
      <div class="upload-section">
        <h2>Ảnh khuôn mặt</h2>
        <div
          class="upload-area"
          @click="triggerFileInput('faceInput')"
          :class="{ 'has-image': facePreview }"
          :style="facePreview ? `background-image: url(${facePreview})` : ''"
        >
          <input
            type="file"
            ref="faceInput"
            accept="image/*"
            @change="handleFileUpload('face', $event)"
            hidden
          />
          <div v-if="!facePreview" class="upload-placeholder">
            <span class="material-icons">add_photo_alternate</span>
            <p>Nhấn để tải ảnh lên</p>
          </div>
        </div>
      </div>

      <div class="upload-section">
        <h2>Kiểu tóc</h2>
        <div
          class="upload-area"
          @click="triggerFileInput('hairstyleInput')"
          :class="{ 'has-image': hairstylePreview }"
          :style="
            hairstylePreview ? `background-image: url(${hairstylePreview})` : ''
          "
        >
          <input
            type="file"
            ref="hairstyleInput"
            accept="image/*"
            @change="handleFileUpload('hairstyle', $event)"
            hidden
          />
          <div v-if="!hairstylePreview" class="upload-placeholder">
            <span class="material-icons">add_photo_alternate</span>
            <p>Nhấn để tải ảnh lên</p>
          </div>
        </div>
      </div>

      <div class="upload-section">
        <h2>Màu tóc</h2>
        <div
          class="upload-area"
          @click="triggerFileInput('hairColorInput')"
          :class="{ 'has-image': hairColorPreview }"
          :style="
            hairColorPreview ? `background-image: url(${hairColorPreview})` : ''
          "
        >
          <input
            type="file"
            ref="hairColorInput"
            accept="image/*"
            @change="handleFileUpload('hairColor', $event)"
            hidden
          />
          <div v-if="!hairColorPreview" class="upload-placeholder">
            <span class="material-icons">add_photo_alternate</span>
            <p>Nhấn để tải ảnh lên</p>
          </div>
        </div>
      </div>
    </div>

    <button
      class="submit-btn"
      @click="submitImages"
      :disabled="!isFormValid || isLoading"
    >
      {{ isLoading ? "Đang xử lý..." : "Chuyển đổi" }}
    </button>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Đang xử lý ảnh, vui lòng đợi...</p>
    </div>

    <div v-if="resultImage" class="result-container">
      <h2>Kết quả</h2>
      <img :src="resultImage" alt="Ảnh kết quả" class="result-image" />
      <button class="download-btn" @click="downloadResult">
        Tải ảnh xuống
      </button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";

const config = useRuntimeConfig();

const apiClient = axios.create({
  baseURL: config.public.apiUrl,
  maxRedirects: 0,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

const facePreview = ref(null);
const hairstylePreview = ref(null);
const hairColorPreview = ref(null);

const faceFile = ref(null);
const hairstyleFile = ref(null);
const hairColorFile = ref(null);

const faceInput = ref(null);
const hairstyleInput = ref(null);
const hairColorInput = ref(null);

const isLoading = ref(false);
const resultImage = ref(null);
const errorMessage = ref(null);

const isFormValid = computed(() => {
  return faceFile.value && hairstyleFile.value && hairColorFile.value;
});

const triggerFileInput = (inputRef) => {
  if (inputRef === "faceInput") faceInput.value.click();
  if (inputRef === "hairstyleInput") hairstyleInput.value.click();
  if (inputRef === "hairColorInput") hairColorInput.value.click();
};

const handleFileUpload = (type, event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match("image.*")) {
    errorMessage.value = "Vui lòng chọn file ảnh hợp lệ";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = "Kích thước file quá lớn (tối đa 5MB)";
    return;
  }

  errorMessage.value = null;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (type === "face") {
      facePreview.value = e.target.result;
      faceFile.value = file;
    } else if (type === "hairstyle") {
      hairstylePreview.value = e.target.result;
      hairstyleFile.value = file;
    } else if (type === "hairColor") {
      hairColorPreview.value = e.target.result;
      hairColorFile.value = file;
    }
  };
  reader.readAsDataURL(file);
};

const submitImages = async () => {
  if (!isFormValid.value) {
    errorMessage.value = "Vui lòng tải lên đầy đủ 3 ảnh";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = null;

    const formData = new FormData();

    formData.append("face_file", faceFile.value);
    formData.append("shape_file", hairstyleFile.value);
    formData.append("color_file", hairColorFile.value);

    const apiUrl = `${config.public.apiUrl}/swap_hair`;
    console.log("API URL:", apiUrl);

    const response = await axios.post(apiUrl, formData, {
      headers: {
        Accept: "*/*",
      },
      timeout: 60000,
      maxRedirects: 5,
    });

    console.log("Nhận phản hồi từ API:", response.data);

    if (response.data && response.data.result_image_url) {
      resultImage.value = response.data.result_image_url;
      console.log("URL ảnh kết quả:", resultImage.value);
    } else {
      throw new Error("API không trả về URL ảnh kết quả");
    }
  } catch (error) {
    console.error("Lỗi khi gửi API:", error);

    if (error.response) {
      console.error("Chi tiết lỗi:", error.response.data);
      console.error("Mã trạng thái:", error.response.status);

      if (error.response.data && error.response.data.error) {
        errorMessage.value = `Lỗi xử lý: ${error.response.data.error}`;
      } else {
        errorMessage.value = `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      errorMessage.value =
        "Không nhận được phản hồi từ server. API có thể đã ngắt kết nối hoặc URL ngrok đã thay đổi.";
    } else {
      errorMessage.value = `Đã xảy ra lỗi: ${error.message}`;
    }
  } finally {
    isLoading.value = false;
  }
};

const downloadResult = () => {
  if (!resultImage.value) return;

  const a = document.createElement("a");
  a.href = resultImage.value;
  a.download = "hairstyle-result.jpg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Roboto", sans-serif;
}

body {
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

h2 {
  margin-bottom: 1rem;
  color: #444;
  font-size: 1.2rem;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
}

.upload-section {
  flex: 1;
  min-width: 250px;
}

.upload-area {
  width: 100%;
  aspect-ratio: 1;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #fff;
  transition: all 0.3s;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.upload-area:hover {
  border-color: #2196f3;
  background-color: #f9f9f9;
}

.upload-area.has-image {
  border: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #777;
}

.upload-placeholder .material-icons {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.submit-btn {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0b7dda;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.result-container {
  margin-top: 3rem;
  text-align: center;
}

.result-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.download-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.download-btn:hover {
  background-color: #45a049;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}

@media (max-width: 768px) {
  .upload-container {
    flex-direction: column;
  }

  .upload-section {
    width: 100%;
  }
}
</style>
