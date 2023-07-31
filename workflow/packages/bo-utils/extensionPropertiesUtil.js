/***
 * 主要用于添加元素的扩展属性
 *
 *
 */
// ==============================

import { getBusinessObject, is } from "bpmn-js/lib/util/ModelUtil";
import { without } from "min-dash";
import {
  createModdleElement,
  getExtensionElementsList,
} from "@packages/bpmn-utils/BpmnExtensionElements";

import {
  getModeler,
  getProcessEngine,
} from "@packages/bpmn-utils/BpmnDesignerUtils";

function getRelevantBusinessObject(element) {
  const businessObject = getBusinessObject(element);
  if (is(element, "bpmn:Participant")) {
    return businessObject.get("processRef");
  }
  return businessObject;
}

/**
 * 获取节点的的value值
 * @param {*} bo
 * @returns
 */
function getPropertiesList(bo) {
  const properties = getProperties(bo);
  return properties && properties.get("values");
}

/**
 * 获取单个Properties节点
 * @param {*} bo
 * @returns
 */
function getProperties(bo) {
  return getExtensionElementsList(bo)[0];
}

/**
 * 用来扩展属性的
 * 扩展属性需要加载扩展节点上
 */

export function addExtensionProperty(element, property) {
  try {
    const modeling = getModeler.getModeling();
    //读取当前流程解析引擎
    const prefix = getProcessEngine();

    // 读取节点上的业务对象
    const businessObject = getRelevantBusinessObject(element);

    //1. 检查是否有扩展节点元素

    let extensionElements = businessObject.get("extensionElements");
    // 如果没有创建扩展元素
    if (!extensionElements) {
      extensionElements = createModdleElement(
        "bpmn:ExtensionElements",
        { values: [] },
        businessObject
      );
      // 扩展元素加入到选中节点中
      modeling.updateModdleProperties(element, businessObject, {
        extensionElements,
      });
    }
    // 判断 extensionElements 是否有 properties
    let properties = getProperties(businessObject);

    if (!properties) {
      // 创建properties属性元素
      properties = createModdleElement(
        `${prefix}:Properties`,
        { values: [] },
        extensionElements
      );
      // properties属性元素 加入到扩展元素中
      modeling.updateModdleProperties(element, extensionElements, {
        values: [...extensionElements.get("values"), properties],
      });
    }
    // 创建新属性并添加到属性节点中
    const newProperty = createModdleElement(
      `${prefix}:Property`,
      property,
      properties
    );

    //更新节点属性
    modeling.updateModdleProperties(element, properties, {
      values: [...properties?.get("values"), newProperty],
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * 删除节点中的扩展属性
 * @param {*} element
 * @param {*} property
 * @returns
 */
export function removeExtensionProperty(element, property) {
  const businessObject = getRelevantBusinessObject(element);
  const extensionElements = businessObject.get("extensionElements");
  // 获取扩展属性属性节点
  const properties = getProperties(businessObject);
  // 如果没有扩展属性节点 直接返回
  if (!properties) return;

  const modeling = getModeler.getModeling();

  // 在 属性中排除掉将要删除的values
  const values = without(properties.get("values"), property);

  // 更新节点的Properties
  modeling.updateModdleProperties(element, properties, { values });

  //如果value 为空 则删除扩展元素节点
  if (!values || !values.length) {
    modeling.updateModdleProperties(element, extensionElements, {
      values: without(extensionElements.get("values"), properties),
    });
  }
}
