# 構文ハイライト

　ソースコードを構文ハイライトしたい。

　これが非常に厄介。方法は以下4通りある。

1. textarea 
2. textarea + div
3. div.contenteditable
4. CodeMirror等の外部エディタ
5. [Edit Context API][]
6. [CSS Custom Highlight API][]

[Edit Context API]:https://zenn.dev/cybozu_frontend/articles/5667796d4168bc
[CSS Custom Highlight API]:https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API

## 1. textarea

　構文ハイライトを諦めた方法。最も簡単に実装できる。

## 2. textarea + div

　入力時は構文ハイライトできない方法。

　入力と表示で要素を分ける。フォーカスが当たると入力モードになりハイライトが消えてTextAreaに入力する状態になる。

場面|要素
----|----
入力|`textarea`
表示|`div`

## 3. div.contenteditable

　入力、表示、共に`div`等のHTML要素一つで実装する。入力時も含めて常に構文ハイライトされる。ただし、肝となる`contenteditable`には膨大な問題がある。

* 挙動がOS等の実装により違う
* 足りない機能だらけ（大量の自前実装が必要）
* 実装には各種イベント、改行、キャレット位置、IME挙動、コピー／ペーストなどを考慮せねばならず、それぞれに罠があり、その罠が相互に関わって超複雑な魔窟

## 4. CodeMirror等の外部エディタ

* CodeMirror
    * EMS必須のためHTTPS環境でしか使用できない
    * CDNがなくNode.jsでしか使用できない
* Ace
    * 未調査

## 5. [Edit Context API][]

　新しいブラウザでしか使用できない。

## 6. [CSS Custom Highlight API][]

　新しいブラウザでしか使用できない。

