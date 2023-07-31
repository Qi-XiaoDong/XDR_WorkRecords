import Vue from "vue";
import Vuex from "vuex";
import { defaultSettings } from "../preset-configuration/editor.config";
import { unObserver } from "@utils/tool";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    // 预设的默认流程配置
    editor: { ...defaultSettings },
    bpmn: {},
  },
  getters: {
    //  editor
    getEditor: (state) => state.editor,
    getProcessDef: (state) => ({
      processName: state.editor.processName,
      processId: state.editor.processId,
    }),
    // 当前使用的流程解析器
    getProcessEngine: (state) => state.editor.processEngine,
    getEditorConfig: (state) => {
      return Object.keys(state.editor).reduce((config, key) => {
        if (!["processName", "processId", "processEngine"].includes(key)) {
          config[key] = state.editor[key];
        }
        return config;
      }, {});
    },

    // modeler 模型实例
    getModeler: (state) => state.bpmn._modeler,

    //modeling 是一个用于执行模型编辑操作的 API 或对象
    getModeling: (state) =>
      state.bpmn._modeler ? state.bpmn._modeler.get("modeling") : undefined,

    // 当前激活的节点
    getActive: (state) => state.bpmn.activeElement,
  },
  mutations: {
    // editor
    setConfiguration(state, conf) {
      state.editor = { ...state.editor, ...conf };
    },

    clearBpmnState(state) {
      state.bpmn = {};
    },
    /**
     * @param state
     * @param modeler { object }
     */
    setModeler(state, modeler) {
      state.bpmn._modeler = unObserver(modeler);
    },
    /**
     * @param state
     * @param key { string }
     * @param module { object }
     */
    // setModules(state, { key, module }) {
    //   // state.bpmn[`_${key}`] = Object.freeze(module);
    // },
    /**
     * @param state
     * @param id { string }
     * @param element { object }
     */
    setElement(state, { element, id }) {
      state.bpmn.activeElement = { element: unObserver(element), id };
    },
  },
});

export default store;
