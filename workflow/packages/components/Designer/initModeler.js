/**
 *
 * @param {*} designerDom // 放置流程图的dom
 * @param {*} moduleAndExtensions  当前流程依赖的module信息
 * @param {*} context 调用该方法的vue组件实例，因为需要使用到 getModeler 和 EventBus
 * @returns
 */
export default function (designerDom, moduleAndExtensions, context) {
  // 模型配置
  const options = {
    container: designerDom,
    additionalModules: moduleAndExtensions[0] || [],
    moddleExtensions: moduleAndExtensions[1] || {},
    ...moduleAndExtensions[2],
  };

  // 清除旧 modeler
  context.getModeler && context.getModeler.destroy();
  context.$store.commit("clearBpmnState");

  // 创建新的模型
  const modeler = new Modeler(options);

  // 新的模型存储到store
  context.$store.commit("setModeler", modeler);

  // 触发模型初始化事件
  EventEmitter.emit("modeler-init", modeler);

  // 初始化模型是外界监听的流程事件
  context.events?.forEach((event) => {
    // 模型添加事件
    modeler.on(event, function (eventObj) {
      let eventName = event.replace(/\./g, "-");
      let element = eventObj ? eventObj.element : null;
      //触发事件
      context.$emit(eventName, unObserver({ element, eventObj }));
    });
  });

  /**
   * 监听图像变化事件
   */
  modeler.on("commandStack.changed", async (event) => {
    try {
      const { xml } = await modeler.saveXML({ format: true });
      // 外界 通过 xml.async 方法实现了对xml双向绑定  触发 context.$emit("update:xml", xml);通知外界
      context.$emit("update:xml", xml);
      context.$emit("command-stack-changed", event);
    } catch (error) {
      catchError(error);
    }
  });

  // 右键菜单
  // EnhancementContextmenu(modeler, context.getEditor);

  // // 功能测试部分，可删除
  // modeler.on("commandStack.elements.create.preExecute", (event) => {
  //   console.log("create", event);
  //   const {
  //     context: { elements },
  //   } = event;
  //   if (elements[0] && elements[0].type === "bpmn:UserTask") {
  //     addExtensionProperty(elements[0], { name: "111", value: "1231" });
  //   }
  //   return event;
  // });

  // modeler.on("commandStack.shape.replace.preExecute", (event) => {
  //   console.log("replace", event);
  //   debugger;
  //   const {
  //     context: { newShape, newData },
  //   } = event;
  //   if (newData && newData.type === "bpmn:UserTask") {
  //     addExtensionProperty(newData.businessObject, {
  //       name: "111",
  //       value: "1231",
  //     });
  //   }
  //   return event;
  // });

  // console.log(modeler);

  return modeler;
}
