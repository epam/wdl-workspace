import {message} from 'antd';
import {generateDownloadUrl} from '../../../models/executions';

export default async function (absolutePath) {
  const url = await generateDownloadUrl(absolutePath);
  if (url) {
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', absolutePath.split('/').pop());
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } else {
    message.error(`Unable to download ${absolutePath}`, 5);
  }
}
