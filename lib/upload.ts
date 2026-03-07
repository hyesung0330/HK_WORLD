export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.url) {
      return data.url;
    }
    throw new Error(data.error || 'Upload failed');
  } catch (error) {
    console.error('Image upload failed', error);
    return null;
  }
};
