## 参考

- https://juejin.cn/post/6844904017584193544?searchId=2023073011243208A1471B4F08A5F5E9B0

![image.png](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/10/16eeea0f565dccaf~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)

重点

> modeling = getModeler.getModeling();
>
> - 元素的创建 更新 移动等 都通过这个对象控制
> - modeling.updateModdleProperties 用于更新节点

> createModdleElement
>
> - 创建节点

> bpmnFactory 用于在代码中动态创建 BPMN 元素。
>
> - bpmnFactory?.create("bpmn:Documentation")

预览模式 BpmnViewer

```js
import BpmnViewer from "bpmn-js";
import testDiagram from "./test-diagram.bpmn";

var viewer = new BpmnViewer({
  container: "#canvas",
});

viewer.importXML(testDiagram, function (err) {
  if (!err) {
    console.log("success!");
    viewer.get("canvas").zoom("fit-viewport");
  } else {
    console.log("something went wrong:", err);
  }
});
```

编辑模式 BpmnModeler

```js
// 引入相关的依赖
import BpmnModeler from "bpmn-js/lib/Modeler";

// 建模器
const bpmnModeler = new BpmnModeler({
  container: canvas,
});

// 将字符串转换成图显示出来
bpmnModeler.importXML(xmlStr, (err) => {
  if (err) {
    // console.error(err)
  } else {
    // 这里是成功之后的回调, 可以在这里做一系列事情
    // console.log('创建成功!')
  }
});
```

## 建模

```js
//Modeler 有哪些模块
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import TouchModule from "diagram-js/lib/navigation/touch";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";

import AlignElementsModule from "diagram-js/lib/features/align-elements";
import AutoPlaceModule from "./features/auto-place";
import AutoResizeModule from "./features/auto-resize";
import AutoScrollModule from "diagram-js/lib/features/auto-scroll";
import BendpointsModule from "diagram-js/lib/features/bendpoints";
import ConnectModule from "diagram-js/lib/features/connect";
import ConnectionPreviewModule from "diagram-js/lib/features/connection-preview";
import ContextPadModule from "./features/context-pad";
import CopyPasteModule from "./features/copy-paste";
import CreateModule from "diagram-js/lib/features/create";
import DistributeElementsModule from "./features/distribute-elements";
import EditorActionsModule from "./features/editor-actions";
import GridSnappingModule from "./features/grid-snapping";
import InteractionEventsModule from "./features/interaction-events";
import KeyboardModule from "./features/keyboard";
import KeyboardMoveSelectionModule from "diagram-js/lib/features/keyboard-move-selection";
import LabelEditingModule from "./features/label-editing";
import ModelingModule from "./features/modeling";
import MoveModule from "diagram-js/lib/features/move";
import PaletteModule from "./features/palette";
import ReplacePreviewModule from "./features/replace-preview";
import ResizeModule from "diagram-js/lib/features/resize";
import SnappingModule from "./features/snapping";
import SearchModule from "./features/search";
```

additionalModules: 为 Modeler 添加需要的组件功能

```js
const bpmnViewer = new Viewer({
  additionalModules: [
    MoveModule, // 可以调整元素
    ModelingModule, // 基础工具 MoveModule、SetColor 等依赖于此
    MoveCanvasModule, // 移动整个画布
  ],
});
```

可以对模块进行重构

```js
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll/ZoomScroll";

ZoomScrollModule.prototype.scroll = () => {}; // 只要原型链上这个方法为空即可，方法有很多。

export default {
  __init__: ["zoomScroll"],
  zoomScroll: ["type", ZoomScrollModule],
};

// 然后注入到

import Viewer from "bpmn-js/lib/Viewer";
import MoveModule from "diagram-js/lib/features/move";
import ModelingModule from "bpmn-js/lib/features/modeling";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import zoomScroll from "./zoomScroll.js"; // 📌注意是使用自己定义过的哦~

const bpmnViewer = new Viewer({
  additionalModules: [
    MoveModule, // 可以调整元素
    ModelingModule, // 基础工具 MoveModule、SetColor 等依赖于此
    MoveCanvasModule, // 移动整个画布
    zoomScroll, // 放大缩小
  ],
});
```

常用的一些模块

> translate

设置 xml 解析配置文件

```js
moddle["activiti"] = activitiModdleDescriptors;

moddle["camunda"] = camundaModdleDescriptors;

moddle["flowable"] = flowableModdleDescriptors;

// 设置自定义属性
moddle["miyue"] = miyueModdleDescriptors;
```

## 事件监听

modeler

```js
// 监听画布改变
modeler.on("commandStack.changed", async (event) => {
  try {
    const { xml } = await modeler.saveXML({ format: true });

    context.$emit("update:xml", xml);
    // context.$emit("command-stack-changed", event);
  } catch (error) {
    catchError(error);
  }
});
```

```js
// 监听节点创建
modeler.on("commandStack.elements.create.preExecute", (event) => {
  console.log("create", event);
  const {
    context: { elements },
  } = event;
  if (elements[0] && elements[0].type === "bpmn:UserTask") {
    addExtensionProperty(elements[0], { name: "111", value: "1231" });
  }
  return event;
});
```

```js
modeler.on("commandStack.shape.replace.preExecute", (event) => {
  console.log("replace", event);
  const {
    context: { newShape, newData },
  } = event;
  if (newData && newData.type === "bpmn:UserTask") {
    addExtensionProperty(newData.businessObject, {
      name: "111",
      value: "1231",
    });
  }
  return event;
});
```

### palette(左侧工具栏)

引入以下样式就可以是左侧工具栏显示出来**不需要在 additionalModules 中添加任何组件**

```css
@import "bpmn-js/dist/assets/diagram-js.css"; // 基础样式
@import "bpmn-js/dist/assets/bpmn-js.css"; // 基础样式
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css"; // 节点基础图标
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css"; // 节点完整图标
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css"; // 节点完整图标
```

bpmn 中提供添加小地图 `diagram-js-minimap`依赖

```js
// 小地图
import minimapModule from "diagram-js-minimap";
const bpmnViewer = new Viewer({
  additionalModules: [minimapModule],
});
```

```css
// 小地图
@import "diagram-js-minimap/assets/diagram-js-minimap.css";
```

### properties-panel(属性栏)

## context-pad(overlay)

## 事件列表

| 事件名称                 | 效果             | 监听对象 |
| ------------------------ | ---------------- | -------- |
| "canvas.viewbox.changed" | 流程图缩放比变化 | modeler  |
