export default function (blob) {
  return new Promise((resolve, reject) => {
    if (!blob) {
      reject(new Error('Empty response'));
      return;
    }
    if (!blob.size) {
      resolve('');
      return;
    }
    const fileReader = new FileReader();
    fileReader.onerror = (e) => {
      reject(e);
      fileReader.abort();
    };
    fileReader.onload = (e) => {
      resolve(e.target.result);
    };
    fileReader.readAsText(blob);
  });
}
