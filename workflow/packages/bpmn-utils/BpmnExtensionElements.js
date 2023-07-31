import { is } from "bpmn-js/lib/util/ModelUtil";
import { isArray } from "min-dash";
import { getModeler } from "@packages/bpmn-utils/BpmnDesignerUtils";

/**
 * Get extension elements of business object. Optionally filter by type.
 * 获取业务对象的扩展元素。（可选）按类型筛选
 */
export function getExtensionElementsList(businessObject, type) {
  const extensionElements = businessObject?.get("extensionElements");
  if (!extensionElements) return [];

  const values = extensionElements.get("values");
  if (!values || !values.length) return [];

  if (type) return values.filter((value) => is(value, type));

  return values;
}

/**
 * Add one or more extension elements. Create bpmn:ExtensionElements if it doesn't exist.
 * 添加一个或多个扩展元素。如果bpmn:ExtensionElements不存在，请创建它。
 */
export function addExtensionElements(
  element,
  businessObject,
  extensionElementToAdd
) {
  const modeling = getModeler.get("modeling");
  let extensionElements = businessObject.get("extensionElements");

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createModdleElement(
      "bpmn:ExtensionElements",
      { values: [] },
      businessObject
    );
    modeling.updateModdleProperties(element, businessObject, {
      extensionElements,
    });
  }
  extensionElementToAdd.$parent = extensionElements;

  // (2) add extension element to list
  modeling.updateModdleProperties(element, extensionElements, {
    values: [...extensionElements.get("values"), extensionElementToAdd],
  });
}

/**
 * Remove one or more extension elements. Remove bpmn:ExtensionElements afterwards if it's empty.
 * 拆下一个或多个延伸元件。如果bpmn:ExtensionElements为空，请稍后删除它
 */
export function removeExtensionElements(
  element,
  businessObject,
  extensionElementsToRemove
) {
  if (!isArray(extensionElementsToRemove)) {
    extensionElementsToRemove = [extensionElementsToRemove];
  }

  const extensionElements = businessObject.get("extensionElements"),
    values = extensionElements
      .get("values")
      .filter((value) => !extensionElementsToRemove.includes(value));

  const modeling = getModeler.get("modeling");
  modeling.updateModdleProperties(element, extensionElements, { values });
}

/**
 * 创建moddle节点
 * @param {*} elementType
 * @param {*} properties
 * @param {*} parent
 * @returns
 */
export function createModdleElement(elementType, properties, parent) {
  const moddle = getModeler.get("moddle");
  const element = moddle.create(elementType, properties);
  parent && (element.$parent = parent);
  return element;
}
