import DatabaseOutlined from "./icons/DatabaseOutlined.vue";
import ExportOutlined from "./icons/ExportOutlined.vue";
import JoinInnerOutlined from "./icons/JoinInnerOutlined.vue";
import MergeTypeOutlined from "./icons/MergeTypeOutlined.vue";
import FunctionsOutlined from "./icons/FunctionsOutlined.vue";
import FilterAltOutlined from "./icons/FilterAltOutlined.vue";
import TextFieldsOutlined from "./icons/TextFieldsOutlined.vue";
import ContentCutOutlined from "./icons/ContentCutOutlined.vue";

export const sqlNodeIconMap: Record<string, unknown> = {
  "in-node": DatabaseOutlined,
  "out-node": ExportOutlined,
  "join-node": JoinInnerOutlined,
  "union-node": MergeTypeOutlined,
  "group-node": FunctionsOutlined,
  "where-node": FilterAltOutlined,
  "field-node": TextFieldsOutlined,
  "distinct-node": ContentCutOutlined,
};

export const defaultSqlNodeIcon = DatabaseOutlined;
