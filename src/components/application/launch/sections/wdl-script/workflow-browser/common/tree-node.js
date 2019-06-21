import React from 'react';
import {Icon, Tree} from 'antd';
import {DIRECTORY, FILE} from '../../../../../../../models/workflow-listing';
import styles from '../workflow-browser.css';

const Title = ({className, icon, name}) => (
  <span className={className}>
    {icon && <Icon type={icon} />}
    {name}
  </span>
);

const renderWorkflowLibraryNode = (children) => {
  if (Array.isArray(children)) {
    return children.map(renderWorkflowLibraryNode);
  }
  let element;
  switch (children.type) {
    case FILE:
      element = (
        <Tree.TreeNode
          title={<Title className={styles.file} icon="fork" name={children.name} />}
          key={children.path}
          dataRef={children}
          isLeaf={children.type === FILE}
        />
      );
      break;
    case DIRECTORY:
    default:
      if (children.loaded && children.children.length > 0) {
        element = (
          <Tree.TreeNode
            title={<Title className={styles.folder} icon="folder" name={children.name} />}
            key={children.path}
            dataRef={children}
          >
            {renderWorkflowLibraryNode(children.children)}
          </Tree.TreeNode>
        );
      } else {
        element = (
          <Tree.TreeNode
            title={<Title className={styles.folder} icon="folder" name={children.name} />}
            key={children.path}
            dataRef={children}
            isLeaf={children.loaded && (children.children || []).length === 0}
          />
        );
      }
      break;
  }
  return element;
};

export default renderWorkflowLibraryNode;
