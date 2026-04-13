export interface InputField {
  key: string;
  name: string;
  type: string;
}

export interface InputSource {
  id: string;
  name: string;
  description?: string;
  fields: InputField[];
  rows: Record<string, unknown>[];
}

export interface InputBindingPersisted {
  sourceId: string;
  fieldKeys: string[];
}

export interface BoundInputSource {
  sourceId: string;
  sourceName: string;
  fields: InputField[];
}

export interface FieldSettingPersistedItem {
  key: string;
  name: string;
}

export interface FieldSettingItem extends InputField {
  selected: boolean;
}

export interface GroupAggregateFieldPersistedItem {
  key: string;
  method: GroupAggregateMethod;
}

export interface GroupAggregateFieldItem extends InputField {
  method: GroupAggregateMethod;
}

export interface InputPreviewResult {
  columns: InputField[];
  rows: Record<string, unknown>[];
}

export interface DistinctPreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
  fields: string[];
}

export interface FieldNodePreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export interface GroupNodePreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export interface OutputPreviewPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export interface NodeConfigSnapshot {
  id: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface NodeRequestPayload {
  nodeId: string;
  nodeType?: string;
  upstreamNodes: NodeConfigSnapshot[];
  currentNode?: NodeConfigSnapshot | null;
}

export type GroupAggregateMethod =
  | "sum"
  | "avg"
  | "max"
  | "min"
  | "count"
  | "median"
  | "variance"
  | "stddev"
  | "distinctCount"
  | "earliest"
  | "latest";

export interface GroupAggregateMethodOption {
  label: string;
  value: GroupAggregateMethod;
}

// ============================================================
// MOCK_API_NOTE
// This file contains mock data + mock async APIs for SQL nodes.
// Quick search keyword: MOCK_API
// ============================================================

const createRows = <T>(factory: (index: number) => T, count = 10): T[] => {
  return Array.from({ length: count }, (_, index) => factory(index));
};

const buildFields = (
  customFields: Array<{ key: string; type: string; name?: string }>,
): InputField[] => {
  const fieldNameMap: Record<string, string> = {
    id: "主键ID",
    createTime: "创建时间",
    updateTime: "更新时间",
    isDelete: "是否删除",
    customerCode: "客户编码",
    customerName: "客户名称",
    gender: "性别",
    mobile: "手机号",
    age: "年龄",
    level: "客户等级",
    birthday: "生日",
    idCard: "身份证号",
    email: "邮箱",
    address: "地址",
    maritalStatus: "婚姻状态",
    company: "公司名称",
    jobTitle: "职位",
    emergencyContact: "紧急联系人",
    emergencyPhone: "紧急联系人电话",
    sourceChannel: "来源渠道",
    orderNo: "订单号",
    customerId: "客户ID",
    packageId: "套餐ID",
    amount: "金额",
    status: "状态",
    payTime: "支付时间",
    packageCode: "套餐编码",
    packageName: "套餐名称",
    category: "分类",
    price: "价格",
    genderLimit: "性别限制",
    enabled: "启用状态",
    itemCode: "项目编码",
    itemName: "项目名称",
    itemType: "项目类型",
    department: "科室",
    needFasting: "是否空腹",
    deptCode: "科室编码",
    deptName: "科室名称",
    leader: "负责人",
    phone: "联系电话",
    location: "位置",
    doctorCode: "医生编码",
    doctorName: "医生姓名",
    deptId: "科室ID",
    title: "职称",
    specialty: "专业方向",
    appointmentNo: "预约号",
    appointmentDate: "预约日期",
    timeSlot: "时间段",
    reportNo: "报告号",
    summary: "摘要",
    riskLevel: "风险等级",
    publishStatus: "发布状态",
    paymentNo: "支付流水号",
    orderId: "订单ID",
    payChannel: "支付渠道",
    payStatus: "支付状态",
    refundNo: "退款单号",
    refundAmount: "退款金额",
    refundReason: "退款原因",
    refundStatus: "退款状态",
    refundTime: "退款时间",
    invoiceNo: "发票号",
    invoiceType: "发票类型",
    taxNo: "税号",
    invoiceStatus: "发票状态",
    checkinNo: "签到号",
    appointmentId: "预约ID",
    checkinTime: "签到时间",
    queueNo: "排队号",
    checkinStatus: "签到状态",
    sampleNo: "样本号",
    sampleType: "样本类型",
    collector: "采样员",
    collectTime: "采样时间",
    sampleStatus: "样本状态",
    prescriptionNo: "处方号",
    doctorId: "医生ID",
    diagnosis: "诊断",
    medication: "用药信息",
    prescriptionStatus: "处方状态",
    noticeNo: "通知号",
    noticeType: "通知类型",
    content: "内容",
    sendChannel: "发送渠道",
    sendStatus: "发送状态",
    archiveNo: "档案号",
    archiveType: "档案类型",
    filePath: "文件路径",
    operatorName: "操作人",
    archiveStatus: "档案状态",
    contractNo: "合同号",
    signDate: "签约日期",
    expireDate: "到期日期",
    contractStatus: "合同状态",
    supplierCode: "供应商编码",
    supplierName: "供应商名称",
    contactName: "联系人",
    contactPhone: "联系人电话",
    supplierStatus: "供应商状态",
  };

  const resolveFieldName = (key: string, explicitName?: string) => {
    return explicitName || fieldNameMap[key] || `字段_${key}`;
  };

  const commonFields: InputField[] = [
    { key: "id", name: resolveFieldName("id"), type: "bigint" },
    {
      key: "createTime",
      name: resolveFieldName("createTime"),
      type: "datetime",
    },
    {
      key: "updateTime",
      name: resolveFieldName("updateTime"),
      type: "datetime",
    },
    {
      key: "isDelete",
      name: resolveFieldName("isDelete"),
      type: "tinyint",
    },
  ];

  return [
    ...commonFields,
    ...customFields.map((field) => ({
      key: field.key,
      name: resolveFieldName(field.key, field.name),
      type: field.type,
    })),
  ];
};

const buildCommonRow = (index: number) => ({
  id: 1000 + index + 1,
  createTime: `2026-04-${String((index % 9) + 1).padStart(2, "0")} 09:00:00`,
  updateTime: `2026-04-${String((index % 9) + 1).padStart(2, "0")} 18:30:00`,
  isDelete: 0,
});

const customerFields = buildFields([
  { key: "customerCode", type: "varchar" },
  { key: "customerName", type: "varchar" },
  { key: "gender", type: "varchar" },
  { key: "mobile", type: "varchar" },
  { key: "age", type: "int" },
  { key: "level", type: "varchar" },
  { key: "birthday", type: "date" },
  { key: "idCard", type: "varchar" },
  { key: "email", type: "varchar" },
  { key: "address", type: "varchar" },
  { key: "maritalStatus", type: "varchar" },
  { key: "company", type: "varchar" },
  { key: "jobTitle", type: "varchar" },
  { key: "emergencyContact", type: "varchar" },
  { key: "emergencyPhone", type: "varchar" },
  { key: "sourceChannel", type: "varchar" },
]);

const orderFields = buildFields([
  { key: "orderNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "packageId", type: "bigint" },
  { key: "amount", type: "decimal(10,2)" },
  { key: "status", type: "varchar" },
  { key: "payTime", type: "datetime" },
]);

const examPackageFields = buildFields([
  { key: "packageCode", type: "varchar" },
  { key: "packageName", type: "varchar" },
  { key: "category", type: "varchar" },
  { key: "price", type: "decimal(10,2)" },
  { key: "genderLimit", type: "varchar" },
  { key: "enabled", type: "tinyint" },
]);

const examItemFields = buildFields([
  { key: "itemCode", type: "varchar" },
  { key: "itemName", type: "varchar" },
  { key: "itemType", type: "varchar" },
  { key: "price", type: "decimal(10,2)" },
  { key: "department", type: "varchar" },
  { key: "needFasting", type: "tinyint" },
]);

const departmentFields = buildFields([
  { key: "deptCode", type: "varchar" },
  { key: "deptName", type: "varchar" },
  { key: "leader", type: "varchar" },
  { key: "phone", type: "varchar" },
  { key: "location", type: "varchar" },
  { key: "status", type: "varchar" },
]);

const doctorFields = buildFields([
  { key: "doctorCode", type: "varchar" },
  { key: "doctorName", type: "varchar" },
  { key: "deptId", type: "bigint" },
  { key: "title", type: "varchar" },
  { key: "specialty", type: "varchar" },
  { key: "status", type: "varchar" },
]);

const appointmentFields = buildFields([
  { key: "appointmentNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "packageId", type: "bigint" },
  { key: "appointmentDate", type: "date" },
  { key: "timeSlot", type: "varchar" },
  { key: "status", type: "varchar" },
]);

const reportFields = buildFields([
  { key: "reportNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "packageId", type: "bigint" },
  { key: "summary", type: "varchar" },
  { key: "riskLevel", type: "varchar" },
  { key: "publishStatus", type: "varchar" },
  { key: "publishTime", type: "datetime" },
  { key: "doctorId", type: "bigint"},
  { key: "diagnosis", type: "varchar" },
  { key: "treatment", type: "varchar" },
  { key: "followUp", type: "varchar" },
  { key: "remark", type: "varchar" },
]);

const paymentFields = buildFields([
  { key: "paymentNo", type: "varchar" },
  { key: "orderId", type: "bigint" },
  { key: "customerId", type: "bigint" },
  { key: "amount", type: "decimal(10,2)" },
  { key: "payChannel", type: "varchar" },
  { key: "payStatus", type: "varchar" },
]);

const refundFields = buildFields([
  { key: "refundNo", type: "varchar" },
  { key: "orderId", type: "bigint" },
  { key: "refundAmount", type: "decimal(10,2)" },
  { key: "refundReason", type: "varchar" },
  { key: "refundStatus", type: "varchar" },
  { key: "refundTime", type: "datetime" },
]);

const invoiceFields = buildFields([
  { key: "invoiceNo", type: "varchar" },
  { key: "orderId", type: "bigint" },
  { key: "customerName", type: "varchar" },
  { key: "invoiceType", type: "varchar" },
  { key: "taxNo", type: "varchar" },
  { key: "invoiceStatus", type: "varchar" },
]);

const checkinFields = buildFields([
  { key: "checkinNo", type: "varchar" },
  { key: "appointmentId", type: "bigint" },
  { key: "customerId", type: "bigint" },
  { key: "checkinTime", type: "datetime" },
  { key: "queueNo", type: "varchar" },
  { key: "checkinStatus", type: "varchar" },
]);

const sampleFields = buildFields([
  { key: "sampleNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "sampleType", type: "varchar" },
  { key: "collector", type: "varchar" },
  { key: "collectTime", type: "datetime" },
  { key: "sampleStatus", type: "varchar" },
]);

const prescriptionFields = buildFields([
  { key: "prescriptionNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "doctorId", type: "bigint" },
  { key: "diagnosis", type: "varchar" },
  { key: "medication", type: "varchar" },
  { key: "prescriptionStatus", type: "varchar" },
]);

const noticeFields = buildFields([
  { key: "noticeNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "noticeType", type: "varchar" },
  { key: "content", type: "varchar" },
  { key: "sendChannel", type: "varchar" },
  { key: "sendStatus", type: "varchar" },
]);

const archiveFields = buildFields([
  { key: "archiveNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "archiveType", type: "varchar" },
  { key: "filePath", type: "varchar" },
  { key: "operatorName", type: "varchar" },
  { key: "archiveStatus", type: "varchar" },
]);

const contractFields = buildFields([
  { key: "contractNo", type: "varchar" },
  { key: "customerId", type: "bigint" },
  { key: "packageId", type: "bigint" },
  { key: "signDate", type: "date" },
  { key: "expireDate", type: "date" },
  { key: "contractStatus", type: "varchar" },
]);

const supplierFields = buildFields([
  { key: "supplierCode", type: "varchar" },
  { key: "supplierName", type: "varchar" },
  { key: "contactName", type: "varchar" },
  { key: "contactPhone", type: "varchar" },
  { key: "category", type: "varchar" },
  { key: "supplierStatus", type: "varchar" },
]);

// =========================== MOCK_DATA_START ===========================
export const inputNodeMockSources: InputSource[] = [
  {
    id: "customer",
    name: "客户表 customer",
    description: "客户基础信息",
    fields: customerFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      customerCode: `CUS${String(index + 1).padStart(4, "0")}`,
      customerName: `客户${index + 1}`,
      gender: index % 2 === 0 ? "男" : "女",
      mobile: `13800138${String(index).padStart(3, "0")}`,
      age: 22 + index,
      level: ["普通", "银卡", "金卡", "黑金"][index % 4],
      birthday: `199${index}-05-${String((index % 9) + 1).padStart(2, "0")}`,
      idCard: `44010119900${index}1234`,
      email: `customer${index + 1}@example.com`,
      address: `深圳市南山区科技园 ${index + 1} 栋`,
      maritalStatus: index % 2 === 0 ? "未婚" : "已婚",
      company: `企业${index + 1}`,
      jobTitle: ["工程师", "产品经理", "运营", "销售"][index % 4],
      emergencyContact: `联系人${index + 1}`,
      emergencyPhone: `13900139${String(index).padStart(3, "0")}`,
      sourceChannel: ["线下门店", "公众号", "企业客户", "小程序"][index % 4],
    })),
  },
  {
    id: "order",
    name: "订单表 order",
    description: "订单交易数据",
    fields: orderFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      orderNo: `EX20260409${String(index + 1).padStart(4, "0")}`,
      customerId: 1001 + index,
      packageId: 501 + (index % 8),
      amount: 399 + index * 120,
      status: ["已支付", "待体检", "体检中", "已完成"][index % 4],
      payTime: `2026-04-${String((index % 9) + 1).padStart(2, "0")} 10:15:00`,
    })),
  },
  {
    id: "exam_package",
    name: "套餐表 exam_package",
    description: "体检套餐基础数据",
    fields: examPackageFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      packageCode: `PKG${String(index + 1).padStart(4, "0")}`,
      packageName: `体检套餐 ${index + 1}`,
      category: ["基础", "高端", "专项"][index % 3],
      price: 299 + index * 100,
      genderLimit: ["不限", "男", "女"][index % 3],
      enabled: index % 4 === 0 ? 0 : 1,
    })),
  },
  {
    id: "exam_item",
    name: "项目表 exam_item",
    description: "体检项目数据",
    fields: examItemFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      itemCode: `ITEM${String(index + 1).padStart(4, "0")}`,
      itemName: `检查项目 ${index + 1}`,
      itemType: ["检验", "影像", "常规"][index % 3],
      price: 80 + index * 15,
      department: ["内科", "外科", "检验科", "影像科"][index % 4],
      needFasting: index % 2,
    })),
  },
  {
    id: "department",
    name: "科室表 department",
    description: "体检科室信息",
    fields: departmentFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      deptCode: `DEPT${String(index + 1).padStart(3, "0")}`,
      deptName: ["内科", "外科", "检验科", "影像科", "口腔科"][index % 5],
      leader: `负责人${index + 1}`,
      phone: `0755-8800${String(index).padStart(3, "0")}`,
      location: `${index + 1} 号楼 ${index + 2} 层`,
      status: index % 2 === 0 ? "启用" : "维护中",
    })),
  },
  {
    id: "doctor",
    name: "医生表 doctor",
    description: "医生基础信息",
    fields: doctorFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      doctorCode: `DOC${String(index + 1).padStart(4, "0")}`,
      doctorName: `医生${index + 1}`,
      deptId: 1001 + (index % 5),
      title: ["主任医师", "副主任医师", "主治医师"][index % 3],
      specialty: ["内科", "外科", "影像", "检验"][index % 4],
      status: index % 3 === 0 ? "停诊" : "在岗",
    })),
  },
  {
    id: "appointment",
    name: "预约表 appointment",
    description: "体检预约信息",
    fields: appointmentFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      appointmentNo: `AP${String(index + 1).padStart(5, "0")}`,
      customerId: 1001 + index,
      packageId: 501 + (index % 8),
      appointmentDate: `2026-04-${String((index % 9) + 10).padStart(2, "0")}`,
      timeSlot: ["08:00-09:00", "09:00-10:00", "10:00-11:00"][index % 3],
      status: ["已预约", "已签到", "已完成"][index % 3],
    })),
  },
  {
    id: "report",
    name: "报告表 report",
    description: "体检报告汇总",
    fields: reportFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      reportNo: `RP${String(index + 1).padStart(5, "0")}`,
      customerId: 1001 + index,
      packageId: 501 + (index % 8),
      summary: `报告摘要 ${index + 1}`,
      riskLevel: ["低", "中", "高"][index % 3],
      publishStatus: index % 2 === 0 ? "已发布" : "待审核",
    })),
  },
  {
    id: "payment",
    name: "支付表 payment",
    description: "订单支付流水",
    fields: paymentFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      paymentNo: `PAY${String(index + 1).padStart(5, "0")}`,
      orderId: 1001 + index,
      customerId: 1001 + index,
      amount: 200 + index * 88,
      payChannel: ["微信", "支付宝", "银行卡"][index % 3],
      payStatus: index % 4 === 0 ? "支付失败" : "支付成功",
    })),
  },
  {
    id: "refund",
    name: "退款表 refund",
    description: "订单退款记录",
    fields: refundFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      refundNo: `REF${String(index + 1).padStart(5, "0")}`,
      orderId: 1001 + index,
      refundAmount: 100 + index * 50,
      refundReason: ["订单取消", "项目缺失", "客户申请"][index % 3],
      refundStatus: ["处理中", "已退款", "已驳回"][index % 3],
      refundTime: `2026-04-${String((index % 9) + 1).padStart(2, "0")} 14:20:00`,
    })),
  },
  {
    id: "invoice",
    name: "发票表 invoice",
    description: "发票开具记录",
    fields: invoiceFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      invoiceNo: `INV${String(index + 1).padStart(5, "0")}`,
      orderId: 1001 + index,
      customerName: `客户${index + 1}`,
      invoiceType: ["电子普票", "电子专票"][index % 2],
      taxNo: `TAXNO${String(index + 1).padStart(6, "0")}`,
      invoiceStatus: ["待开票", "已开票", "已作废"][index % 3],
    })),
  },
  {
    id: "checkin",
    name: "签到表 checkin",
    description: "到院签到记录",
    fields: checkinFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      checkinNo: `CHK${String(index + 1).padStart(5, "0")}`,
      appointmentId: 1001 + index,
      customerId: 1001 + index,
      checkinTime: `2026-04-${String((index % 9) + 10).padStart(2, "0")} 08:10:00`,
      queueNo: `Q${String(index + 1).padStart(3, "0")}`,
      checkinStatus: ["已签到", "排队中", "已完成"][index % 3],
    })),
  },
  {
    id: "sample",
    name: "样本表 sample",
    description: "检验样本记录",
    fields: sampleFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      sampleNo: `SMP${String(index + 1).padStart(5, "0")}`,
      customerId: 1001 + index,
      sampleType: ["血液", "尿液", "粪便"][index % 3],
      collector: `采样员${index + 1}`,
      collectTime: `2026-04-${String((index % 9) + 1).padStart(2, "0")} 09:30:00`,
      sampleStatus: ["已采样", "送检中", "已完成"][index % 3],
    })),
  },
  {
    id: "prescription",
    name: "处方表 prescription",
    description: "医生处方记录",
    fields: prescriptionFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      prescriptionNo: `PRE${String(index + 1).padStart(5, "0")}`,
      customerId: 1001 + index,
      doctorId: 1001 + (index % 8),
      diagnosis: `诊断结果 ${index + 1}`,
      medication: `药品组合 ${index + 1}`,
      prescriptionStatus: ["待发药", "已发药", "已完成"][index % 3],
    })),
  },
  {
    id: "notice",
    name: "通知表 notice",
    description: "客户通知消息",
    fields: noticeFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      noticeNo: `NTC${String(index + 1).padStart(5, "0")}`,
      customerId: 1001 + index,
      noticeType: ["预约通知", "报告通知", "营销通知"][index % 3],
      content: `通知内容 ${index + 1}`,
      sendChannel: ["短信", "公众号", "App"][index % 3],
      sendStatus: index % 2 === 0 ? "发送成功" : "待发送",
    })),
  },
  {
    id: "archive",
    name: "档案表 archive",
    description: "体检档案记录",
    fields: archiveFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      archiveNo: `ARC${String(index + 1).padStart(5, "0")}`,
      customerId: 1001 + index,
      archiveType: ["纸质", "电子"][index % 2],
      filePath: `/archive/customer_${index + 1}.pdf`,
      operatorName: `管理员${index + 1}`,
      archiveStatus: ["已归档", "待补充", "已封存"][index % 3],
    })),
  },
  {
    id: "contract",
    name: "合同表 contract",
    description: "企业签约合同",
    fields: contractFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      contractNo: `CON${String(index + 1).padStart(5, "0")}`,
      customerId: 1001 + index,
      packageId: 501 + (index % 8),
      signDate: `2026-03-${String((index % 9) + 1).padStart(2, "0")}`,
      expireDate: `2027-03-${String((index % 9) + 1).padStart(2, "0")}`,
      contractStatus: ["生效中", "待签署", "已到期"][index % 3],
    })),
  },
  {
    id: "supplier",
    name: "供应商表 supplier",
    description: "合作供应商信息",
    fields: supplierFields,
    rows: createRows((index) => ({
      ...buildCommonRow(index),
      supplierCode: `SUP${String(index + 1).padStart(5, "0")}`,
      supplierName: `供应商${index + 1}`,
      contactName: `联系人${index + 1}`,
      contactPhone: `13600136${String(index).padStart(3, "0")}`,
      category: ["设备", "耗材", "服务"][index % 3],
      supplierStatus: ["合作中", "待审核", "已停用"][index % 3],
    })),
  },
];
// ============================ MOCK_DATA_END ============================

