vue 中 watch 中监听多个响应式数据

```js
// 配置式写法
computed:{
    formIdAndRender()  {
      return {
        formId:this.form.formId,
        formIdChangeAction:this.formChangeAction.formIdChangeAction,
      }
    },
  watch: {
    formIdAndRender:{
      async handler(newValue,oldValue) {
        const {formId,formIdChangeAction} = newValue
        //在这里将会监听到formId、formIdChangeAction的变化
      },
    },
  }


```

vue 中强制刷新组件的方式

1. 利用 v-if

```js
import { nextTick, ref } from "vue";
const renderComponent = ref(true);

const forceRerender = async () => {
  // Remove MyComponent from the DOM
  renderComponent.value = false;

  // Wait for the change to get flushed to the DOM
  await nextTick();

  // Add the component back in
  renderComponent.value = true;
};
```

```js
export default {
  data() {
    return {
      renderComponent: true,
    };
  },
  methods: {
    async forceRerender() {
      // Remove MyComponent from the DOM
      this.renderComponent = false;

      // Wait for the change to get flushed to the DOM
      await this.$nextTick();

      // Add the component back in
      this.renderComponent = true;
    },
  },
};
```

2. 使用 Vue 内置的 forceUpdate 方法
   > 只会强制视图刷新

```js
import { getCurrentInstance } from "vue";

const methodThatForcesUpdate = () => {
  const instance = getCurrentInstance();
  instance.proxy.forceUpdate();
};
```

```js
export default {
  methods: {
    methodThatForcesUpdate() {
      this.$forceUpdate();
    },
  },
};
```

使用 Key-Changing Technique 来刷新你的组件

```js
import { ref } from "vue";
const componentKey = ref(0);

const forceRerender = () => {
  componentKey.value += 1;
};
```

```js
export default {
  data() {
    return {
      componentKey: 0,
    };
  },
  methods: {
    forceRerender() {
      this.componentKey += 1;
    },
  },
};
```
