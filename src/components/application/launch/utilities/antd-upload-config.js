export default function generateUploadOptions(onSelectFileCallback) {
  return {
    beforeUpload: (file) => {
      onSelectFileCallback(file);
      return false;
    },
    multiple: false,
    showUploadList: false,
  };
}