export const getInputSourceById = (sourceId?: string | null) => {
  if (!sourceId) return undefined;
  return inputNodeMockSources.find((source) => source.id === sourceId);
};

// MOCK_API: fetch input source fields (simulate backend request)
export const fetchInputSourceFields = async (sourceId?: string | null) => {
  console.log("[MOCK_API] fetchInputSourceFields");
  const source = getInputSourceById(sourceId);
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });
  return source?.fields || [];
};

export const resolveInputBinding = (
  binding?: InputBindingPersisted | null,
): BoundInputSource | null => {
  const source = getInputSourceById(binding?.sourceId);
  if (!source) return null;
  const fieldKeys = new Set(binding?.fieldKeys || []);
  return {
    sourceId: source.id,
    sourceName: source.name,
    fields: source.fields.filter((field) => fieldKeys.has(field.key)),
  };
};

export const getPreviewRowsByBinding = (
  binding?: BoundInputSource | InputBindingPersisted | null,
) => {
  const source = getInputSourceById(binding?.sourceId);
  if (!source) return [];
  const fieldKeys =
    binding && "fields" in binding
      ? new Set(binding.fields.map((field) => field.key))
      : new Set((binding?.fieldKeys || []).map((key) => key));
  return source.rows.map((row) => {
    const nextRow: Record<string, unknown> = {};
    source.fields.forEach((field) => {
      if (fieldKeys.size === 0 || fieldKeys.has(field.key)) {
        nextRow[field.key] = row[field.key];
      }
    });
    return nextRow;
  });
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const parseInputFields = (value: unknown): InputField[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((field): field is InputField => {
    return (
      isRecord(field) &&
      typeof field.key === "string" &&
      typeof field.name === "string" &&
      typeof field.type === "string"
    );
  });
};

const parseInputBinding = (value: unknown): InputBindingPersisted | null => {
  if (!isRecord(value)) return null;
  if (typeof value.sourceId !== "string" || !Array.isArray(value.fieldKeys)) {
    return null;
  }
  return {
    sourceId: value.sourceId,
    fieldKeys: value.fieldKeys.filter((key): key is string => typeof key === "string"),
  };
};

const parseFieldSettingItems = (value: unknown): FieldSettingPersistedItem[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((field): field is FieldSettingPersistedItem => {
    return (
      isRecord(field) &&
      typeof field.key === "string" &&
      typeof field.name === "string"
    );
  });
};

const parseDistinctFieldKeys = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((field): field is string => typeof field === "string");
};

