import DatabaseOutlined from "./icons/DatabaseOutlined.vue";
import ExportOutlined from "./icons/ExportOutlined.vue";
import JoinInnerOutlined from "./icons/JoinInnerOutlined.vue";
import MergeTypeOutlined from "./icons/MergeTypeOutlined.vue";
import FunctionsOutlined from "./icons/FunctionsOutlined.vue";
import FilterAltOutlined from "./icons/FilterAltOutlined.vue";
import TextFieldsOutlined from "./icons/TextFieldsOutlined.vue";
import ContentCutOutlined from "./icons/ContentCutOutlined.vue";
import { SQL_NODE_TYPE } from "../menus";

export const sqlNodeIconMap: Record<string, unknown> = {
  [SQL_NODE_TYPE.IN_NODE]: DatabaseOutlined,
  [SQL_NODE_TYPE.OUT_NODE]: ExportOutlined,
  [SQL_NODE_TYPE.JOIN_NODE]: JoinInnerOutlined,
  [SQL_NODE_TYPE.UNION_NODE]: MergeTypeOutlined,
  [SQL_NODE_TYPE.GROUP_NODE]: FunctionsOutlined,
  [SQL_NODE_TYPE.WHERE_NODE]: FilterAltOutlined,
  [SQL_NODE_TYPE.FIELD_NODE]: TextFieldsOutlined,
  [SQL_NODE_TYPE.DISTINCT_NODE]: ContentCutOutlined,
};

export const defaultSqlNodeIcon = DatabaseOutlined;
