<template>
  <!--存放画布的元素 -->
  <div :class="['bpmn-designer', bgClass]" ref="designerRef"></div>
</template>

<script>
import { debounce } from "min-dash";
import { mapGetters } from "vuex";
import { createNewDiagram } from "@utils/xml";
import { catchError } from "@utils/printCatch";
import moduleAndExtensions from "./moduleAndExtensions";
import initModeler from "./initModeler";

export default {
  name: "BpmnDesigner",
  props: {
    // 初始化是的xml文件
    xml: {
      type: String,
      default: undefined,
    },
    // 初始化是接收外部传递的事件
    events: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    /**
     * getEditor：预设的流程默认配置
     * getModeler：模型实例
     * getModeling：
     */
    ...mapGetters(["getEditor", "getModeler", "getModeling"]),

    // 用于设施设计器的背景图片
    bgClass() {
      const bg = this.getEditor.bg;
      if (bg === "grid-image") return "designer-with-bg";
      if (bg === "image") return "designer-with-image";
      return "";
    },
  },
  methods: {
    /**
     * 配置改变后重新加载流程图
     * setting：新配置
     * oldSetting：旧配置
     */
    reloadProcess: debounce(async function (setting, oldSetting) {
      // 根据配置得到需要依赖的module模块
      const modelerModules = moduleAndExtensions(setting);

      await this.$nextTick();
      // 初始化事件并且创建模型
      const modeler = initModeler(this.$refs.designerRef, modelerModules, this);
      if (!oldSetting || setting.processEngine !== oldSetting.processEngine) {
        await createNewDiagram(modeler);
      } else {
        await createNewDiagram(modeler, this.xml, setting);
      }
    }, 100),
  },
  watch: {
    /**
     * 深度监听Editor配置改变后重新加载流程图
     */
    getEditor: {
      handler: async function (value, oldValue) {
        try {
          this.reloadProcess(value, oldValue);
        } catch (e) {
          catchError(e);
        }
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>