const parseGroupAggregateFields = (value: unknown): GroupAggregateFieldPersistedItem[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((field): field is GroupAggregateFieldPersistedItem => {
    return (
      isRecord(field) &&
      typeof field.key === "string" &&
      typeof field.method === "string"
    );
  });
};

const NUMERIC_METHOD_OPTIONS: GroupAggregateMethodOption[] = [
  { label: "求和", value: "sum" },
  { label: "平均值", value: "avg" },
  { label: "最大值", value: "max" },
  { label: "最小值", value: "min" },
  { label: "计数", value: "count" },
  { label: "中位数", value: "median" },
  { label: "方差", value: "variance" },
  { label: "标准差", value: "stddev" },
  { label: "去重计数", value: "distinctCount" },
];

const STRING_METHOD_OPTIONS: GroupAggregateMethodOption[] = [
  { label: "计数", value: "count" },
  { label: "去重计数", value: "distinctCount" },
];

const DATETIME_METHOD_OPTIONS: GroupAggregateMethodOption[] = [
  { label: "计数", value: "count" },
  { label: "去重计数", value: "distinctCount" },
  { label: "最早", value: "earliest" },
  { label: "最晚", value: "latest" },
];

const DEFAULT_METHOD_OPTIONS: GroupAggregateMethodOption[] = [
  { label: "计数", value: "count" },
  { label: "去重计数", value: "distinctCount" },
];

