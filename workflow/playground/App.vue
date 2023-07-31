<template>
  <div id="app">
    <!-- 工具栏 -->
    <bpmn-toolbar v-if="getEditorConfig.toolbar" />
    <div class="main-content">
      <!-- 设计器 -->
      <bpmn-designer :xml.sync="xmlString" />
      <!-- 右侧属性栏 自定义 -->
      <bpmn-panel v-if="getEditorConfig.penalMode === 'custom'" />
      <div v-else class="camunda-panel" id="camunda-panel"></div>
    </div>
    <bpmn-settings />
    <bpmn-context-menu />
  </div>
</template>

<script>
import BpmnDesigner from "../packages/components/Designer";
import BpmnSettings from "../packages/components/Settings";
import { mapGetters } from "vuex";
import BpmnToolbar from "../packages/components/Toolbar";
import BpmnContextMenu from "@packages/components/ContextMenu/ContextMenu";
import BpmnPanel from "@packages/components/Panel";
export default {
  name: "App",
  components: {
    BpmnPanel,
    BpmnContextMenu,
    BpmnToolbar,
    BpmnSettings,
    BpmnDesigner,
  },
  data() {
    return {
      xmlString: undefined,
    };
  },
  computed: {
    // getEditorConfig 流程配置文件
    ...mapGetters(["getEditorConfig"]),
  },
  mounted() {
    document.body.addEventListener("contextmenu", function (ev) {
      ev.preventDefault();
    });
  },
};
</script>
