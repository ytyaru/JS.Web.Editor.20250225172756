# area

　CSSプロパティ`grid-template-areas`にて画面構成を設定する。

```css
grid-template-areas:
  "html css"
  "js js"
  "log res"
;
```

* 領域
    * 名前
    * 位置（行,列）
    * 比率（要素数,連続配置によるspan数）


```css
grid-template-rows: repeat(4, 1fr);
grid-template-columns: repeat(4, 1fr);
grid-template-areas:
  "html css css css"
  "html js  js  res"
  "html js  js  res"
  "log  log log res"
;
```
①②②
①③③
④④⑤

①②②②
①③③⑤
①③③⑤
④④④⑤

①①②②②②②
①①②②②②②
①①③③③⑤⑤
①①③③③⑤⑤
①①③③③⑤⑤
④④④④④⑤⑤
④④④④④⑤⑤

```css
grid-template-rows: 1fr 2fr 1fr;
grid-template-columns: repeat(4, 1fr);
grid-template-areas:
    "html css css css"
    "html js  js  res"
    "log  log log res"
;
```