const isNumericFieldType = (type: string) => {
  return /int|decimal|numeric|float|double|real|number/i.test(type);
};

const isStringFieldType = (type: string) => {
  return /char|text|varchar|string|enum|set/i.test(type);
};

const isDateTimeFieldType = (type: string) => {
  return /date|time|timestamp|year/i.test(type);
};

export const getGroupAggregateMethodOptions = (type: string): GroupAggregateMethodOption[] => {
  if (isNumericFieldType(type)) return NUMERIC_METHOD_OPTIONS;
  if (isStringFieldType(type)) return STRING_METHOD_OPTIONS;
  if (isDateTimeFieldType(type)) return DATETIME_METHOD_OPTIONS;
  return DEFAULT_METHOD_OPTIONS;
};

const getDefaultGroupAggregateMethod = (type: string): GroupAggregateMethod => {
  return getGroupAggregateMethodOptions(type)[0]?.value || "count";
};

const getGroupAggregateMethodLabel = (method: GroupAggregateMethod) => {
  return (
    [...NUMERIC_METHOD_OPTIONS, ...STRING_METHOD_OPTIONS, ...DATETIME_METHOD_OPTIONS]
      .find((item) => item.value === method)?.label || "计数"
  );
};

const normalizeGroupAggregateMethod = (type: string, method?: string): GroupAggregateMethod => {
  const options = getGroupAggregateMethodOptions(type);
  const matched = options.find((item) => item.value === method);
  return matched?.value || getDefaultGroupAggregateMethod(type);
};

