
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
    } else if(node.type == SQL_NODE_TYPE.UNION_NODE) {
        const  {fieldMappings = [], } = node.properties;
        node.properties = {
            ...node.properties,
            fieldMapping: fieldMappings.map((field) => ({
                targetField: field.targetField,
                outputAlias: field.targetName,
                fieldType: field.targetType,
                sourceMappings: Object.keys(field.sourceMap).forEach(key => {
                    return {
                        nodeKey: key,
                        fieldKey: field.sourceMap[key]
                    }
                })
            }))
        }
        delete node.properties.fieldMappings;
    } else if(node.type == SQL_NODE_TYPE.GROUP_NODE) {
        const {aggregateFields = []} = node.properties;
        aggregateFields.forEach(field => {
            delete field.type
        })
    } else if(node.type == SQL_NODE_TYPE.FIELD_NODE) {
        const {fieldSettings = []} = node.properties
        node.properties = {
            ...node.properties,
            fields: fieldSettings
        }
        delete node.properties.fieldSettings
    }
  });

  return nextData;
}

export function formatFromServer() {}
