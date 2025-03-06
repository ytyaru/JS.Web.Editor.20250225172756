# エディタ画面分割

　画面は7つある。html,css,js,md,log,res,doc。
　将来の拡張によっては構造化テキストjson,yaml,toml,xml,csv,tsv等も追加する可能性がある。
　あるいはいっそ、md/docは別アプリにしたほうがシンプルで良いかもしれない。
　異なるエディタアプリを切替可能にして一つにまとめる形で提示してもいいだろう。

* WebEditor(html,css,js,log,res)
* MarkdownEditor(md,doc)
* DataEditor(json,yaml,toml,xml,csv,tsv,sql)

　これは次のように入出力と言語で大別できる。

* 入出力
    * src(入力)
        * html
        * css
        * js
        * md
    * dst(出力)
        * log
        * res
        * doc
* 言語
    * code(プログラミング言語)
        * html
        * css
        * js
        * log
        * res
    * doc(自然言語)
        * md
        * doc

　上記画面をどのように画面分割して表示するか。分割方法は以下。

* 1画面
* 2画面(縦/横)
* R段(1,2,3,N)

　また、同座標にある画面であってもクリック等によって別画面に切り替える方法もある。
　むしろ多画面である以上、画面切替を用いないと画面専有面積が多くなりすぎてしまう。
　かといって大量に切替画面があると一度に閲覧できなくなり理解しづらくなる。匙加減を考慮せねばならない。

* どの画面を
* どの画面に
* 切り替えるか
* どんな方法で
* いくつまで

## WebEditor(html,css,js,log,res)

　全部で5画面ある。この表示パターンを網羅する。

* ON/OFF
* 順序

　5画面(html,css,js,log,res)の順序は5!(5の階乗)であり5*4*3*2*1=120通り。さらに各画面にON/OFFがあるので2*2*2*2*2=32通り。これをかけ合わせた120*32=3840通りある。

　このパターンを端的に指定する方法は次の通り。表示したい画面の識別子を文字列として表示したい順番で並べる。未入力画面は表示されない。

```javascript
new Editor({
    show:'html css js log res',
});
```

　行数を指定するとGridLayoutのrows数を指定する。

```javascript
new Editor({
    rows: 3,
});
```

　画面の比率をどうするか。

* row=1
    * col=all
* row=2..
    * 割り切れる数
    * 割り切れぬ数
        * 末尾の端数は大きめ
        * 端数を末尾以外にする
        * 特定の行の列数を任意指定にする

　たとえば5画面あるとき、行r位置と列cの個数をそれぞれ以下のようにする。これは末尾の端数が大きめになる配置だ。

r|c
-|-
1|2
2|2
3|1

　だが以下のように、端数を末尾以外の位置にすることも可能にしたい。

r|c
-|-
1|2
2|1
3|2

　もし表示画面の順序が`html,css,js,log,res`なら`js`が大きめの画面になる。

　これを設定するには次のようにするといいか？

```javascript
new Editor({
    cols: '2 1 2', // N行目の列数
    cols: [2,1,2], // N行目の列数
});
```

　総合的にいうと以下。

```javascript
new Editor({
    show:'html css js log res',
    rows: 3,
    cols: '2 1 2', // N行目の列数
});
```

　colsを基準にすると以下。

```javascript
new Editor({
    show:'html css js log res',
    cols: 3,
    rows: '2 1 2', // N列目の行数
});
```

　rows/colsのどちらを基準にするかで、順序に対する位置が変わってくる。

```
rows基準
1 2
 3
4 5
```
```
cols基準
1 4
 3
2 5
```

　もしUIで表示する画面のON/OFFを切替可能なら、画面数が変わってレイアウトも動的変更すべき。
　これが非常に複雑化しそう。
　なので基本的に数に応じたデフォルトレイアウトを用意しておきたい。

表示画面数|R|C
----------|-|-
1|1|1
2|1|2
3|2|[2,1]
4|2|[2,2]
5|3|[2,1,2]

　ただ、画面切替を加味するとさらに複雑化する。たとえばhtml,css,jsをsrcとして一画面にまとめて切替、log,resも同様に一画面として、全２画面とする場合もありえる。

　複数画面を一つにまとめて切り替える場合、次のように指定する。

```javascript
new Editor({
    show:['html css js', 'log res'],
});
```

　このとき画面数は2になる。デフォルト配置はr1c2である。つまり以下のように設定したのと同じ。

```javascript
new Editor({
    show:['html css js', 'log res'],
    rows: 1,
    cols: '1 1', // N行目の列数
});
```

　画面を切り替える方法は次のように指定する。`tap`と`click`は同じ。キーボードではどうするか。ショートカットキーとの兼ね合いまで考えねばならないため複雑になる。

```javascript
new Editor({
    switchScreen: 'tap', 'tap/click'/'double-tap/click'/'hold'/'menu'
});
```

　switch画面の指定方法はどうするか。複雑な場合、以下のように文字列の配列をつくらねばならず少々面倒。

```javascript
new Editor({
    show:['html', 'css', 'js', 'log res'],
    rows: 2,
    cols: '2 2', // N行目の列数
});
```

```javascript
    show:'html css js log res',
    show:['html css js', 'log res'],
    show:['html', 'css', 'js', 'log res'],
    show:'html-css-js log-res', // switchする画面はハイフンでつなげ、分割する画面はスペースで区切る
    show:'html css js log-res', // switchする画面はハイフンでつなげ、分割する画面はスペースで区切る
```

## 1画面

　もし表示すべき画面種が少なければ1画面でもいい。たとえばhtmlとresのみなら画面切替ボタンを用意して二画面を切り替える。

　もし表示すべき画面種が多ければ切替に手間取る。7画面すべてを表示するには、最後の画面を表示するのに7回クリックが必要。

　もしディスプレイが小さくとも一度に複数の画面を表示したほうがクリックの手間が省ける。ただし、特に興味もないコードなら一画面分で隠したほうがスクロールが速くて済む。

* 1
    * html/css/js/md/log/res/doc
* 2
    * html + res
    * js + log
    * js + res
    * md + doc
    * html/css/js/md + log/res/doc
* 3
    * html + css + res
    * html + js + res
    * js + log + res
* 4
    * html + css + js + res
    * html + js + log + res
    * html + res + md + doc
    * js + res + md + doc
* 5
    * html + css + js + log + res
* 7
    * html + css + js + log + res + md + doc
        * 2画面切替
            * code: html/css/js + log/res
            * doc : md          + doc
        * 4/2画面切替
            * code: html,css,js,log/res
            * doc : md          + doc

## 2画面(縦/横)

　最低でも2画面表示くらいはしたい。このとき大別するなら以下のパターンになる。

* 入力 + 出力
* 自然言語 + プログラミング言語

　ただし、プログラミング言語の場合はソースコードと出力結果を同時表示できないため、画面遷移が面倒になるだろう。

## R段(1,2,3,N)


```javascript
const editor1 = new Editor({
    width:'100%', 
    height:300, 
    q:'#editor-0',
    id: `web-editor-${this._idNo}`,
    name: `web-editor-${this._idNo}`,
    row: 1, // 1,2,3,...(0以下なら1行1要素のみ。要素数より多い数なら1行1要素)
    html:'',
    css:'',
    js:'',
    md:'',
    color:'light',
});
```