const applyDistinctRows = (rows: Record<string, unknown>[], fieldKeys: string[]) => {
  if (fieldKeys.length === 0) return rows;
  const keys = fieldKeys;
  const seen = new Set<string>();
  return rows.filter((row) => {
    const fingerprint = keys.map((key) => String(row[key] ?? "__NULL__")).join("|");
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
};

const applyFieldSettings = (
  columns: InputField[],
  rows: Record<string, unknown>[],
  settings: FieldSettingPersistedItem[],
) => {
  const columnMap = new Map(columns.map((field) => [field.key, field]));
  const selectedFields = settings
    .map((field) => {
      const upstreamField = columnMap.get(field.key);
      if (!upstreamField) return null;
      return {
        key: field.key,
        name: field.name,
        type: upstreamField.type,
      } satisfies InputField;
    })
    .filter((field): field is InputField => Boolean(field));
  const nextColumns = selectedFields.map<InputField>((field) => ({
    key: field.key,
    name: field.name,
    type: field.type,
  }));
  const nextRows = rows.map((row) => {
    const nextRow: Record<string, unknown> = {};
    selectedFields.forEach((field) => {
      nextRow[field.key] = row[field.key];
    });
    return nextRow;
  });
  return {
    columns: nextColumns,
    rows: nextRows,
  };
};

const buildGroupAggregateColumn = (
  field: InputField,
  method: GroupAggregateMethod,
): InputField => {
  const label = getGroupAggregateMethodLabel(method);
  const nextType = (() => {
    if (method === "earliest" || method === "latest") return field.type;
    if (method === "count" || method === "distinctCount") return "bigint";
    return isNumericFieldType(field.type) ? field.type : "decimal";
  })();

  return {
    key: `${field.key}_${method}`,
    name: `${field.name}(${label})`,
    type: nextType,
  };
};

const parseNumberList = (rows: Record<string, unknown>[], key: string) => {
  return rows
    .map((row) => Number(row[key]))
    .filter((value) => Number.isFinite(value));
};

const parseDistinctValueCount = (rows: Record<string, unknown>[], key: string) => {
  return new Set(rows.map((row) => String(row[key] ?? "__NULL__"))).size;
};

const parseDateTimeValues = (rows: Record<string, unknown>[], key: string) => {
  return rows
    .map((row) => ({
      raw: row[key],
      time: new Date(String(row[key] ?? "")).getTime(),
    }))
    .filter((item) => Number.isFinite(item.time));
};

const calcVariance = (values: number[]) => {
  if (values.length === 0) return null;
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
};

const calcMedian = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

const calcAggregateValue = (
  rows: Record<string, unknown>[],
  field: InputField,
  method: GroupAggregateMethod,
) => {
  if (method === "count") {
    return rows.length;
  }

  if (method === "distinctCount") {
    return parseDistinctValueCount(rows, field.key);
  }

  if (method === "earliest" || method === "latest") {
    const values = parseDateTimeValues(rows, field.key);
    if (values.length === 0) return null;
    const sorted = values.sort((left, right) => left.time - right.time);
    return method === "earliest" ? sorted[0].raw : sorted[sorted.length - 1].raw;
  }

  const numbers = parseNumberList(rows, field.key);
  if (numbers.length === 0) return null;

  switch (method) {
    case "sum":
      return numbers.reduce((sum, value) => sum + value, 0);
    case "avg":
      return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    case "max":
      return Math.max(...numbers);
    case "min":
      return Math.min(...numbers);
    case "median":
      return calcMedian(numbers);
    case "variance":
      return calcVariance(numbers);
    case "stddev": {
      const variance = calcVariance(numbers);
      return variance === null ? null : Math.sqrt(variance);
    }
    default:
      return null;
  }
};

const applyGroupAggregation = (
  columns: InputField[],
  rows: Record<string, unknown>[],
  groupFieldKeys: string[],
  aggregateFields: GroupAggregateFieldPersistedItem[],
) => {
  if (groupFieldKeys.length === 0 && aggregateFields.length === 0) {
    return { columns, rows };
  }

  const columnMap = new Map(columns.map((field) => [field.key, field]));
  const groupFields = groupFieldKeys
    .map((key) => columnMap.get(key))
    .filter((field): field is InputField => Boolean(field));
  const aggregateConfigs = aggregateFields
    .map((item) => {
      const field = columnMap.get(item.key);
      if (!field) return null;
      const method = normalizeGroupAggregateMethod(field.type, item.method);
      return {
        field,
        method,
        column: buildGroupAggregateColumn(field, method),
      };
    })
    .filter(
      (
        item,
      ): item is {
        field: InputField;
        method: GroupAggregateMethod;
        column: InputField;
      } => Boolean(item),
    );

  const groupBuckets = new Map<string, Record<string, unknown>[]>();
  rows.forEach((row) => {
    const bucketKey =
      groupFields.length === 0
        ? "__all__"
        : groupFields.map((field) => String(row[field.key] ?? "__NULL__")).join("|");
    const bucketRows = groupBuckets.get(bucketKey);
    if (bucketRows) {
      bucketRows.push(row);
      return;
    }
    groupBuckets.set(bucketKey, [row]);
  });

  const nextRows = [...groupBuckets.values()].map((bucketRows) => {
    const firstRow = bucketRows[0] || {};
    const nextRow: Record<string, unknown> = {};
    groupFields.forEach((field) => {
      nextRow[field.key] = firstRow[field.key];
    });
    aggregateConfigs.forEach((config) => {
      nextRow[config.column.key] = calcAggregateValue(bucketRows, config.field, config.method);
    });
    return nextRow;
  });

  return {
    columns: [...groupFields, ...aggregateConfigs.map((config) => config.column)],
    rows: nextRows,
  };
};

const buildChainPreviewResult = (chainNodes: NodeConfigSnapshot[] = []) => {
  let columns: InputField[] = [];
  let rows: Record<string, unknown>[] = [];

  chainNodes.forEach((node) => {
    if (node.type === "in-node") {
      const binding = resolveInputBinding(parseInputBinding(node.properties?.inputBinding));
      columns = [...(binding?.fields || [])];
      rows = getPreviewRowsByBinding(binding).map((row) => ({ ...row }));
      return;
    }

    if (node.type === "field-node") {
      const fieldSettings = parseFieldSettingItems(node.properties?.fieldSettings);
      if (
        fieldSettings.length > 0 ||
        Object.prototype.hasOwnProperty.call(node.properties || {}, "fieldSettings")
      ) {
        const nextResult = applyFieldSettings(columns, rows, fieldSettings);
        columns = nextResult.columns;
        rows = nextResult.rows;
      }
      return;
    }

    if (node.type === "distinct-node") {
      const distinctFields = parseDistinctFieldKeys(node.properties?.distinctFields);
      rows = applyDistinctRows(rows, distinctFields);
      return;
    }

    if (node.type === "group-node") {
      const groupFields = parseDistinctFieldKeys(node.properties?.groupFields);
      const aggregateFields = parseGroupAggregateFields(node.properties?.aggregateFields);
      const nextResult = applyGroupAggregation(columns, rows, groupFields, aggregateFields);
      columns = nextResult.columns;
      rows = nextResult.rows;
    }
  });

  return {
    columns,
    rows,
  };
};

// MOCK_API: fetch preview table columns + rows (simulate backend request)
export const fetchInputPreviewByBinding = async (
  binding?: BoundInputSource | InputBindingPersisted | null,
): Promise<InputPreviewResult> => {
  console.log("[MOCK_API] fetchInputPreviewByBinding");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  const resolvedBinding =
    binding && "fields" in binding ? binding : resolveInputBinding(binding || null);

  if (!resolvedBinding) {
    return { columns: [], rows: [] };
  }

  const columns = resolvedBinding.fields || [];
  const rows = getPreviewRowsByBinding(resolvedBinding);
  return { columns, rows };
};

// MOCK_API: fetch upstream fields for distinct node (simulate backend request)
export const fetchDistinctNodeUpstreamFields = async (
  payload: NodeRequestPayload,
): Promise<InputField[]> => {
  console.log("[MOCK_API] fetchDistinctNodeUpstreamFields");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  const result = buildChainPreviewResult(payload.upstreamNodes);
  return [...result.columns];
};

// MOCK_API: fetch upstream fields for field node (simulate backend request)
export const fetchFieldNodeUpstreamFields = async (
  payload: NodeRequestPayload,
): Promise<InputField[]> => {
  console.log("[MOCK_API] fetchFieldNodeUpstreamFields");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  const result = buildChainPreviewResult(payload.upstreamNodes);
  return [...result.columns];
};

// MOCK_API: fetch upstream fields for group node (simulate backend request)
export const fetchGroupNodeUpstreamFields = async (
  payload: NodeRequestPayload,
): Promise<InputField[]> => {
  console.log("[MOCK_API] fetchGroupNodeUpstreamFields");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  const result = buildChainPreviewResult(payload.upstreamNodes);
  return [...result.columns];
};

// MOCK_API: fetch distinct node preview data (simulate backend request)
export const fetchDistinctPreviewByPayload = async (
  payload: DistinctPreviewPayload,
): Promise<InputPreviewResult> => {
  console.log("[MOCK_API] fetchDistinctPreviewByPayload");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  const { columns, rows } = buildChainPreviewResult(payload.upstreamNodes);
  const distinctRows = applyDistinctRows(rows, payload.fields || []);
  return { columns, rows: distinctRows };
};

// MOCK_API: fetch field node preview data (simulate backend request)
export const fetchFieldNodePreviewByPayload = async (
  payload: FieldNodePreviewPayload,
): Promise<InputPreviewResult> => {
  console.log("[MOCK_API] fetchFieldNodePreviewByPayload");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  return buildChainPreviewResult([
    ...payload.upstreamNodes,
    ...(payload.currentNode ? [payload.currentNode] : []),
  ]);
};

// MOCK_API: fetch group node preview data (simulate backend request)
export const fetchGroupNodePreviewByPayload = async (
  payload: GroupNodePreviewPayload,
): Promise<InputPreviewResult> => {
  console.log("[MOCK_API] fetchGroupNodePreviewByPayload");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  return buildChainPreviewResult([
    ...payload.upstreamNodes,
    ...(payload.currentNode ? [payload.currentNode] : []),
  ]);
};

// MOCK_API: fetch output node preview data (simulate backend request)
export const fetchOutputPreviewByPayload = async (
  payload: OutputPreviewPayload,
): Promise<InputPreviewResult> => {
  console.log("[MOCK_API] fetchOutputPreviewByPayload");
  await new Promise((resolve) => {
    window.setTimeout(resolve, 250);
  });

  // Output node preview = final result snapshot returned by backend (mocked from chain context).
  return buildChainPreviewResult(payload.upstreamNodes);
};
