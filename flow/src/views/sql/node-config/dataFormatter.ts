
import { SQL_NODE_TYPE } from "../menus";

export function formatToServer(graphData: any) {
  const nextData = JSON.parse(JSON.stringify(graphData));
  nextData.nodes.forEach((node) => {
    if (node.type == SQL_NODE_TYPE.IN_NODE) {
      const { inputBinding = {} } = node.properties;
      const {
        sourceType,
        sourceExtra = {},
        sourceId,
        sourceName,
        fieldKeys = [],
      } = inputBinding;
      node.properties = {
        ...node.properties,
        sourceType,
        objectId: sourceId,
        selectedFields: fieldKeys.map((field) => ({
          fieldKey: field.fieldKey,
          alias: field.fieldAlias,
          fieldType: field.fieldType,
        })),
        sourceExtra: sourceExtra,
      };
      delete node.properties.inputBinding;
    } else if( node.type == SQL_NODE_TYPE.WHERE_NODE) {
        const {whereConditions=[], whereLogic} = node.properties;
        node.properties = {
            ...node.properties,
            logic: whereLogic,
            conditions: whereConditions
        }
        delete node.properties.whereConditions;
        delete node.properties.whereLogic;
    }
  });

  return nextData;
}

export function formatFromServer() {}
