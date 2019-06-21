/* eslint-disable react/no-danger */
import React from 'react';
import {buildLogLine} from '../utilities';

export default function (
  {
    active,
    ansiUp,
    className,
    text,
    relativeIndex,
    searchPattern,
  },
) {
  ansiUp.bg = null;
  ansiUp.fg = null;
  const result = buildLogLine(
    text,
    searchPattern,
    active,
    relativeIndex,
  );
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{__html: result}}
    />
  );
}
