import {textFileProcessor} from '../../../../../../utils';

export default async function (blob) {
  return (await textFileProcessor(blob)).split('\n');
}
