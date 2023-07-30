# 文件下载的方式

## 文件流下载

```ts
/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
export function downloadByData(
  data: string | BufferSource | Blob,
  filename: string, // 文件名称
  mime?: string, // MIME 类型
  bom?: string | BufferSource | Blob
) {
  // 文件内容
  const blobData = typeof bom !== "undefined" ? [bom, data] : [data];

  // 创建blob对象
  const blob = new Blob(blobData, { type: mime || "application/octet-stream" });

  //返回该 Blob 的对象 URL
  const blobURL = window.URL.createObjectURL(blob);

  const tempLink = document.createElement("a");
  tempLink.style.display = "none";
  tempLink.href = blobURL;
  tempLink.setAttribute("download", filename);
  if (typeof tempLink.download === "undefined") {
    tempLink.setAttribute("target", "_blank");
  }
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  window.URL.revokeObjectURL(blobURL);
}
```

## 文件地址下载

```ts
interface downloadByUrlParams {
  url: string;
  target?: '_blank' || '_target';
  fileName?: string;
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({
  url,
  target = "_blank",
  fileName,
}: downloadByUrlParams): boolean {

    // 判断浏览器类型
  const isChrome =
    window.navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
  const isSafari =
    window.navigator.userAgent.toLowerCase().indexOf("safari") > -1;

  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error("Your browser does not support download!");
    return false;
  }
  if (isChrome || isSafari) {
    const link = document.createElement("a");
    link.href = url;
    link.target = target;

    if (link.download !== undefined) {
      link.download =
        fileName || url.substring(url.lastIndexOf("/") + 1, url.length);
    }

    if (document.createEvent) {
      const e = document.createEvent("MouseEvents");
      e.initEvent("click", true, true);
      link.dispatchEvent(e);
      return true;
    }
  }
  if (url.indexOf("?") === -1) {
    url += "?download";
  }

  openWindow(url, { target });
  return true;
}
```

## base64 流下载

> 将 dataUrl 格式改为 blob , 然后以文件流的形式下载

```ts
/**
 * @description: base64 to blob
 */
export function dataURLtoBlob(base64Buf: string): Blob {
  const arr = base64Buf.split(",");
  const typeItem = arr[0];
  const mime = typeItem.match(/:(.*?);/)![1];

  // 对文件内容进行解码
  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Download pictures based on base64
 * @param buf
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByBase64(
  buf: string,
  filename: string,
  mime?: string,
  bom?: string | BufferSource | Blob
) {
  const base64Buf = dataURLtoBlob(buf);
  downloadByData(base64Buf, filename, mime, bom);
}
```

## 图片 Url 下载

> 图片 Url 下载,如果有跨域问题，需要处理图片跨域
> 将图片展示在画布中 可以读取到 cavas 的 DataURl

```ts
/**
 * img url to base64
 * @param url
 */
export function urlToBase64(url: string, mineType?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement(
      "CANVAS"
    ) as Nullable<HTMLCanvasElement>;
    const ctx = canvas!.getContext("2d");

    const img = new Image();
    img.crossOrigin = "";
    img.onload = function () {
      if (!canvas || !ctx) {
        return reject();
      }
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL(mineType || "image/png");
      canvas = null;
      resolve(dataURL);
    };
    img.src = url;
  });
}


/**
 * Download online pictures
 * @param url
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByOnlineUrl(
  url: string,
  filename: string,
  mime?: string,
  bom?: BlobPart
) {
  urlToBase64(url).then((base64) => {
    downloadByBase64(base64, filename, mime, bom);
  });
}
```
