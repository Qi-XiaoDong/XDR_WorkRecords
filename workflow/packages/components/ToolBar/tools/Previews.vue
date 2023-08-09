<template>
  <el-button v-popover:popover type="primary">
    预览文件
    <el-popover
      ref="popover"
      placement="bottom"
      popper-class="button-popover"
      trigger="hover"
    >
      <div class="button-list_column">
        <el-button type="primary" @click="openPreviewModel('xml')"
          >预览 XML</el-button
        >
        <el-button type="primary" @click="openJsonPreviewModel('Json')"
          >预览 JSON</el-button
        >
      </div>
    </el-popover>

    <el-dialog
      :title="modelTitle"
      :visible.sync="codeModelVisible"
      width="72vw"
      append-to-body
      destroy-on-close
    >
      <div class="preview-model">
        <highlightjs :code="codeString" :language="codeLanguage" />
      </div>
    </el-dialog>
  </el-button>
</template>

<script>
import { mapGetters } from "vuex";
import { catchError } from "@utils/printCatch";

export default {
  name: "BpmnPreviews",
  computed: {
    ...mapGetters(["getModeler"]),
    modelTitle() {
      return this.codeLanguage === "xml" ? "预览 XML" : "预览 JSON";
    },
  },
  data() {
    return {
      codeLanguage: "xml",
      originXml: "",
      codeString: "",
      codeModelVisible: false,
    };
  },
  // watch:{
  //   ""() {
  //     if (!this.originXml) return this.originXml
  //     if (this.codeLanguage ==="xml") return this.originXml
  //     if (this.codeLanguage ==="Json"){
  //       const jsonStr = await this.getModeler.get("moddle").fromXML(xml);
  //         this.codeString = JSON.stringify(jsonStr, null, 2);
  //     }
  //   }
  // },
  methods: {
    /**
     * 打开预览窗口
     * @param {xml | Json} type 预览的格式
     */
    async openPreviewModel(type) {
      try {
        if (!this.getModeler) {
          return this.$message.error("流程图引擎初始化失败");
        }
        this.codeLanguage = type;
        this.codeModelVisible = true;
        /**
         * format: true：表示保存的 XML 将以可读性更好的格式进行排版，使其更易于阅读。
         *   preamble: true：表示保存的 XML 将包含 XML 前导信息，即 XML 的声明。
         */
        const { xml } = await this.getModeler.saveXML({
          format: true,
          preamble: true,
        });
        if (type === "xml") {
          this.codeString = xml;
        } else {
          const jsonStr = await this.getModeler.get("moddle").fromXML(xml);
          this.codeString = JSON.stringify(jsonStr, null, 2);
        }
      } catch (error) {}
    },
  },
};
</script>
