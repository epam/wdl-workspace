import React from 'react';
import {Collapse, Row} from 'antd';

function renderFailure(failure, index, allFailures, ident = 0) {
  if (failure.causedBy && failure.causedBy.length) {
    if (ident === 0) {
      return (
        <Collapse
          className="workflow-failures"
          key={index}
          bordered={false}
        >
          <Collapse.Panel
            key="root"
            header={failure.message}
          >
            {failure.causedBy.map((c, i, a) => renderFailure(c, i, a, ident + 1))}
          </Collapse.Panel>
        </Collapse>
      );
    }
    return (
      <Row key={index} type="flex" style={{paddingLeft: 5}}>
        {failure.message}
        {failure.causedBy.map((c, i, a) => renderFailure(c, i, a, ident + 1))}
      </Row>
    );
  }
  return (
    <Row key={index} type="flex" style={{paddingLeft: 5}}>{failure.message}</Row>
  );
}

export default renderFailure;
