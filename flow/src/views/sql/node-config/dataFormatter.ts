
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
                sourceMappings: Object.keys(field.sourceMap).map(key => {
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

export function formatFromServer(graphData: any) {
  const nextData = JSON.parse(JSON.stringify(graphData));
  nextData.nodes.forEach((node) => {
    if (node.type == SQL_NODE_TYPE.IN_NODE) {
      const {
        sourceType,
        objectId,
        selectedFields = [],
        sourceExtra = {},
      } = node.properties;
      node.properties = {
        ...node.properties,
        inputBinding: {
          sourceType,
          sourceId: objectId,
          sourceName: "",
          fieldKeys: selectedFields.map((field) => ({
            fieldKey: field.fieldKey,
            fieldAlias: field.alias,
            fieldType: field.fieldType,
          })),
          sourceExtra,
        },
      };
      delete node.properties.sourceType;
      delete node.properties.objectId;
      delete node.properties.selectedFields;
      delete node.properties.sourceExtra;
    } else if (node.type == SQL_NODE_TYPE.WHERE_NODE) {
      const { logic, conditions } = node.properties;
      node.properties = {
        ...node.properties,
        whereLogic: logic,
        whereConditions: conditions,
      };
      delete node.properties.logic;
      delete node.properties.conditions;
    } else if (node.type == SQL_NODE_TYPE.UNION_NODE) {
      const { fieldMapping = [] } = node.properties;
      node.properties = {
        ...node.properties,
        fieldMappings: fieldMapping.map((field) => {
          const sourceMap: Record<string, string> = {};
          if (Array.isArray(field.sourceMappings)) {
            field.sourceMappings.forEach((sm: any) => {
              sourceMap[sm.nodeKey] = sm.fieldKey;
            });
          }
          return {
            targetField: field.targetField,
            targetName: field.outputAlias,
            targetType: field.fieldType,
            sourceMap,
          };
        }),
      };
      delete node.properties.fieldMapping;
    } else if (node.type == SQL_NODE_TYPE.GROUP_NODE) {
      // 服务器数据中 aggregateFields 仍然存在，只是 type 已丢失，保持原样即可
    } else if (node.type == SQL_NODE_TYPE.FIELD_NODE) {
      const { fields = [] } = node.properties;
      node.properties = {
        ...node.properties,
        fieldSettings: fields,
      };
      delete node.properties.fields;
    }
  });

  return nextData;
}
