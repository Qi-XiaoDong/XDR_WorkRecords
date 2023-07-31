/**
 * 用于添加监听器
 *=============================================
 */

import { getBusinessObject, is, isAny } from "bpmn-js/lib/util/ModelUtil";
import {
  getModeler,
  getProcessEngine,
  LISTENER_ALLOWED_TYPES,
} from "@packages/bpmn-utils/BpmnDesignerUtils";
import {
  getExtensionElementsList,
  addExtensionElements,
  removeExtensionElements,
} from "@packages/bpmn-utils/BpmnExtensionElements";
import { createScript } from "@packages/bo-utils/scriptUtil";

export const EXECUTION_LISTENER_TYPE = {
  class: "Java class",
  expression: "Expression",
  delegateExpression: "Delegate expression",
  script: "Script",
};

/**
 * 得到事件监听器的容器
 * @param {*} element
 * @returns
 */
export function getListenersContainer(element) {
  const businessObject = getBusinessObject(element);
  return businessObject?.get("processRef") || businessObject;
}

export function getDefaultEvent(element) {
  return is(element, "bpmn:SequenceFlow") ? "take" : "start";
}

export function getExecutionListenerTypes(element) {
  if (is(element, "bpmn:SequenceFlow")) {
    return [{ label: "Take", value: "take" }];
  }
  return [
    { label: "Start", value: "start" },
    { label: "End", value: "end" },
  ];
}

//helpers
export function isExecutable(element) {
  if (isAny(element, LISTENER_ALLOWED_TYPES)) return true;
  if (is(element, "bpmn:Participant")) {
    return !!element.businessObject.processRef;
  }
  return false;
}

/**
 * 获取监听器类型
 * @param {*} listener
 * @returns
 */
export function getExecutionListenerType(listener) {
  const prefix = getProcessEngine();
  if (isAny(listener, [`${prefix}:ExecutionListener`])) {
    if (listener.get(`${prefix}:class`)) return "class";
    if (listener.get(`${prefix}:expression`)) return "expression";
    if (listener.get(`${prefix}:delegateExpression`))
      return "delegateExpression";
    if (listener.get("script")) return "script";
  }
  return "";
}

/**
 * 更新监听器属性
 * @param {*} element
 * @param {*} listener
 * @param {*} props
 */
function updateListenerProperty(element, listener, props = {}) {
  const modeling = getModeler.getModeling();
  const prefix = getProcessEngine();
  const {
    event,
    class: listenerClass,
    expression,
    delegateExpression,
    script,
    type,
    fields,
  } = props;

  // 更新监听器属性
  const updateProperty = (key, value) =>
    modeling.updateModdleProperties(element, listener, {
      [`${prefix}:${key}`]: value,
    });

  event && updateProperty("event", event);
  listenerClass && updateProperty("class", listenerClass);
  expression && updateProperty("expression", expression);
  delegateExpression &&
    updateProperty("delegateExpression", delegateExpression);

  // 脚本
  if (script) {
    const bpmnScript = createScript(script);
    modeling.updateModdleProperties(element, listener, { script: bpmnScript });
  }
}

/**
 * 获取指定的扩展元素列表
 * @param {*} element
 * @returns
 */
export function getExecutionListeners(element) {
  const prefix = getProcessEngine();
  const businessObject = getListenersContainer(element);
  return getExtensionElementsList(
    businessObject,
    `${prefix}:ExecutionListener`
  );
}

/**
 * create an empty execution listener and update element's businessObject
 * 创建一个空的执行侦听器并更新元素的businessObject
 *
 * */

export function addEmptyExtensionListener(element) {
  const prefix = getProcessEngine();
  const moddle = getModeler.getModdle();
  const listener = moddle.create(`${prefix}:ExecutionListener`, {
    event: getDefaultEvent(element),
    class: "",
  });
  const businessObject = getListenersContainer(element);
  addExtensionElements(element, businessObject, listener);
}

// create an execution listener with props
// 创建执行侦听器并且更新数据;
export function addExecutionListener(element, props) {
  const prefix = getProcessEngine();
  const moddle = getModeler.getModdle();
  const businessObject = getListenersContainer(element);
  const listener = moddle.create(`${prefix}:ExecutionListener`, {});
  updateListenerProperty(element, listener, props);
  // 监听器加入到扩展元素
  addExtensionElements(element, businessObject, listener);
}

/**update execution listener's property
 * 更新执行侦听器的属性 在编辑监听器时使用
 * @param {*} element
 * @param {*} props
 * @param {*} listener
 */
export function updateExecutionListener(element, props, listener) {
  removeExtensionElements(element, getListenersContainer(element), listener);
  addExecutionListener(element, props);
}

/**
 * remove an execution listener
 * 删除一个监听器
 * @param {*} element
 * @param {*} listener
 */
export function removeExecutionListener(element, listener) {
  removeExtensionElements(element, getListenersContainer(element), listener);
}
