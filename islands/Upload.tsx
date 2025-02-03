import { signal } from "@preact/signals";

const preview = signal<string | undefined>(undefined);
const selectedFile = signal<File | undefined>(undefined);
const dragActive = signal(false);
const uploadProgress = signal(0);
const isUploading = signal(false);
const uploadResult = signal<
  { success: boolean; url?: string; message?: string; name?: string } | undefined
>(undefined);

export default function Upload() {
  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    preview.value = url;
    selectedFile.value = file;
  };

  const handleUpload = () => {
    if (!selectedFile.value) return;

    try {
      isUploading.value = true;
      uploadProgress.value = 0;

      const formData = new FormData();
      formData.append("file", selectedFile.value);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          uploadProgress.value = progress;
        }
      };

      xhr.open("POST", "/api/upload");

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          uploadResult.value = {
            success: true,
            url: xhr.responseText,
            message: "文件上传成功",
            name: selectedFile.value?.name
          };
          isUploading.value = false;
          uploadProgress.value = 100;
        } else {
          throw new Error("上传失败");
        }
      };

      xhr.onerror = () => {
        throw new Error("网络错误");
      };

      xhr.send(formData);
    } catch (error) {
      console.error("上传错误:", error);
    }
  };

  // 拖拽处理
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      dragActive.value = true;
    } else if (e.type === "dragleave") {
      dragActive.value = false;
    }
  };

  // 拖拽释放
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragActive.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  // 点击选择文件
  const handleFileSelect = (event: InputEvent) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Freshpic</h1>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-all duration-200
            ${
            dragActive.value
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-500"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <label className="cursor-pointer flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-600 mb-2">
              点击选择图片或拖拽到此区域
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onInput={handleFileSelect}
            />
          </label>
        </div>

        {preview.value && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">预览</h2>
            <div className="border rounded-lg overflow-hidden">
              <img
                src={preview.value}
                alt="预览图片"
                className="w-full h-auto object-contain max-h-96"
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={handleUpload}
                disabled={isUploading.value}
                className={`w-full py-2 px-4 rounded-lg font-medium mt-4 ${
                  isUploading.value
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isUploading.value ? "上传中..." : "开始上传"}
              </button>

              {isUploading.value && (
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.value}%` }}
                  />
                </div>
              )}
            </div>
            {uploadResult.value?.success && (
              <div className="mt-4 p-4 rounded-md text-green-700 flex items-center justify-between">
                <div className="max-w-[200px] sm:max-w-[100%]">
                  <p className="mb-1">{`${uploadResult.value.name}:${uploadResult.value.message}`}</p>
                  <div className="flex items-center">
                    <span className="mr-2">URL:</span>
                    <a href={uploadResult.value.url} target="_blank" className="text-blue-500 truncate max-w-[200px]">{uploadResult.value.url}</a>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (uploadResult.value?.url) {
                      navigator.clipboard.writeText(uploadResult.value.url);
                      alert("URL 已复制到剪贴板");
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg sm:text-base text-sm"
                >
                  复制
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
